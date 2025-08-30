import { Component, input, output, OnInit, signal, computed, inject, effect, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Task, TaskStatus, TaskPriority, CreateTaskRequest, UpdateTaskRequest } from '../../../models/task.model';
import { UI_LABELS, TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS, VALIDATION_MESSAGES } from '../../../constants/app.constants';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss'
})
export class TaskForm implements OnInit {
  // Modern signal-based inputs and outputs
  task = input<Task | null>(null);
  taskSaved = output<CreateTaskRequest | UpdateTaskRequest>();
  cancelled = output<void>();

  // Injected dependencies
  private fb = inject(FormBuilder);

  // Signals for reactive state
  isSubmitting = signal(false);
  
  // Computed signal for edit mode
  isEditing = computed(() => !!this.task());

  // Reactive form
  taskForm: FormGroup;

  // Enum references for template
  readonly TaskStatus = TaskStatus;
  readonly TaskPriority = TaskPriority;
  
  // Constants for template
  readonly UI_LABELS = UI_LABELS;
  readonly TASK_STATUS_OPTIONS = TASK_STATUS_OPTIONS;
  readonly TASK_PRIORITY_OPTIONS = TASK_PRIORITY_OPTIONS;
  readonly VALIDATION_MESSAGES = VALIDATION_MESSAGES;

  constructor() {
    // Initialize form
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      status: [TaskStatus.PENDING],
      priority: [TaskPriority.MEDIUM],
      dueDate: [null],
      tags: [[]]
    });

    // Effect to update form when task input changes
    effect(() => {
      const task = this.task();
      if (task) {
        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          tags: task.tags
        });
      } else {
        this.taskForm.reset({
          title: '',
          description: '',
          status: TaskStatus.PENDING,
          priority: TaskPriority.MEDIUM,
          dueDate: null,
          tags: []
        });
      }
    });
  }

  ngOnInit(): void {
    // Form is already initialized in constructor with effect
  }

  async onSubmit(): Promise<void> {
    if (this.taskForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      
      try {
        const formValue = this.taskForm.value;
        this.taskSaved.emit(formValue);
      } finally {
        this.isSubmitting.set(false);
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
  getErrorMessage(fieldName: string): string {
    const control = this.taskForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return VALIDATION_MESSAGES.REQUIRED;
    }
    
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength']?.requiredLength;
      return VALIDATION_MESSAGES.MIN_LENGTH.replace('{0}', minLength.toString());
    }
    
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.taskForm.get(fieldName);
    return !!(control?.invalid && control?.touched);
  }
}
