import { Component } from '@angular/core';

import { addIcons } from 'ionicons';
import { addCircleSharp, chevronDownOutline } from 'ionicons/icons';

import { AccountService } from '../services/accounts.service';

import { Account } from 'src/app/interfaces/account';
import { IMPORTS } from './accounts.utils';

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
  public isFormOpen: boolean;
  public selectedAccount?: Account;

  constructor(private accountsService: AccountService) {
    addIcons({ addCircleSharp, chevronDownOutline });
    this.isFormOpen = false;
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
