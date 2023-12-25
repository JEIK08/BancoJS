import { NgModule } from '@angular/core';

import { TransactionsPageRoutingModule } from './transactions-routing.module';

import { SharedModule } from '../shared/shared.module';

import { TransactionsPage } from './transactions.page';

@NgModule({
  imports: [
    SharedModule,
    TransactionsPageRoutingModule
  ],
  declarations: [
    TransactionsPage
  ]
})
export class TransactionsPageModule { }
