import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../components/shared/confirmation-dialog/confirmation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {

  constructor(private dialog: MatDialog) {}

  confirm(data: ConfirmationDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      maxWidth: '90vw',
      data: data,
      disableClose: true,
      hasBackdrop: true,
      autoFocus: false,
      restoreFocus: false,
      closeOnNavigation: false,
      role: 'dialog',
      ariaModal: true
    });

    return dialogRef.afterClosed();
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
}
