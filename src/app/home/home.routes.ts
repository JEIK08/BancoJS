import { Routes } from '@angular/router';

import { AccountService } from './services/accounts.service';
import { TransactionsService } from './services/transactions.service';
import { OcrService } from './services/ocr.service';

import HomeComponent from './home.component';
import AccountsPage from './accounts/accounts.page';

export default [
  {
    path: '',
    component: HomeComponent,
    providers: [
      AccountService,
      TransactionsService,
      OcrService
    ],
    children: [
      {
        path: 'accounts',
        component: AccountsPage
      },
      {
        path: 'transactions',
        loadComponent: () => import('./transactions/transactions.page'),
      },
      {
        path: '**',
        redirectTo: 'accounts',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
] as Routes;