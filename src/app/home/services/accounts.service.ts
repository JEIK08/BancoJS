import { Injectable } from '@angular/core';
import { BehaviorSubject, concatMap, takeUntil, tap } from 'rxjs';

import { Collection, FirestoreService } from '../../services/firestore.service';
import { AuthService } from 'src/app/services/auth.service';

import { Account } from '../../interfaces/account';
import { orderBy } from '@angular/fire/firestore';

@Injectable()
export class AccountService {

  private accountsSubject: BehaviorSubject<Account[] | undefined>;

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
  ) {
    this.accountsSubject = new BehaviorSubject(undefined as any);
  }

  listenAccounts() {
    this.firestoreService.listenCollection(Collection.Account).pipe(
      takeUntil(
        this.authService.onLogOut().pipe(
          tap(() => this.accountsSubject.next(undefined))
        )
      ),
      
      concatMap(() => this.firestoreService.getDocuments<Account>(Collection.Account/* , { queryConstrains: [orderBy('order', 'asc')] } */)),
      // tap(() => {
      //   this.firestoreService.getDocuments<Account>(Collection.Account).subscribe(accounts => {
      //     accounts.forEach((account: any, index) => {
      //       const id = account.id;
      //       delete account.id;
      //       if (account.isActive && 'debt' in account && account.pockets[0].name !== 'Deuda') {
      //         account.pockets.unshift({ name: 'Deuda', value: account.debt });
      //         delete account.debt;
      //       }

      //       if (!('order' in account)) {
      //         account.order = index;
      //       }

      //       this.firestoreService.setDocument(Collection.Account, id, account);
      //     });
      //   });
      // })
    ).subscribe(accounts => this.accountsSubject.next(accounts));
  }

  getAccounts() {
    return this.accountsSubject;
  }

  createAccount({ name, isActive }: Pick<Account, 'name' | 'isActive'>) {
    const account: Partial<Account> = {
      name,
      isActive,
      value: 0,
      order: this.accountsSubject.value?.length
    };
    if (isActive) account.pockets = [{ name: 'Deuda', value: 0 }, { name: 'Disponible', value: 0 }];
    return this.firestoreService.addDocument(Collection.Account, account);
  }

  updateAccount(accountId: string, accountData: Partial<Account>) {
    return this.firestoreService.updateDocument<Account>(Collection.Account, accountId, accountData);
  }

}