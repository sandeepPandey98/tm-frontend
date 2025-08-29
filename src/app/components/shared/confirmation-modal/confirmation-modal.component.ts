import { Component, input, output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmationModalData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  template: `
    <div class="confirmation-modal-overlay" (click)="onOverlayClick($event)">
      <div class="confirmation-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <mat-icon [class]="getIconClass()">{{ getIcon() }}</mat-icon>
          <h2>{{ data().title }}</h2>
        </div>
        
        <div class="modal-content">
          <p>{{ data().message }}</p>
        </div>
        
        <div class="modal-actions">
          <button (click)="onCancel()" class="cancel-btn">
            {{ data().cancelText || 'Cancel' }}
          </button>
          <button (click)="onConfirm()" [class]="getConfirmButtonClass()">
            {{ data().confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 20000;
    }
    
    .confirmation-modal {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      min-width: 300px;
      max-width: 400px;
      padding: 24px;
      position: relative;
      z-index: 20001;
    }
    
    .modal-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .modal-header mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    .modal-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
    
    .modal-content {
      margin-bottom: 24px;
    }
    
    .modal-content p {
      margin: 0;
      color: #666;
      line-height: 1.5;
    }
    
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    
    .cancel-btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      color: #666;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }
    
    .cancel-btn:hover {
      background: #f5f5f5;
    }
    
    .confirm-btn-warning {
      padding: 8px 16px;
      border: none;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }
    
    .confirm-btn-warning:hover {
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
    }
    
    .confirm-btn-danger {
      padding: 8px 16px;
      border: none;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }
    
    .confirm-btn-danger:hover {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    }
    
    .confirm-btn-info {
      padding: 8px 16px;
      border: none;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }
    
    .confirm-btn-info:hover {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
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
export class ConfirmationModalComponent {
  // Inputs
  data = input.required<ConfirmationModalData>();
  
  // Outputs
  confirmed = output<boolean>();
  cancelled = output<void>();

  onOverlayClick(event: Event): void {
    console.log('Overlay clicked');
    // Don't close on overlay click - only close on button clicks
    event.stopPropagation();
  }

  onCancel(): void {
    console.log('Cancel button clicked in modal component');
    this.cancelled.emit();
  }

  onConfirm(): void {
    console.log('Confirm button clicked in modal component');
    this.confirmed.emit(true);
  }

  getIcon(): string {
    switch (this.data().type) {
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
    switch (this.data().type) {
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
    switch (this.data().type) {
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
