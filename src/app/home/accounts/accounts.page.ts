import { Component } from '@angular/core';
import { takeUntil } from 'rxjs';

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

}
