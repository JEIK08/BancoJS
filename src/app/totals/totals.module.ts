import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { TotalsPageRoutingModule } from './totals-routing.module';

import { TotalsPage } from './totals.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    TotalsPageRoutingModule
  ],
  declarations: [TotalsPage]
})
export class TotalsPageModule { }
