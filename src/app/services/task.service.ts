import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskResponse, TaskListResponse, TaskFilter, TaskStatus } from '../models/task.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly API_URL = environment.apiUrl;
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public tasks$ = this.tasksSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  getTasks(filter?: TaskFilter): Observable<TaskListResponse> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    
    if (filter) {
      if (filter.status?.length) {
        params = params.set('status', filter.status.join(','));
      }
      if (filter.priority?.length) {
        params = params.set('priority', filter.priority.join(','));
      }
      if (filter.tags?.length) {
        params = params.set('tags', filter.tags.join(','));
      }
      if (filter.search) {
        params = params.set('search', filter.search);
      }
      if (filter.page) {
        params = params.set('page', filter.page.toString());
      }
      if (filter.limit) {
        params = params.set('limit', filter.limit.toString());
      }
      if (filter.sortBy) {
        params = params.set('sortBy', filter.sortBy);
      }
      if (filter.sortOrder) {
        params = params.set('sortOrder', filter.sortOrder);
      }
    }

    return this.http.get<TaskListResponse>(`${this.API_URL}/tasks`, { params })
      .pipe(
        tap(response => {
          this.loadingSubject.next(false);
          if (response.success) {
            this.tasksSubject.next(response.data);
          }
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          throw error;
        })
      );
  }

  getTaskById(id: string): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${this.API_URL}/tasks/${id}`)
      .pipe(catchError(this.handleError));
  }

  createTask(taskData: CreateTaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(`${this.API_URL}/tasks`, taskData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.refreshTasks();
          }
        }),
        catchError(this.handleError)
      );
  }

  updateTask(id: string, taskData: UpdateTaskRequest): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(`${this.API_URL}/tasks/${id}`, taskData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.refreshTasks();
          }
        }),
        catchError(this.handleError)
      );
  }

  deleteTask(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/tasks/${id}`)
      .pipe(
        tap(response => {
          if (response.success) {
            this.refreshTasks();
          }
        }),
        catchError(this.handleError)
      );
  }

  bulkUpdateTasks(taskIds: string[], updateData: UpdateTaskRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.API_URL}/tasks/bulk-update`, {
      taskIds,
      updateData
    })
    .pipe(
      tap(response => {
        if (response.success) {
          this.refreshTasks();
        }
      }),
      catchError(this.handleError)
    );
  }

  bulkDeleteTasks(taskIds: string[]): Observable<ApiResponse<any>> {
    return this.http.request<ApiResponse<any>>('delete', `${this.API_URL}/tasks/bulk-delete`, {
      body: { taskIds }
    })
    .pipe(
      tap(response => {
        if (response.success) {
          this.refreshTasks();
        }
      }),
      catchError(this.handleError)
    );
  }

  getTaskStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/tasks/stats`)
      .pipe(catchError(this.handleError));
  }

  getOverdueTasks(): Observable<TaskListResponse> {
    return this.http.get<TaskListResponse>(`${this.API_URL}/tasks/overdue`)
      .pipe(catchError(this.handleError));
  }

  getTasksDueThisWeek(): Observable<TaskListResponse> {
    return this.http.get<TaskListResponse>(`${this.API_URL}/tasks/due-this-week`)
      .pipe(catchError(this.handleError));
  }

  searchTasks(query: string): Observable<TaskListResponse> {
    const params = new HttpParams().set('search', query);
    return this.http.get<TaskListResponse>(`${this.API_URL}/tasks/search`, { params })
      .pipe(catchError(this.handleError));
  }

  markAsCompleted(id: string): Observable<TaskResponse> {
    return this.updateTask(id, { status: TaskStatus.COMPLETED });
  }

  markAsInProgress(id: string): Observable<TaskResponse> {
    return this.updateTask(id, { status: TaskStatus.IN_PROGRESS });
  }

  markAsPending(id: string): Observable<TaskResponse> {
    return this.updateTask(id, { status: TaskStatus.PENDING });
  }

  private refreshTasks(): void {
    // Refresh the current task list
    this.getTasks().subscribe();
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw errorMessage;
  }

  // Utility methods
  get currentTasks(): Task[] {
    return this.tasksSubject.value;
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.currentTasks.filter(task => task.status === status);
  }

  getCompletedTasks(): Task[] {
    return this.getTasksByStatus(TaskStatus.COMPLETED);
  }

  getPendingTasks(): Task[] {
    return this.getTasksByStatus(TaskStatus.PENDING);
  }

  getInProgressTasks(): Task[] {
    return this.getTasksByStatus(TaskStatus.IN_PROGRESS);
  }
}
