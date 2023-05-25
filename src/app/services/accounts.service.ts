import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, from, debounceTime, concatMap } from 'rxjs';

import { Collection, FirebaseService } from './firebase.service';

import { Account } from '../interfaces/account';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private accountsSubject: Subject<void>;
  private accountsBehavior: BehaviorSubject<Account[]>;

  constructor(private firebaseService: FirebaseService) {
    this.accountsSubject = new Subject();
    this.accountsBehavior = new BehaviorSubject<Account[]>([]);
    this.firebaseService.listenCollection(Collection.Account, () => this.accountsSubject.next());
    this.accountsSubject.pipe(
      debounceTime(1000),
      concatMap(() => from(this.firebaseService.getDocuments<Account>(Collection.Account)))
    ).subscribe(data => this.accountsBehavior.next(data));
  }

  getAccounts() {
    return this.accountsBehavior;
  }

  createAccount(accountData: any, pockets: string[] | null) {
    const account: Account = accountData;
    account.value = 0;
    if (pockets) {
      account.debt = 0;
      account.pockets = pockets.map(pocket => ({ name: pocket, value: 0 }));
      account.pockets.unshift({ name: 'Disponible', value: 0 });
    }
    return this.firebaseService.addDocument(Collection.Account, accountData);
  }

}