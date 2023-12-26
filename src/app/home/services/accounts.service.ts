import { Injectable } from '@angular/core';
import { BehaviorSubject, concatMap, tap } from 'rxjs';

import { Collection, FirebaseService } from './firebase.service';

import { Account, Pocket } from '../../interfaces/account';

@Injectable()
export class AccountService {

  private accountsSubject: BehaviorSubject<Account[] | undefined>;

  constructor(private firebaseService: FirebaseService) {
    this.accountsSubject = new BehaviorSubject(undefined as any);
    this.firebaseService.listenCollection(Collection.Account).pipe(
      concatMap(() => this.firebaseService.getDocuments<Account>(Collection.Account)),
      tap(accounts => console.log('update accounts list', accounts))
    ).subscribe(accounts => this.accountsSubject.next(accounts));
    // TODO: Stop listening on logout
    // TODO: Check received data on changes, verify if request or update in front
  }

  getAccounts() {
    return this.accountsSubject;
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

  updateAccountPockets(accountId: string, debt: number, pockets: Pocket[]) {
    return this.firebaseService.updateDocument<Account>(Collection.Account, accountId, { debt, pockets });
  }

}