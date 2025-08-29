import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface CustomSnackbarData {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  action?: string;
}

@Component({
  selector: 'app-custom-snackbar',
  template: `
    <div class="custom-snackbar-container" [ngClass]="'snackbar-' + data.type">
      <div class="snackbar-content">
        <div class="snackbar-icon">
          <mat-icon>{{ getIcon() }}</mat-icon>
        </div>
        <div class="snackbar-message">{{ data.message }}</div>
      </div>
    </div>
  `,
  styles: [`
    .custom-snackbar-container {
      display: flex;
      align-items: center;
      padding: 16px 24px;
      border-radius: 16px;
      min-width: 350px;
      max-width: 600px;
      color: #ffffff;
      font-weight: 600;
      font-size: 15px;
      box-shadow: none;
      border: none;
    }

    .snackbar-content {
      display: flex;
      align-items: center;
      width: 100%;
      gap: 12px;
    }

    .snackbar-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }

    .snackbar-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .snackbar-message {
      flex: 1;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }



 

    /* Success - Green */
    .snackbar-success {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    }

    /* Error - Red */
    .snackbar-error {
      background: linear-gradient(135deg, #ff4444 0%, #e53e3e 100%);
    }

    /* Warning - Orange */
    .snackbar-warning {
      background: linear-gradient(135deg, #ff8c00 0%, #ff6b35 100%);
    }

    /* Info - Blue */
    .snackbar-info {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class CustomSnackbarComponent implements OnInit {
  constructor(
    public snackBarRef: MatSnackBarRef<CustomSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: CustomSnackbarData
  ) {}

  ngOnInit() {
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      this.snackBarRef.dismiss();
    }, 4000);
  }



  getIcon(): string {
    switch (this.data.type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }
}
