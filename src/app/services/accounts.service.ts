import { Injectable } from '@angular/core';

import { Firestore, collection, getDocs, query, addDoc, onSnapshot, doc, where, limit } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

import { Collections } from './firebase.service';
import { Account } from '../interfaces/account';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  public accountsSubject: BehaviorSubject<Account[] | undefined>;

  constructor(private firestore: Firestore) {
    this.accountsSubject = new BehaviorSubject<Account[] | undefined>(undefined);
    onSnapshot(collection(this.firestore, Collections.Account), () => this.updateAccounts());
  }

  private updateAccounts(parentAccount: Account | null = null) {
    getDocs(query(collection(
      this.firestore, Collections.Account),
      where('account', '==', parentAccount?.id ? doc(this.firestore, `/${ Collections.Account }/${ parentAccount.id }`) : null)
    )).then(({ docs }) => {
      const accounts = docs.map(accountObject => {
        const account = accountObject.data() as Account;
        account.id = accountObject.id;
        this.updateAccounts(account);
        return account;
      });

      if (parentAccount) {
        parentAccount.innerAccounts = accounts;
      } else {
        this.accountsSubject.next(accounts);
      }
    });
  }

  public getAccounts() {
    return this.accountsSubject;
  }

  public createAccount(account: Account) {
    if (account.account) {
      const parentAccount = account.account as Account;
      account.account = doc(this.firestore, `/${ Collections.Account }/${ parentAccount.id }`) as any;

      return getDocs(query(
        collection(this.firestore, Collections.Account),
        where('account', '==', account.account),
        limit(1)
      )).then(({ size }) => {
        if (size == 0) {
          account.value = parentAccount.value;
          if (account.isActive) account.debt = parentAccount.debt;
        } else {
          account.value = 0;
          if (account.isActive) account.debt = 0;
        }
        return addDoc(collection(this.firestore, Collections.Account), account);
      });
    } else {
      account.value = 0;
      if (account.isActive) account.debt = 0;
      return addDoc(collection(this.firestore, Collections.Account), account);
    }
  }

}