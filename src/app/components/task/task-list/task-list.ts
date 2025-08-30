import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TaskService } from '../../../services/task.service';
import { WebSocketService } from '../../../services/websocket.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { Task, TaskStatus, TaskPriority, TaskFilter, CreateTaskRequest, UpdateTaskRequest } from '../../../models/task.model';
import { TaskItem } from '../task-item/task-item';
import { TaskForm } from '../task-form/task-form';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';
import { ConfirmationModalService } from '../../../services/confirmation-modal.service';
import { UI_LABELS, TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS, PAGINATION_OPTIONS } from '../../../constants/app.constants';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    TaskItem,
    TaskForm,
    ConfirmationModalComponent
  ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss'
})
export class TaskList implements OnInit {
  // Injected services using modern inject() function
  private taskService = inject(TaskService);
  private webSocketService = inject(WebSocketService);
  private snackBar = inject(MatSnackBar);
  private customSnackbar = inject(SnackbarService);
  confirmationModalService = inject(ConfirmationModalService);
  private fb = inject(FormBuilder);

  // Signals for reactive state management
  allTasks = signal<Task[]>([]);
  isLoading = signal(false);
  showTaskForm = signal(false);
  editingTask = signal<Task | null>(null);
  
  // Pagination state
  currentPage = signal(1);
  pageSize = signal(5); // 5 items per page as requested
  totalItems = signal(0);
  
  // Pagination info from API response
  paginationInfo = signal<{
    current: number;
    pages: number;
    total: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);

  // Reactive form for filters
  filterForm = this.fb.group({
    search: new FormControl(''),
    statusFilter: new FormControl<TaskStatus[]>([]),
    priorityFilter: new FormControl<TaskPriority[]>([])
  });

  // Tasks are already filtered by the server, so we just return them directly
  displayedTasks = computed(() => this.allTasks());

  // Computed signals for status counts - these show counts for current page only
  pendingCount = computed(() => 
    this.displayedTasks().filter(task => task.status === TaskStatus.PENDING).length
  );
  
  inProgressCount = computed(() => 
    this.displayedTasks().filter(task => task.status === TaskStatus.IN_PROGRESS).length
  );
  
  completedCount = computed(() => 
    this.displayedTasks().filter(task => task.status === TaskStatus.COMPLETED).length
  );

  // Computed signal for filter state
  hasActiveFilters = computed(() => {
    const filters = this.filterForm.value;
    return !!(
      filters.search || 
      filters.statusFilter?.length || 
      filters.priorityFilter?.length
    );
  });

  // Enum references for template
  readonly TaskStatus = TaskStatus;
  readonly TaskPriority = TaskPriority;
  
  // Constants for template
  readonly UI_LABELS = UI_LABELS;
  readonly TASK_STATUS_OPTIONS = TASK_STATUS_OPTIONS;
  readonly TASK_PRIORITY_OPTIONS = TASK_PRIORITY_OPTIONS;
  readonly PAGINATION_OPTIONS = PAGINATION_OPTIONS;

  // Create destroyRef for manual cleanup when needed
  private destroyRef = inject(DestroyRef);

  constructor() {
    // Effect to auto-reload when filters change (with debouncing)
    this.filterForm.valueChanges
      .pipe(
        debounceTime(500), // Increased debounce time to reduce API calls
        distinctUntilChanged((prev, curr) => {
          // Custom comparison to avoid unnecessary calls
          return JSON.stringify(prev) === JSON.stringify(curr);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        // Reset to first page when filters change and reload
        this.currentPage.set(1);
        this.loadTasks();
      });

    // Setup WebSocket listeners in constructor
    this.setupWebSocketListeners();
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading.set(true);
    
    const filters = this.filterForm.value;
    const filter: TaskFilter = {
      status: filters.statusFilter?.length ? filters.statusFilter : undefined,
      priority: filters.priorityFilter?.length ? filters.priorityFilter : undefined,
      search: filters.search?.trim() || undefined, // Trim whitespace
      page: this.currentPage(),
      limit: this.pageSize(),
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    
    // Don't make API call if search is less than 2 characters (except when empty)
    if (filter.search && filter.search.length < 2) {
      this.isLoading.set(false);
      return;
    }

    this.taskService.getTasks(filter)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if (response.success) {
            this.allTasks.set(response.data);
            if (response.pagination) {
              this.paginationInfo.set(response.pagination);
              this.totalItems.set(response.pagination.total);
            }
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.customSnackbar.error('Failed to load tasks', 3000);
        }
      });
  }

