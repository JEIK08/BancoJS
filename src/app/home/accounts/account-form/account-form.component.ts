import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AccountService } from 'src/app/home/services/accounts.service';

import { IMPORTS } from './account.form.utils';

@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.scss'],
  standalone: true,
  imports: IMPORTS
})
export class AccountFormComponent {

  @Output() public closeModal: EventEmitter<void> = new EventEmitter();

  public form: FormGroup;
  public isLoading: boolean = false;

  constructor(
    private accountService: AccountService,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      isActive: [true]
    });
  }

  onSubmit() {
    this.isLoading = true;
    this.accountService.createAccount(this.form.value).subscribe(() => this.closeModal.emit());
  }

}
