import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { AccountsPageRoutingModule } from './accounts-routing.module';

import { AccountsPage } from './accounts.page';
import { AccountFormComponent } from './account-form/account-form.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    AccountsPageRoutingModule,
  ],
  declarations: [
    AccountsPage,
    AccountFormComponent
  ]
})
export class AccountsPageModule { }
