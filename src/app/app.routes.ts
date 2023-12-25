import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/auth.component')
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];