  private setupWebSocketListeners(): void {
    this.webSocketService.onTaskCreated()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(task => {
        this.allTasks.update(tasks => [task, ...tasks]);
        this.customSnackbar.info('New task created!', 2000);
      });

    this.webSocketService.onTaskUpdated()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(updatedTask => {
        this.allTasks.update(tasks => 
          tasks.map(t => t._id === updatedTask._id ? updatedTask : t)
        );
      });

    this.webSocketService.onTaskDeleted()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(taskId => {
        this.allTasks.update(tasks => tasks.filter(t => t._id !== taskId));
        this.customSnackbar.info('Task deleted!', 2000);
      });
  }

  openTaskForm(task?: Task): void {
    this.editingTask.set(task || null);
    this.showTaskForm.set(true);
  }

  closeTaskForm(): void {
    this.showTaskForm.set(false);
    this.editingTask.set(null);
  }

  onTaskSaved(taskData: CreateTaskRequest | UpdateTaskRequest): void {
    const editingTask = this.editingTask();
    
    if (editingTask) {
      // Update existing task
      this.taskService.updateTask(editingTask._id, taskData as UpdateTaskRequest)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.customSnackbar.success('Task updated successfully!', 3000);
            this.closeTaskForm();
            this.loadTasks();
          },
          error: (error) => {
            this.customSnackbar.error('Failed to update task', 3000);
            console.error('Error updating task:', error);
          }
        });
    } else {
      // Create new task
      this.taskService.createTask(taskData as CreateTaskRequest)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.customSnackbar.success('Task created successfully!', 3000);
            this.closeTaskForm();
            this.loadTasks();
          },
          error: (error) => {
            this.customSnackbar.error('Failed to create task', 3000);
            console.error('Error creating task:', error);
          }
        });
    }
  }

  onTaskUpdated(updatedTask: Task): void {
    this.taskService.updateTask(updatedTask._id, { status: updatedTask.status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.customSnackbar.success('Task status updated successfully!', 3000);
          this.loadTasks();
        },
        error: (error) => {
          this.customSnackbar.error('Failed to update task status', 3000);
          console.error('Error updating task status:', error);
        }
      });
  }

  onTaskDeleted(taskId: string): void {
    this.taskService.deleteTask(taskId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.customSnackbar.success('Task deleted successfully!', 3000);
          this.loadTasks();
        },
        error: (error) => {
          this.customSnackbar.error('Failed to delete task', 3000);
        }
      });
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      statusFilter: [],
      priorityFilter: []
    });
    // Reset to first page and reload
    this.currentPage.set(1);
    this.loadTasks();
  }
  
  // Add method to manually trigger search
  onSearchClick(): void {
    this.currentPage.set(1);
    this.loadTasks();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1); // PageEvent is 0-based, our API is 1-based
    this.pageSize.set(event.pageSize);
    this.loadTasks();
  }

  // Getter methods for template (signals are accessed with ())
  getStatusCount(status: TaskStatus): number {
    switch (status) {
      case TaskStatus.PENDING:
        return this.pendingCount();
      case TaskStatus.IN_PROGRESS:
        return this.inProgressCount();
      case TaskStatus.COMPLETED:
        return this.completedCount();
      default:
        return 0;
    }
  }
}