import { Injectable } from '@angular/core';

import { Firestore, collection, getDocs, query, addDoc, onSnapshot, doc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

import { Collections } from './firebase.service';
import { Account } from '../interfaces/account';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private accountsSubject: BehaviorSubject<Account[] | undefined>;

  constructor(private firestore: Firestore) {
    this.accountsSubject = new BehaviorSubject<Account[] | undefined>(undefined);
    onSnapshot(collection(this.firestore, Collections.Account), () => this.updateAccounts());
  }

  private updateAccounts() {
    getDocs(query(collection(this.firestore, Collections.Account))).then(({ docs }) => {
      const accountsObj: { [id: string]: Account } = {};
      const allAccounts: Account[] = [];
      const mainAccounts: Account[] = [];
      docs.forEach(accountDoc => {
        const account = accountDoc.data() as Account;
        account.id = accountDoc.id;
        accountsObj[account.id] = account;
        allAccounts.push(account);
        if (!account.account) mainAccounts.push(account);
      });

      allAccounts.forEach(account => {
        if (account.account) account.account = accountsObj[account.account.id];
        if (!account.innerAccounts.length) return;
        account.innerAccounts.forEach((innerAccount, index) => {
          account.innerAccounts[index] = accountsObj[innerAccount.id];
        });
      });

      this.accountsSubject.next(mainAccounts);
    });
  }

  public getAccounts() {
    return this.accountsSubject;
  }

  public createAccount(accountData: any) {
    const parentAccount = accountData.account as Account;
    accountData.innerAccounts = [];

    if (parentAccount) {
      accountData.account = doc(this.firestore, `/${ Collections.Account }/${ parentAccount.id }`) as any;
      if (parentAccount.innerAccounts.length == 0) {
        accountData.value = parentAccount.value;
        if (accountData.isActive) accountData.debt = parentAccount.debt;
      } else {
        accountData.value = 0;
        if (accountData.isActive) accountData.debt = 0;
      }
      return addDoc(collection(this.firestore, Collections.Account), accountData).then(newAccountDoc => {
        const innerAccounts = parentAccount.innerAccounts.map(({ id }) => (
          doc(this.firestore, `/${ Collections.Account }/${ id }`)
        ));
        innerAccounts.push(doc(this.firestore, `/${ Collections.Account }/${ newAccountDoc.id }`));
        return updateDoc(doc(this.firestore, `/${ Collections.Account }/${ parentAccount.id }`), { innerAccounts });
      });
    } else {
      accountData.value = 0;
      if (accountData.isActive) accountData.debt = 0;
      return addDoc(collection(this.firestore, Collections.Account), accountData);
    }
  }

}