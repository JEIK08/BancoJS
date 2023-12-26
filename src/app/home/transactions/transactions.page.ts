import { Component } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { takeUntil } from 'rxjs';

import { TransactionsService } from '../services/transactions.service';
import { AuthService } from 'src/app/services/auth.service';

import { Transaction, TransactionType } from 'src/app/interfaces/transaction';
import { IMPORTS } from './transactions.utils';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  standalone: true,
  imports: IMPORTS
})
export default class TransactionsPage {

  public transactions: Transaction[] = [];
  public separators: { [id: string]: string } = {};
  public page: number = 0;
  public TransactionType: typeof TransactionType = TransactionType;
  public isFirstLoad: boolean = true;

  private completePages: boolean = false;

  constructor(
    private transactionsService: TransactionsService,
    private authService: AuthService
  ) {
    this.transactionsService.listenTransactions().pipe(
      takeUntil(this.authService.onLogOut())
    ).subscribe(() => {
      this.transactions = [];
      this.separators = {};
      this.page = 0;
      this.completePages = false;
      this.getTransactions();
    });
  }

  getTransactions(scrollEvent?: InfiniteScrollCustomEvent) {
    if (this.completePages) {
      scrollEvent?.target.complete();
      return;
    }
    this.page++;
    this.transactionsService.getTransactions(this.page, this.transactions).subscribe(transactions => {
      let lastDate: string = this.transactions[this.transactions.length - 1]?.date.toLocaleDateString() ?? '';
      transactions.forEach(transaction => {
        const currentDate: string = transaction.date.toLocaleDateString();
        if (currentDate === lastDate) return;
        lastDate = currentDate;
        this.separators[transaction.id] = currentDate;
      });
      this.transactions.push(...transactions);
      this.completePages = transactions.length == 0;
      this.isFirstLoad = false;
      scrollEvent?.target.complete();
    });
  }

}