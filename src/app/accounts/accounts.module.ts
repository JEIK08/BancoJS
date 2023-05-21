import { NgModule } from '@angular/core';

import { IonicModule } from '@ionic/angular';

import { SharedModule } from '../shared/shared/shared.module';
import { AccountsPageRoutingModule } from './accounts-routing.module';

import { AccountsPage } from './accounts.page';
import { AccountFormComponent } from './account-form/account-form.component';

@NgModule({
  imports: [
    SharedModule,
    IonicModule,
    AccountsPageRoutingModule,
  ],
  declarations: [
    AccountsPage,
    AccountFormComponent
  ]
})
export class AccountsPageModule { }
