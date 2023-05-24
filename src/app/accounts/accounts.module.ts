import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared/shared.module';
import { AccountsPageRoutingModule } from './accounts-routing.module';

import { AccountsPage } from './accounts.page';
import { AccountFormComponent } from './account-form/account-form.component';
import { AccountItemComponent } from './account-item/account-item.component';

@NgModule({
  imports: [
    SharedModule,
    AccountsPageRoutingModule
  ],
  declarations: [
    AccountsPage,
    AccountFormComponent,
    AccountItemComponent
  ]
})
export class AccountsPageModule { }
