import { TaskStatus, TaskPriority } from '../models/task.model';

// UI Labels and Text
export const UI_LABELS = {
  // Task List
  MY_TASKS: 'My Tasks',
  ADD_TASK: 'Add Task',
  SEARCH_TASKS: 'Search tasks',
  SEARCH_PLACEHOLDER: 'Search by title, description, or tags',
  FILTER_BY_STATUS: 'Filter by Status',
  FILTER_BY_PRIORITY: 'Filter by Priority',
  CLEAR_FILTERS: 'Clear Filters',
  LOADING_TASKS: 'Loading tasks...',
  NO_TASKS_FOUND: 'No tasks found',
  NO_TASKS_MESSAGE: 'You don\'t have any tasks yet. Create your first task!',
  NO_TASKS_FILTERED: 'No tasks match your current filters. Try adjusting your search criteria.',
  CREATE_TASK: 'Create Task',
  TOTAL_TASKS: 'Total: {0} tasks',
  FILTERED_BY: '(filtered by: "{0}")',
  PAGE_INFO: 'Page {0} of {1}',
  
  // Task Form
  EDIT_TASK: 'Edit Task',
  CREATE_NEW_TASK: 'Create New Task',
  TITLE: 'Title',
  TITLE_PLACEHOLDER: 'Enter task title',
  DESCRIPTION: 'Description',
  DESCRIPTION_PLACEHOLDER: 'Enter task description',
  STATUS: 'Status',
  PRIORITY: 'Priority',
  DUE_DATE: 'Due Date',
  DUE_DATE_HINT: 'Optional due date for the task',
  CANCEL: 'Cancel',
  UPDATE_TASK: 'Update Task',
  CREATE_TASK_BUTTON: 'Create Task',
  UPDATING: 'Updating...',
  CREATING: 'Creating...',
  
  // Task Status Labels
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  
  // Task Priority Labels
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
  
  // Auth
  LOGIN: 'Login',
  REGISTER: 'Register',
  LOGOUT: 'Logout',
  EMAIL: 'Email',
  PASSWORD: 'Password',
  USERNAME: 'Username',
  FULL_NAME: 'Full Name',
  CONFIRM_PASSWORD: 'Confirm Password',
  
  // Dashboard
  DASHBOARD: 'Dashboard',
  WELCOME: 'Welcome',
  
  // Common
  SAVE: 'Save',
  DELETE: 'Delete',
  EDIT: 'Edit',
  CLOSE: 'Close',
  CONFIRM: 'Confirm',
  YES: 'Yes',
  NO: 'No',
  OK: 'OK',
  ERROR: 'Error',
  SUCCESS: 'Success',
  WARNING: 'Warning',
  INFO: 'Info'
} as const;

// Task Status Options
export const TASK_STATUS_OPTIONS = [
  {
    value: TaskStatus.PENDING,
    label: UI_LABELS.PENDING,
    icon: 'schedule'
  },
  {
    value: TaskStatus.IN_PROGRESS,
    label: UI_LABELS.IN_PROGRESS,
    icon: 'play_arrow'
  },
  {
    value: TaskStatus.COMPLETED,
    label: UI_LABELS.COMPLETED,
    icon: 'check_circle'
  },
  {
    value: TaskStatus.CANCELLED,
    label: UI_LABELS.CANCELLED,
    icon: 'cancel'
  }
] as const;

// Task Priority Options
export const TASK_PRIORITY_OPTIONS = [
  {
    value: TaskPriority.LOW,
    label: UI_LABELS.LOW,
    icon: 'low_priority'
  },
  {
    value: TaskPriority.MEDIUM,
    label: UI_LABELS.MEDIUM,
    icon: 'remove'
  },
  {
    value: TaskPriority.HIGH,
    label: UI_LABELS.HIGH,
    icon: 'priority_high'
  },
  {
    value: TaskPriority.URGENT,
    label: UI_LABELS.URGENT,
    icon: 'warning'
  }
] as const;

// Pagination Options
export const PAGINATION_OPTIONS = {
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  DEFAULT_PAGE_SIZE: 10,
  SHOW_FIRST_LAST_BUTTONS: true
} as const;

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  MIN_LENGTH: 'Minimum length is {0} characters',
  MAX_LENGTH: 'Maximum length is {0} characters',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_MISMATCH: 'Passwords do not match',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  TITLE_MIN_LENGTH: 'Title must be at least 3 characters',
  TITLE_MAX_LENGTH: 'Title cannot exceed 100 characters',
  DESCRIPTION_MAX_LENGTH: 'Description cannot exceed 500 characters'
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh'
  },
  TASKS: {
    BASE: '/tasks',
    CREATE: '/tasks',
    UPDATE: '/tasks/{id}',
    DELETE: '/tasks/{id}',
    GET_BY_ID: '/tasks/{id}',
    GET_ALL: '/tasks'
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile'
  }
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  THEME: 'theme',
  LANGUAGE: 'language'
} as const;

// Application Configuration
export const APP_CONFIG = {
  APP_NAME: 'Task Management',
  VERSION: '1.0.0',
  DEFAULT_THEME: 'light',
  DEFAULT_LANGUAGE: 'en',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  DEBOUNCE_TIME: 300,
  TOAST_DURATION: 3000
} as const;

// Color Themes
export const THEME_COLORS = {
  PRIMARY: '#3f51b5',
  ACCENT: '#ff4081',
  WARN: '#f44336',
  SUCCESS: '#4caf50',
  INFO: '#2196f3',
  WARNING: '#ff9800'
} as const;

// Icon Names
export const ICONS = {
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'delete',
  SAVE: 'save',
  CANCEL: 'cancel',
  CLOSE: 'close',
  SEARCH: 'search',
  FILTER: 'filter_list',
  CLEAR: 'clear',
  LOADING: 'hourglass_empty',
  SUCCESS: 'check_circle',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  MENU: 'menu',
  LOGOUT: 'logout',
  SETTINGS: 'settings',
  PROFILE: 'person',
  DASHBOARD: 'dashboard',
  TASKS: 'assignment',
  CALENDAR: 'calendar_today',
  NOTIFICATIONS: 'notifications'
} as const;
