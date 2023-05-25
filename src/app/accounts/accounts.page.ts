import { Component } from '@angular/core';

import { AccountService } from '../services/accounts.service';
import { Account } from '../interfaces/account';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
})
export class AccountsPage {

  public accounts?: Account[];
  public accordeonValues?: string[];
  public isFormOpen: boolean;

  constructor(private accountsService: AccountService) {
    this.isFormOpen = false;
    this.accountsService.getAccounts().subscribe(accounts => {
      this.accordeonValues = undefined;
      this.accounts = undefined;
      setTimeout(() => {
        this.accounts = accounts;
        this.accordeonValues = [];
      });
    });
  }

}
