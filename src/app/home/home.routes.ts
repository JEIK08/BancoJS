import { Routes } from '@angular/router';

import { AccountService } from './services/accounts.service';
import { FirebaseService } from './services/firebase.service';
import { TransactionsService } from './services/transactions.service';

import HomeComponent from './home.component';
import AccountsPage from './accounts/accounts.page';

export default [
  {
    path: '',
    component: HomeComponent,
    providers: [
      AccountService,
      FirebaseService,
      AccountService,
      TransactionsService
    ],
    children: [
      {
        path: 'accounts',
        component: AccountsPage
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