import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccountsSelectOptionsComponent } from './accounts-select-options/accounts-select-options.component';

@NgModule({
  declarations: [
    AccountsSelectOptionsComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports: [
    AccountsSelectOptionsComponent,
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SharedModule { }
