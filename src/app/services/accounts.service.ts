import { Injectable } from '@angular/core';

import { Firestore, collection, getDocs, query, addDoc, onSnapshot, doc, where, limit } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

import { Collections, FirebaseService } from './firebase.service';
import { Account } from '../interfaces/account';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  public accountsSubject: BehaviorSubject<Account[] | undefined>;

  constructor(
    private firestore: Firestore,
    private firebaseService: FirebaseService
  ) {
    this.accountsSubject = new BehaviorSubject<Account[] | undefined>(undefined);
    onSnapshot(collection(this.firestore, Collections.Account), () => this.updateAccounts());
  }

  private updateAccounts() {
    getDocs(query(collection(this.firestore, Collections.Account)))
      .then(data => this.accountsSubject.next(
        this.firebaseService.mapDocs<Account>(data)
      ));
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