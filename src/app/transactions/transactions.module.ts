import { NgModule } from '@angular/core';

import { IonicModule } from '@ionic/angular';

import { TransactionsPageRoutingModule } from './transactions-routing.module';

import { TransactionsPage } from './transactions.page';
import { SharedModule } from '../shared/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    IonicModule,
    TransactionsPageRoutingModule
  ],
  declarations: [TransactionsPage]
})
export class TransactionsPageModule { }
