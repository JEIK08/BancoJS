import { Injectable } from '@angular/core';
import { BehaviorSubject, concatMap, takeUntil, tap } from 'rxjs';

import { Collection, FirestoreService } from '../../services/firestore.service';
import { AuthService } from 'src/app/services/auth.service';

import { Account } from '../../interfaces/account';

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
      concatMap(() => this.firestoreService.getDocuments<Account>(Collection.Account)),
      // tap(() => {
      //   this.firestoreService.getDocuments<Account>(Collection.Account).subscribe(accounts => {
      //     accounts.forEach((account: any) => {
      //       if (!account.isActive || !account.debt || account.pockets[0].name === 'Deuda') return;
      //       const id = account.id;
      //       delete account.id;
      //       account.pockets.unshift({ name: 'Deuda', value: account.debt });
      //       delete account.debt;
      //       this.firestoreService.setDocument(Collection.Account, id, account).subscribe();
      //     });
      //   });
      // })
    ).subscribe(accounts => this.accountsSubject.next(accounts));
  }

  getAccounts() {
    return this.accountsSubject;
  }

  createAccount(accountData: any, pockets: string[] | null) {
    const account: Account = accountData;
    account.value = 0;
    if (pockets) {
      account.pockets = pockets.map(pocket => ({ name: pocket, value: 0 }));
      account.pockets.unshift({ name: 'Disponible', value: 0 });
      account.pockets.unshift({ name: 'Deuda', value: 0 });
    }
    return this.firestoreService.addDocument(Collection.Account, accountData);
  }

  updateAccount(accountId: string, accountData: Pick<Account, 'name' | 'pockets'>) {
    return this.firestoreService.updateDocument<Account>(Collection.Account, accountId, accountData);
  }

}