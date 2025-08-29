import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirmation-dialog" (click)="onDialogClick($event)">
      <div class="dialog-header">
        <mat-icon [class]="getIconClass()">{{ getIcon() }}</mat-icon>
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>
      
      <div mat-dialog-content class="dialog-content">
        <p>{{ data.message }}</p>
      </div>
      
      <div mat-dialog-actions class="dialog-actions">
        <button (click)="onCancel()" class="cancel-btn" type="button" 
                style="pointer-events: auto !important; cursor: pointer !important; z-index: 9999 !important; position: relative !important; padding: 8px 16px; margin: 4px; border: 1px solid #ccc; background: white; border-radius: 4px;">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button (click)="onConfirm()" [class]="getConfirmButtonClass()" type="button"
                style="pointer-events: auto !important; cursor: pointer !important; z-index: 9999 !important; position: relative !important; padding: 8px 16px; margin: 4px; border: none; background: #f44336; color: white; border-radius: 4px;">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      min-width: 300px;
      max-width: 400px;
    }
    
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .dialog-header mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    .dialog-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    
    .dialog-content {
      margin-bottom: 24px;
    }
    
    .dialog-content p {
      margin: 0;
      color: #666;
      line-height: 1.5;
    }
    
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin: 0;
      padding: 0;
      pointer-events: auto !important;
      z-index: 20010 !important;
    }
    
    .cancel-btn {
      color: #666 !important;
      background: transparent !important;
      border: 1px solid #ddd !important;
      pointer-events: auto !important;
      cursor: pointer !important;
      z-index: 20010 !important;
      touch-action: manipulation !important;
    }
    
    .cancel-btn:hover {
      background: #f5f5f5 !important;
    }
    
    .confirm-btn-warning {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
      color: white !important;
      border: none !important;
      pointer-events: auto !important;
      cursor: pointer !important;
      z-index: 20010 !important;
      touch-action: manipulation !important;
    }
    
    .confirm-btn-warning:hover {
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%) !important;
    }
    
    .confirm-btn-danger {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
      color: white !important;
      border: none !important;
      pointer-events: auto !important;
      cursor: pointer !important;
      z-index: 20010 !important;
      touch-action: manipulation !important;
    }
    
    .confirm-btn-danger:hover {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important;
    }
    
    .confirm-btn-info {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
      color: white !important;
      border: none !important;
      pointer-events: auto !important;
      cursor: pointer !important;
      z-index: 20010 !important;
      touch-action: manipulation !important;
    }
    
    .confirm-btn-info:hover {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
    }
    
    .icon-warning {
      color: #f59e0b;
    }
    
    .icon-danger {
      color: #ef4444;
    }
    
    .icon-info {
      color: #3b82f6;
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  onDialogClick(event: Event): void {
    console.log('Dialog clicked:', event.target);
    event.stopPropagation();
  }

  onCancel(): void {
    console.log('Cancel button clicked');
    alert('Cancel clicked!'); // Temporary test
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    console.log('Confirm button clicked');
    alert('Confirm clicked!'); // Temporary test
    this.dialogRef.close(true);
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'warning':
        return 'warning';
      case 'danger':
        return 'delete_forever';
      case 'info':
        return 'info';
      default:
        return 'help_outline';
    }
  }

  getIconClass(): string {
    switch (this.data.type) {
      case 'warning':
        return 'icon-warning';
      case 'danger':
        return 'icon-danger';
      case 'info':
        return 'icon-info';
      default:
        return 'icon-info';
    }
  }

  getConfirmButtonClass(): string {
    switch (this.data.type) {
      case 'warning':
        return 'confirm-btn-warning';
      case 'danger':
        return 'confirm-btn-danger';
      case 'info':
        return 'confirm-btn-info';
      default:
        return 'confirm-btn-info';
    }
  }
}
