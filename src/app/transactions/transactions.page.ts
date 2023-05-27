import { Component } from '@angular/core';

import { TransactionsService } from '../services/transactions.service';
import { Transaction, TransactionType } from '../interfaces/transaction';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage {

  public transactions: Transaction[];
  public isFormOpen: boolean;
  public page: number;
  public TransactionType: typeof TransactionType;

  constructor(private transactionsService: TransactionsService) {
    this.transactions = [];
    this.page = 0;
    this.isFormOpen = false;
    this.TransactionType = TransactionType;
    this.getTransactions();
    this.transactionsService.listenTransactions(() => {
      this.transactions = [];
      this.page = 0;
      this.getTransactions();
    })
  }

  getTransactions() {
    this.page++;
    this.transactionsService.getTransactions(this.page, this.transactions).then(transactions => {
      this.transactions.push(...transactions);
    });
  }

}