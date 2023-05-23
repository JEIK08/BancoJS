import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Collection, FirebaseService } from './firebase.service';

import { Account } from '../interfaces/account';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private accountsSubject: BehaviorSubject<Account[] | undefined>;

  constructor(private firebaseService: FirebaseService) {
    this.accountsSubject = new BehaviorSubject<Account[] | undefined>(undefined);
    this.firebaseService.listenCollection(Collection.Account, () => this.updateAccounts());
  }

  private updateAccounts() {
    const accountsObj: { [id: string]: Account } = {};
    const mainAccounts: Account[] = [];
    this.firebaseService.getDocuments<Account>(Collection.Account, account => {
      accountsObj[account.id] = account;
      if (!account.account) mainAccounts.push(account);
    }).then(accounts => {
      accounts.forEach(account => {
        if (account.account) account.account = accountsObj[account.account.id];
        if (!account.innerAccounts.length) return;
        account.innerAccounts.forEach((innerAccount, index) => {
          account.innerAccounts[index] = accountsObj[innerAccount.id];
        });
      });
      this.accountsSubject.next(mainAccounts);
    });
  }

  getAccounts() {
    return this.accountsSubject;
  }

  createAccount(accountData: any) {
    const parentAccount = accountData.account as Account;
    accountData.innerAccounts = [];

    if (parentAccount) {
      accountData.account = this.firebaseService.getDocumentRef(Collection.Account, parentAccount.id);
      if (parentAccount.innerAccounts.length == 0) {
        accountData.value = parentAccount.value;
        if (accountData.isActive) accountData.debt = parentAccount.debt;
      } else {
        accountData.value = 0;
        if (accountData.isActive) accountData.debt = 0;
      }
      return this.firebaseService.addDocument(Collection.Account, accountData).then(newAccountRef => {
        const innerAccounts = parentAccount.innerAccounts.map(({ id }) => {
          return this.firebaseService.getDocumentRef(Collection.Account, id);
        });
        innerAccounts.push(this.firebaseService.getDocumentRef(Collection.Account, newAccountRef.id));
        return this.firebaseService.updateDocument(Collection.Account, parentAccount.id, { innerAccounts });
      });
    } else {
      accountData.value = 0;
      if (accountData.isActive) accountData.debt = 0;
      return this.firebaseService.addDocument(Collection.Account, accountData);
    }
  }

}