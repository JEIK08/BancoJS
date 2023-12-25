import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/auth.component')
  },
  {
    path: '',
    loadChildren: () => import('./home/home.routes')
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];