import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { Task } from '../models/task.model';

export interface SocketEvent {
  type: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket | null = null;
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private eventSubject = new Subject<SocketEvent>();
  private currentUserId: string | null = null;

  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  public events$ = this.eventSubject.asObservable();

  constructor() {
    // WebSocket service without circular dependency
  }

  connect(token: string, userId: string): void {
    // Check if WebSocket is enabled in environment
    if (!environment.enableWebSocket) {
      return;
    }

    if (this.socket?.connected) {
      this.disconnect();
    }

    if (!token) {
      console.warn('No auth token available for WebSocket connection');
      return;
    }

    this.currentUserId = userId;

    // Small delay to ensure user ID is properly set
    setTimeout(() => {
      try {
        // Remove /api from the URL for WebSocket connection
        const wsUrl = environment.apiUrl.replace('/api', '');
        this.socket = io(wsUrl, {
          auth: {
            token: token
          },
          transports: ['websocket', 'polling'],
          timeout: 5000,
          forceNew: true,
          autoConnect: true,
          reconnection: false // Disable auto-reconnection to prevent continuous errors
        });
        
        this.setupEventListeners();
      } catch (error) {
        console.warn('WebSocket connection failed, continuing without real-time updates:', error);
        this.socket = null;
        return;
      }
    }, 100);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentUserId = null;
      this.connectionStatusSubject.next(false);
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.connectionStatusSubject.next(true);
      
      // Join user's personal room for task updates
      if (this.currentUserId) {
        this.socket?.emit('join_user_room', this.currentUserId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.connectionStatusSubject.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.warn('WebSocket connection error (continuing without real-time updates):', error.message || error);
      this.connectionStatusSubject.next(false);
      // Disconnect to prevent continuous retry attempts
      this.disconnect();
    });

    // Task-related events
    this.socket.on('task_created', (task: Task) => {
      this.eventSubject.next({ type: 'task_created', data: task });
    });

    this.socket.on('task_updated', (task: Task) => {
      this.eventSubject.next({ type: 'task_updated', data: task });
    });

    this.socket.on('task_deleted', (taskId: string) => {
      this.eventSubject.next({ type: 'task_deleted', data: { taskId } });
    });

    this.socket.on('tasks_bulk_updated', (data: { taskIds: string[], updateData: any }) => {
      this.eventSubject.next({ type: 'tasks_bulk_updated', data });
    });

    this.socket.on('tasks_bulk_deleted', (data: { taskIds: string[] }) => {
      this.eventSubject.next({ type: 'tasks_bulk_deleted', data });
    });

    // User-related events
    this.socket.on('user_updated', (user: any) => {
      this.eventSubject.next({ type: 'user_updated', data: user });
    });

    // System events
    this.socket.on('notification', (notification: any) => {
      this.eventSubject.next({ type: 'notification', data: notification });
    });
  }

  // Emit events to server
  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  }

  // Join a specific room
  joinRoom(roomId: string): void {
    this.emit('join_room', roomId);
  }

  // Leave a specific room
  leaveRoom(roomId: string): void {
    this.emit('leave_room', roomId);
  }

  // Observable factories for specific event types
  onTaskCreated(): Observable<Task> {
    return new Observable(observer => {
      const subscription = this.events$.subscribe(event => {
        if (event.type === 'task_created') {
          observer.next(event.data);
        }
      });
      return () => subscription.unsubscribe();
    });
  }

  onTaskUpdated(): Observable<Task> {
    return new Observable(observer => {
      const subscription = this.events$.subscribe(event => {
        if (event.type === 'task_updated') {
          observer.next(event.data);
        }
      });
      return () => subscription.unsubscribe();
    });
  }

  onTaskDeleted(): Observable<string> {
    return new Observable(observer => {
      const subscription = this.events$.subscribe(event => {
        if (event.type === 'task_deleted') {
          observer.next(event.data.taskId);
        }
      });
      return () => subscription.unsubscribe();
    });
  }

  onTasksBulkUpdated(): Observable<{ taskIds: string[], updateData: any }> {
    return new Observable(observer => {
      const subscription = this.events$.subscribe(event => {
        if (event.type === 'tasks_bulk_updated') {
          observer.next(event.data);
        }
      });
      return () => subscription.unsubscribe();
    });
  }

  onTasksBulkDeleted(): Observable<{ taskIds: string[] }> {
    return new Observable(observer => {
      const subscription = this.events$.subscribe(event => {
        if (event.type === 'tasks_bulk_deleted') {
          observer.next(event.data);
        }
      });
      return () => subscription.unsubscribe();
    });
  }

  onNotification(): Observable<any> {
    return new Observable(observer => {
      const subscription = this.events$.subscribe(event => {
        if (event.type === 'notification') {
          observer.next(event.data);
        }
      });
      return () => subscription.unsubscribe();
    });
  }

  get isConnected(): boolean {
    return this.connectionStatusSubject.value;
  }
}
