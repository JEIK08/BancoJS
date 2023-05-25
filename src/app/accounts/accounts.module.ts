import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared/shared.module';
import { AccountsPageRoutingModule } from './accounts-routing.module';

import { AccountsPage } from './accounts.page';
import { AccountFormComponent } from './account-form/account-form.component';
import { PocketsComponent } from './pockets/pockets.component';

@NgModule({
  imports: [
    SharedModule,
    AccountsPageRoutingModule
  ],
  declarations: [
    AccountsPage,
    AccountFormComponent,
    PocketsComponent
  ]
})
export class AccountsPageModule { }
