import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { Task, TaskStatus, TaskPriority } from '../../../models/task.model';
import { ConfirmationModalService } from '../../../services/confirmation-modal.service';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule
  ],
  templateUrl: './task-item.html',
  styleUrl: './task-item.scss'
})
export class TaskItem {
  @Input() task!: Task;
  @Input() showActions = true;
  @Output() taskUpdated = new EventEmitter<Task>();
  @Output() taskDeleted = new EventEmitter<string>();
  @Output() editTask = new EventEmitter<Task>();

  private confirmationModalService = inject(ConfirmationModalService);

  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;

  onStatusChange(status: TaskStatus): void {
    this.taskUpdated.emit({ ...this.task, status });
  }

  onEdit(): void {
    this.editTask.emit(this.task);
  }

  onDelete(): void {
    console.log('Delete button clicked, opening confirmation modal...');
    this.confirmationModalService.confirmDelete('task')
      .subscribe(confirmed => {
        console.log('Confirmation result:', confirmed);
        if (confirmed) {
          console.log('Task deletion confirmed, emitting taskDeleted event');
          this.taskDeleted.emit(this.task._id);
        } else {
          console.log('Task deletion cancelled');
        }
      });
  }

  getStatusColor(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'primary';
      case TaskStatus.IN_PROGRESS:
        return 'accent';
      case TaskStatus.PENDING:
        return 'warn';
      default:
        return '';
    }
  }

  getPriorityColor(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.URGENT:
        return 'warn';
      case TaskPriority.HIGH:
        return 'accent';
      case TaskPriority.MEDIUM:
        return 'primary';
      default:
        return '';
    }
  }
}
