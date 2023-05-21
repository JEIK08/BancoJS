import { Component } from '@angular/core';

import { AccountService } from '../services/accounts.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
})
export class AccountsPage {

  public isFormOpen: boolean;

  constructor(private accountsService: AccountService) {
    this.isFormOpen = false;
    this.accountsService.getAccounts().subscribe(data => {
      console.log('New Accounts', data);
    });
  }

}
