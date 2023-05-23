import { Component } from '@angular/core';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage {

  public isFormOpen: boolean;

  constructor() {
    this.isFormOpen = true;
  }

}