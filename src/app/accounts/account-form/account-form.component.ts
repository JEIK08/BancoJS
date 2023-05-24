import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AccountService } from 'src/app/services/accounts.service';

@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.scss'],
})
export class AccountFormComponent {

  @Output('onClose') public onClose: EventEmitter<void>;

  public form: FormGroup;
  public pocketName: string;
  public pockets: string[];

  constructor(
    private accountService: AccountService,
    private formBuilder: FormBuilder
  ) {
    this.onClose = new EventEmitter();
    this.pocketName = '';
    this.pockets = [];
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      isActive: [true]
    });
  }

  addPocket() {
    this.pocketName = this.pocketName.trim();
    if (!this.pocketName) return;
    this.pockets.push(this.pocketName);
    this.pocketName = '';
  }

  onSubmit() {
    this.accountService.createAccount(this.form.getRawValue(), this.pockets).then(() => this.onClose.emit());
  }

}
