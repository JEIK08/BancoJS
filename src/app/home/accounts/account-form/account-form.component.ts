import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AccountService } from 'src/app/home/services/accounts.service';

import { IMPORTS, addComponentIcons } from './account.form.utils';

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
  public pocketName: string = '';
  public pockets: string[] = [];
  public isLoading: boolean = false;

  constructor(
    private accountService: AccountService,
    private formBuilder: FormBuilder
  ) {
    addComponentIcons();
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
    this.isLoading = true;
    this.accountService.createAccount(this.form.getRawValue(), this.form.value.isActive ? this.pockets : null).then(() => this.closeModal.emit());
  }

}
