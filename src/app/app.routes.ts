import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/auth.component')
  },
  {
    path: '',
    loadComponent: () => import('./home/home.component')
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];