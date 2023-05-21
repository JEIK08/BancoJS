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

  constructor(
    private accountService: AccountService,
    private formBuilder: FormBuilder
  ) {
    this.onClose = new EventEmitter;
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      isActive: [true],
      value: [0, Validators.required],
      debt: [0, Validators.required],
      account: [null]
    });
  }

  onSubmit() {
    this.accountService.createAccount(this.form.value).then(() => this.onClose.emit());
  }

}
