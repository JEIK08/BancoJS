import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ToastController } from '@ionic/angular';

import { AccountService } from 'src/app/home/services/accounts.service';

import { Account, Pocket } from 'src/app/interfaces/account';
import { IMPORTS, addComponentIcons } from './pockets.utils';

@Component({
  selector: 'app-pockets',
  templateUrl: './pockets.component.html',
  styleUrls: ['./pockets.component.scss'],
  standalone: true,
  imports: IMPORTS
})
export class PocketsComponent implements OnInit {

  @Input() public account!: Account;
  @Output() public closeModal: EventEmitter<void> = new EventEmitter();

  public pockets!: Pocket[];
  public available!: number;
  public debt!: number;
  public total!: number;
  public isLoading: boolean = false;

  constructor(
    private accountService: AccountService,
    private toastController: ToastController
  ) {
    addComponentIcons();
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

    this.isLoading = true;
    if (this.account.isActive) {
      this.account.debt;
    }
    this.accountService.updateAccountPockets(
      this.account.id,
      this.debt,
      [{ name: this.account.pockets[0].name, value: this.available }, ...this.pockets]
    ).subscribe(() => this.closeModal.emit());
  }

}
