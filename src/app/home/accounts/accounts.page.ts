import { Component } from '@angular/core';
import { forkJoin, takeUntil } from 'rxjs';

import { AccountService } from '../services/accounts.service';
import { AuthService } from 'src/app/services/auth.service';

import { Account } from 'src/app/interfaces/account';
import { IMPORTS, addComponentIcons } from './accounts.utils';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  standalone: true,
  imports: IMPORTS
})
export default class AccountsPage {

  public accounts?: Account[];
  public accordeonValues?: string[];
  public disableReorder = false;
  public isFormOpen: boolean = false;
  public selectedAccount?: Account;

  constructor(
    private accountsService: AccountService,
    private authService: AuthService
  ) {
    addComponentIcons();
    this.accountsService.getAccounts().pipe(
      takeUntil(this.authService.onLogOut())
    ).subscribe(accounts => {
      this.accordeonValues = [];
      this.accounts = accounts;
    });
  }

  editAccountsOrder() {
    this.disableReorder = !this.disableReorder;
    if (this.disableReorder || !this.accounts) return;
    const accounts = this.accounts;
    this.accounts = undefined;
    forkJoin(accounts.map(({ id }, index) => this.accountsService.updateAccount(id, { order: index }))).subscribe();
  }

}
