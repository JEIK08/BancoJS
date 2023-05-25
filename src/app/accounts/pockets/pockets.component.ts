import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ToastController } from '@ionic/angular';

import { AccountService } from 'src/app/services/accounts.service';
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
  public debt!: number;
  public total: number;

  constructor(
    private accountService: AccountService,
    private toastController: ToastController
  ) {
    this.onClose = new EventEmitter();
    this.total = 0;
  }

  ngOnInit() {
    this.debt = this.account.debt!;
    this.pockets = JSON.parse(JSON.stringify(this.account.pockets));
    this.setTotal();
  }

  setTotal() {
    this.total = this.pockets!.reduce((total, pocket) => total + pocket.value, this.debt);
    console.log(this.pockets);
  }

  save() {
    if (this.total !== this.account.value) {
      this.toastController.create({
        message: 'La suma de los valores de los bolsillos debe ser igual al valor de la cuenta',
        duration: 3000
      }).then(toast => toast.present());
      return;
    }
    this.accountService.updateAccountPockets(this.account.id, this.pockets).then(() => this.onClose.emit());
  }

}
