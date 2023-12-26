import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from './services/auth.service';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/auth.component'),
    canActivate: [() => {
      const router = inject(Router);
      return inject(AuthService).isLoggedUser().pipe(
        map(isLoggedIn => isLoggedIn ? router.createUrlTree(['']) : true)
      );
    }]
  },
  {
    path: '',
    loadChildren: () => import('./home/home.routes'),
    canActivate: [() => {
      const router = inject(Router);
      return inject(AuthService).isLoggedUser().pipe(
        map(isLoggedIn => isLoggedIn ? true : router.createUrlTree(['login']))
      );
    }]
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];