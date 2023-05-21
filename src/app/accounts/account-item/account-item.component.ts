import { Component, Input, OnInit } from '@angular/core';
import { Account } from 'src/app/interfaces/account';

type ValueData = {
  value: number,
  color: 'red' | 'green'
}

@Component({
  selector: 'app-account-item',
  templateUrl: './account-item.component.html',
  styleUrls: ['./account-item.component.scss'],
})
export class AccountItemComponent implements OnInit {

  @Input() public account!: Account;
  public realValue?: ValueData;

  constructor() {
  }

  ngOnInit() {
    if (this.account.isActive) {
      const value = this.account.value - this.account.debt!;
      this.realValue = { value, color: value >= 0 ? 'green' : 'red' };
    }
  }

}
