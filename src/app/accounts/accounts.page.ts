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
  public isFormOpen: boolean;

  constructor(private accountsService: AccountService) {
    this.isFormOpen = false;
    this.accountsService.getAccounts().subscribe(accounts => {
      console.log('New Accounts', accounts);
      this.accounts = accounts;
    });
  }

}
