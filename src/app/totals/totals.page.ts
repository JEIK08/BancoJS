import { Component } from '@angular/core';
import { TransactionsService } from '../services/transactions.service';

@Component({
  selector: 'app-totals',
  templateUrl: './totals.page.html',
  styleUrls: ['./totals.page.scss'],
})
export class TotalsPage {

  constructor(private transactionsService: TransactionsService) { }

}
