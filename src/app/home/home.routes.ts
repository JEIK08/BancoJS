import { Routes } from '@angular/router';

import HomeComponent from './home.component';
import { AccountsPage } from './accounts/accounts.page';

export default [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'accounts',
        component: AccountsPage
      }
    ]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
] as Routes;