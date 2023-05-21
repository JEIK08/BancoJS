import { Injectable } from '@angular/core';

import { Firestore, collection, getDocs, query, addDoc, onSnapshot } from '@angular/fire/firestore';
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
      .then(data => this.firebaseService.mapDocs<Account[]>(data))
      .then(data => this.accountsSubject.next(data));
  }

  public getAccounts() {
    return this.accountsSubject;
  }

  public createAccount(account: Account) {
    return addDoc(collection(this.firestore, Collections.Account), account);
  }

}