import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AccountService } from 'src/app/services/accounts.service';

@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.scss'],
})
export class AccountFormComponent implements OnDestroy {

  @Output('onClose') public onClose: EventEmitter<void>;

  public form: FormGroup;

  private changeSubs: Subscription;

  constructor(
    private accountService: AccountService,
    private formBuilder: FormBuilder
  ) {
    this.onClose = new EventEmitter;
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      isActive: [true],
      value: [0, Validators.required],
      debt: [0],
      account: [null]
    });
    this.form.get('debt')!.setValidators((control: AbstractControl) => {
      return this.form.get('isActive')!.value ? Validators.required(control) : null;
    })
    this.changeSubs = this.form.get('isActive')!.valueChanges.subscribe((newIsActive: boolean) => {
      this.form.get('debt')!.setValue(newIsActive ? 0 : null);
    });
  }

  onSubmit() {
    this.accountService.createAccount(this.form.value).then(() => this.onClose.emit());
  }

  ngOnDestroy(): void {
    this.changeSubs.unsubscribe();
  }

}
