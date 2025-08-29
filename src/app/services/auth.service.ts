import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, AuthResponse, UpdateProfileRequest, ChangePasswordRequest } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../environments/environment';
import { WebSocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private http = inject(HttpClient);
  private webSocketService = inject(WebSocketService);

  // Modern signal-based state management
  private currentUserSignal = signal<User | null>(null);
  private authStatusSignal = signal<'idle' | 'loading' | 'authenticated' | 'unauthenticated'>('idle');

  // Public readonly signals
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly authStatus = this.authStatusSignal.asReadonly();
  
  // Computed signals for derived state
  readonly isLoggedIn = computed(() => this.authStatus() === 'authenticated');
  readonly isLoading = computed(() => this.authStatus() === 'loading');
  readonly isAuthenticated = computed(() => !!this.currentUser() && this.isLoggedIn());
  
  // User info computed signals
  readonly userDisplayName = computed(() => {
    const user = this.currentUser();
    return user ? (user.fullName || user.username) : '';
  });
  
  readonly userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    
    if (user.fullName) {
      return user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  });

  constructor() {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const token = this.getToken();
    const user = this.getStoredUser();
    
    if (token && user && !this.isTokenExpired()) {
      // Handle both old format (id) and new format (_id)
      const userId = user._id || user.id;
      
      this.currentUserSignal.set(user);
      this.authStatusSignal.set('authenticated');
      // Connect WebSocket for existing authenticated user (optional - will fail gracefully if server doesn't support it)
      try {
        this.webSocketService.connect(token, userId as string);
      } catch (error) {
        console.warn('WebSocket connection failed, continuing without real-time updates');
      }
    } else {
      this.authStatusSignal.set('unauthenticated');
      this.clearStorage();
    }
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    this.authStatusSignal.set('loading');
    
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, userData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.handleAuthSuccess(response);
          } else {
            this.authStatusSignal.set('unauthenticated');
          }
        }),
        catchError(error => {
          this.authStatusSignal.set('unauthenticated');
          return this.handleError(error);
        })
      );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.authStatusSignal.set('loading');
    
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success) {
            this.handleAuthSuccess(response);
          } else {
            this.authStatusSignal.set('unauthenticated');
          }
        }),
        catchError(error => {
          this.authStatusSignal.set('unauthenticated');
          return this.handleError(error);
        })
      );
  }

  logout(): Observable<any> {
    this.authStatusSignal.set('loading');
    
    return this.http.post(`${this.API_URL}/auth/logout`, {})
      .pipe(
        tap(() => {
          this.handleLogout();
        }),
        catchError(() => {
          // Even if logout fails on server, clear local storage
          this.handleLogout();
          return throwError('Logout failed on server');
        })
      );
  }

  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.API_URL}/auth/profile`)
      .pipe(
        tap(response => {
          if (response.success) {
            this.currentUserSignal.set(response.data);
            this.storeUser(response.data);
            if (this.authStatus() !== 'authenticated') {
              this.authStatusSignal.set('authenticated');
            }
          }
        }),
        catchError(this.handleError)
      );
  }

  updateProfile(userData: UpdateProfileRequest): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.API_URL}/auth/profile`, userData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.currentUserSignal.set(response.data);
            this.storeUser(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  changePassword(passwordData: ChangePasswordRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.API_URL}/auth/change-password`, passwordData)
      .pipe(catchError(this.handleError));
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/refresh-token`, { refreshToken })
      .pipe(
        tap(response => {
          if (response.success) {
            this.storeToken(response.data.tokens.accessToken);
            this.storeRefreshToken(response.data.tokens.refreshToken);
            // Update user if provided in response
            if (response.data.user) {
              this.currentUserSignal.set(response.data.user);
              this.storeUser(response.data.user);
            }
            this.authStatusSignal.set('authenticated');
          }
        }),
        catchError(error => {
          this.handleLogout();
          return this.handleError(error);
        })
      );
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this.storeToken(response.data.tokens.accessToken);
    this.storeRefreshToken(response.data.tokens.refreshToken);
    this.storeUser(response.data.user);
    this.currentUserSignal.set(response.data.user);
    this.authStatusSignal.set('authenticated');
    
    // Handle both old format (id) and new format (_id)
    const userId = response.data.user._id || response.data.user.id;
    
    // Connect WebSocket for real-time updates (optional - will fail gracefully if server doesn't support it)
    try {
      this.webSocketService.connect(response.data.tokens.accessToken, userId as string);
    } catch (error) {
      console.warn('WebSocket connection failed, continuing without real-time updates');
    }
  }

  private handleLogout(): void {
    this.clearStorage();
    this.currentUserSignal.set(null);
    this.authStatusSignal.set('unauthenticated');
    // Disconnect WebSocket to prevent memory leaks
    this.webSocketService.disconnect();
  }

  // Public method to clear tokens without making API calls (used by interceptor)
  clearTokens(): void {
    this.handleLogout();
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(errorMessage);
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  private storeToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  private storeRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
  }

  private storeUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private getStoredUser(): User | null {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  }

  private clearStorage(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  }

  // Utility methods for backwards compatibility
  get currentUserValue(): User | null {
    return this.currentUser();
  }

  get isLoggedInValue(): boolean {
    return this.isLoggedIn();
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch {
      return true;
    }
  }
}
