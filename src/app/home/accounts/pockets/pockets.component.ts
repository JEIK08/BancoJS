import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ToastController } from '@ionic/angular';

import { AccountService } from 'src/app/home/services/accounts.service';
import { Account, Pocket } from 'src/app/interfaces/account';

@Component({
  selector: 'app-pockets',
  templateUrl: './pockets.component.html',
  styleUrls: ['./pockets.component.scss'],
})
export class PocketsComponent implements OnInit {

  @Input() public account!: Account;
  @Output('onClose') public onClose: EventEmitter<void>;

  public pockets!: Pocket[];
  public available!: number;
  public debt!: number;
  public total!: number;

  constructor(
    private accountService: AccountService,
    private toastController: ToastController
  ) {
    this.onClose = new EventEmitter();
  }

  ngOnInit() {
    this.available = this.account.pockets[0].value;
    this.debt = this.account.debt;
    this.pockets = JSON.parse(JSON.stringify(this.account.pockets.slice(1)));
    this.setTotal();
  }

  deletePocket(index: number) {
    this.pockets.splice(index, 1);
    this.setTotal();
  }

  setTotal() {
    this.total = this.pockets.reduce((total, pocket) => total + pocket.value, this.debt + this.available);
    this.total = Math.round(this.total * 100) / 100;
  }

  save() {
    if (this.total !== this.account.value) {
      this.toastController.create({
        message: 'La suma de los valores de los bolsillos debe ser igual al valor de la cuenta',
        duration: 3000
      }).then(toast => toast.present());
      return;
    }
    if (this.account.isActive) {
      this.account.debt;
    }
    this.accountService.updateAccountPockets(
      this.account.id,
      this.debt,
      [{ name: this.account.pockets[0].name, value: this.available }, ...this.pockets]
    ).then(() => this.onClose.emit());
  }

}
