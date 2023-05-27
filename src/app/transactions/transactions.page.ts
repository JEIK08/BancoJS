import { Component } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

import { TransactionsService } from '../services/transactions.service';
import { Transaction, TransactionType } from '../interfaces/transaction';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage {

  public transactions!: Transaction[] & { isDate: boolean, date: string }[];
  public isFormOpen: boolean;
  public page!: number;
  public TransactionType: typeof TransactionType;
  public completePages?: boolean;

  constructor(private transactionsService: TransactionsService) {
    this.isFormOpen = false;
    this.TransactionType = TransactionType;
    this.transactionsService.listenTransactions(() => {
      this.transactions = [];
      this.page = 0;
      this.completePages = false;
      this.getTransactions();
    })
  }

  getTransactions(scrollEvent?: any) {
    if (this.completePages) {
      (scrollEvent as InfiniteScrollCustomEvent)?.target.complete();
      return;
    }
    this.page++;
    this.transactionsService.getTransactions(this.page, this.transactions).then(transactions => {
      let lastDate: string = this.transactions[this.transactions.length - 1]?.date.toLocaleDateString() ?? '';
      transactions.forEach((transaction: Transaction) => {
        const currentDate: string = transaction.date.toLocaleDateString();
        if (currentDate != lastDate) {
          lastDate = currentDate;
          this.transactions.push({ isDate: true, date: currentDate } as any);
        }
        this.transactions.push(transaction);
      });
      this.completePages = transactions.length == 0;
      (scrollEvent as InfiniteScrollCustomEvent)?.target.complete();
    });
  }

}