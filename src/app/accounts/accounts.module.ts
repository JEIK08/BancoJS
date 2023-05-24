import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared/shared.module';
import { AccountsPageRoutingModule } from './accounts-routing.module';

import { AccountsPage } from './accounts.page';
import { AccountFormComponent } from './account-form/account-form.component';

@NgModule({
  imports: [
    SharedModule,
    AccountsPageRoutingModule
  ],
  declarations: [
    AccountsPage,
    AccountFormComponent
  ]
})
export class AccountsPageModule { }
