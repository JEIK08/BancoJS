import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Collection, FirebaseService } from './firebase.service';

import { Account } from '../interfaces/account';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private accountsSubject: BehaviorSubject<Account[]>;

  constructor(private firebaseService: FirebaseService) {
    this.accountsSubject = new BehaviorSubject<Account[]>([]);
    this.firebaseService.listenCollection(Collection.Account, () => this.updateAccounts());
  }

  private updateAccounts() {
    this.firebaseService.getDocuments<Account>(Collection.Account).then(accounts => this.accountsSubject.next(accounts));
  }

  getAccounts() {
    return this.accountsSubject;
  }

  createAccount(accountData: any, pockets: string[]) {
    const account: Account = accountData;
    account.value = 0;
    account.debt = 0;
    account.pockets = pockets.map(pocket => ({ name: pocket, value: 0 }));
    account.pockets.unshift({ name: 'Disponible', value: 0 });
    return this.firebaseService.addDocument(Collection.Account, accountData);
  }

}