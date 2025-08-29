import { Routes } from '@angular/router';
import { AuthGuard, NoAuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./components/auth/login/login').then(m => m.Login),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./components/auth/register/register').then(m => m.Register),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [AuthGuard]
  },
  {
    path: 'tasks',
    loadComponent: () => import('./components/task/task-list/task-list').then(m => m.TaskList),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];