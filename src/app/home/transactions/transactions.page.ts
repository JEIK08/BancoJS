import { Component, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs';

import { IonInfiniteScroll } from '@ionic/angular/standalone';

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

  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  public transactions: Transaction[] = [];
  public separators: { [id: string]: string } = {};
  public page: number = 0;
  public isFirstLoad: boolean = true;
  public TransactionType: typeof TransactionType = TransactionType;

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
      this.isFirstLoad = true;
      this.completePages = false;
      this.getTransactions();
    });
  }

  getTransactions() {
    if (this.completePages) {
      this.infiniteScroll.complete();
      return;
    }

    if (this.isFirstLoad) this.infiniteScroll.disabled = true;
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
      if (this.isFirstLoad) {
        this.infiniteScroll.disabled = false;
        this.isFirstLoad = false;
      }
      this.infiniteScroll.complete();
    });
  }

}