import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, filter, Subscription, switchMap, takeUntil, tap } from 'rxjs';

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
export default class TransactionsPage implements OnDestroy {

  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  public transactions: Transaction[] = [];
  public isFirstLoad: boolean = true;
  public TransactionType: typeof TransactionType = TransactionType;
  public filterControl: FormControl = new FormControl();

  private filterSubscription: Subscription;

  constructor(
    private transactionsService: TransactionsService,
    private authService: AuthService
  ) {
    this.transactionsService.listenTransactions().pipe(
      takeUntil(this.authService.onLogOut())
    ).subscribe(() => {
      this.transactions = [];
      this.isFirstLoad = true;
      this.filterControl.updateValueAndValidity();
    });

    this.filterSubscription = this.filterControl.valueChanges.pipe(
      debounceTime(1500),
      filter(filterText => !filterText || filterText?.length >= 3),
      tap(() => {
        this.transactions = [];
        this.isFirstLoad = true;
      }),
      switchMap(filter => this.transactionsService.getTransactions(filter))
    ).subscribe(transactions => {
      this.transactions = transactions;
      this.isFirstLoad = false;
    });

    this.filterControl.updateValueAndValidity();
  }

  getMoreTransactions() {
    this.transactionsService.getTransactions(this.filterControl.value, this.transactions.at(-1)?.dateText).subscribe(transactions => {
      this.transactions.push(...transactions);
      this.infiniteScroll.complete();
    });
  }

  ngOnDestroy() {
    this.filterSubscription.unsubscribe();
  }

}