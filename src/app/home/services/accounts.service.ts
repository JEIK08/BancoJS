import { Injectable } from '@angular/core';
import { BehaviorSubject, concatMap, debounceTime, map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { orderBy } from '@angular/fire/firestore';

import { Collection, FirestoreService } from '../../services/firestore.service';
import { AuthService } from 'src/app/services/auth.service';

import { Account } from '../../interfaces/account';

@Injectable()
export class AccountService {

  private accountsSubject: BehaviorSubject<Account[] | undefined>;
  private accountsObservable: Observable<Account[] | undefined>;
  private boxValueSubject: Subject<number>;
  private boxValueObservable: Observable<number>;

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
  ) {
    this.accountsSubject = new BehaviorSubject(undefined as any);
    this.accountsObservable = this.accountsSubject.asObservable();
    this.boxValueSubject = new Subject();
    this.boxValueObservable = this.boxValueSubject.asObservable();
  }

  listenAccounts() {
    this.firestoreService.listenCollection(Collection.Account).pipe(
      takeUntil(
        this.authService.onLogOut().pipe(
          tap(() => this.accountsSubject.next(undefined))
        )
      ),
      debounceTime(1000),
      concatMap(() => this.firestoreService.getDocuments<Account>(
        Collection.Account,
        { queryConstrains: [orderBy('order', 'asc')] }
      )),
      map(accounts => {
        let shouldUpdate = false;
        const today = new Date();
        const currentMonth = today.getMonth();
        accounts.forEach(({ id, isActive, monthExpenses }) => {
          if (!isActive) return;
          monthExpenses.lastUpdate = this.firestoreService.mapDate(monthExpenses.lastUpdate);
          if (monthExpenses.lastUpdate.getMonth() === currentMonth) return;
          monthExpenses.lastUpdate = today;
          monthExpenses.value = 0;
          this.firestoreService.updateDocument<Account>(Collection.Account, id, { monthExpenses })
          shouldUpdate = true;
        });

        return shouldUpdate ? undefined : accounts;
      })
    ).subscribe(accounts => this.accountsSubject.next(accounts));
  }

  getAccounts() {
    return this.accountsObservable;
  }

  changeBoxValue(difference: number) {
    this.boxValueSubject.next(difference);
  }

  onChangeBoxValue() {
    return this.boxValueObservable;
  }

  createAccount({ name, isActive }: Pick<Account, 'name' | 'isActive'>) {
    const account = {
      name,
      isActive,
      value: 0,
      order: this.accountsSubject.value?.length
    } as Account;
    if (account.isActive) {
      account.pockets = [{ name: 'Deuda', value: 0 }, { name: 'Disponible', value: 0 }];
      account.monthExpenses = {
        value: 0,
        lastUpdate: this.firestoreService.getDate(new Date())
      }
    } else {
      account.limit = 0;
    }
    return this.firestoreService.addDocument(Collection.Account, account);
  }

  updateAccount(accountId: string, accountData: Partial<Account>) {
    return this.firestoreService.updateDocument<Account>(Collection.Account, accountId, accountData);
  }

}