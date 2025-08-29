import { Component, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { SnackbarService } from '../../services/snackbar.service';
import { TaskList } from '../task/task-list/task-list';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    TaskList
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  // Injected services using modern inject() function
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private customSnackbar = inject(SnackbarService);
  private destroyRef = inject(DestroyRef);

  // Signal-based state from AuthService
  readonly currentUser = this.authService.currentUser;
  readonly userDisplayName = this.authService.userDisplayName;
  readonly userInitials = this.authService.userInitials;
  readonly isLoading = this.authService.isLoading;
  readonly authStatus = this.authService.authStatus;

  logout(): void {
    this.authService.logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.customSnackbar.success('Logged out successfully', 2000);
          this.router.navigate(['/auth/login']);
        },
        error: () => {
          // Even if server logout fails, we're logged out locally
          this.customSnackbar.warning('Logged out (offline)', 2000);
          this.router.navigate(['/auth/login']);
        }
      });
  }

  refreshProfile(): void {
    this.authService.getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.customSnackbar.success('Profile refreshed', 2000);
        },
        error: () => {
          this.customSnackbar.error('Failed to refresh profile', 3000);
        }
      });
  }
}
