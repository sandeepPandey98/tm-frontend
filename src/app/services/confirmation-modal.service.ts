import { Injectable, signal, computed } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfirmationModalData } from '../components/shared/confirmation-modal/confirmation-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationModalService {
  // Signals for modal state
  private _showModal = signal(false);
  private _modalData = signal<ConfirmationModalData | null>(null);
  
  // Computed signals
  showModal = computed(() => this._showModal());
  modalData = computed(() => this._modalData());
  
  // Subject for handling confirmation results
  private confirmationSubject = new Subject<boolean>();

  confirm(data: ConfirmationModalData): Observable<boolean> {
    console.log('ConfirmationModalService.confirm called with data:', data);
    this._modalData.set(data);
    this._showModal.set(true);
    console.log('Modal should now be visible, showModal:', this._showModal());
    
    return new Observable<boolean>(observer => {
      const subscription = this.confirmationSubject.subscribe(result => {
        console.log('Confirmation result received:', result);
        observer.next(result);
        observer.complete();
        subscription.unsubscribe();
      });
    });
  }

  confirmDelete(itemName: string = 'item'): Observable<boolean> {
    return this.confirm({
      title: 'Delete Confirmation',
      message: `Are you sure you want to delete this ${itemName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
  }

  confirmWarning(message: string, title: string = 'Warning'): Observable<boolean> {
    return this.confirm({
      title: title,
      message: message,
      confirmText: 'Continue',
      cancelText: 'Cancel',
      type: 'warning'
    });
  }

  confirmInfo(message: string, title: string = 'Information'): Observable<boolean> {
    return this.confirm({
      title: title,
      message: message,
      confirmText: 'OK',
      cancelText: 'Cancel',
      type: 'info'
    });
  }

  onConfirmed(): void {
    console.log('ConfirmationModalService.onConfirmed called');
    this._showModal.set(false);
    this._modalData.set(null);
    this.confirmationSubject.next(true);
  }

  onCancelled(): void {
    console.log('ConfirmationModalService.onCancelled called');
    this._showModal.set(false);
    this._modalData.set(null);
    this.confirmationSubject.next(false);
  }
}
