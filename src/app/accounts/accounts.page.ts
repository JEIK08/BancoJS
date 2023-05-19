import { Component } from '@angular/core';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
})
export class AccountsPage {

  public isFormOpen: boolean;

  constructor() {
    this.isFormOpen = false;
  }

}
