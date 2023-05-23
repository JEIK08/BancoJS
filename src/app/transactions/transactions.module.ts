import { NgModule } from '@angular/core';

import { IonicModule } from '@ionic/angular';

import { TransactionsPageRoutingModule } from './transactions-routing.module';

import { SharedModule } from '../shared/shared/shared.module';
import { TransactionsService } from '../services/transactions.service';

import { TransactionsPage } from './transactions.page';
import { TransactionFormComponent } from './transaction-form/transaction-form.component';

@NgModule({
  imports: [
    SharedModule,
    IonicModule,
    TransactionsPageRoutingModule
  ],
  declarations: [
    TransactionsPage,
    TransactionFormComponent
  ],
  providers: [
    TransactionsService
  ]
})
export class TransactionsPageModule { }
