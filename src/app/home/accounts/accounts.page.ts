import { Component } from '@angular/core';

import { AccountService } from '../services/accounts.service';

import { Account } from 'src/app/interfaces/account';
import { IMPORTS, addComponentIcons } from './accounts.utils';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrl: './accounts.page.scss',
  standalone: true,
  imports: IMPORTS
})
export default class AccountsPage {

  public accounts?: Account[];
  public accordeonValues?: string[];
  public isFormOpen: boolean = true;
  public selectedAccount?: Account;

  constructor(private accountsService: AccountService) {
    addComponentIcons();
    this.accountsService.getAccounts().subscribe(accounts => {
      this.accordeonValues = [];
      this.accounts = accounts;
    });
  }

  selectAccount(account: Account) {
    if (!account.isActive) return;
    this.selectedAccount = account;
  }

}
