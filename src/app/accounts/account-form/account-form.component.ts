import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { AccountService } from 'src/app/services/accounts.service';

import { Account } from 'src/app/interfaces/account';

@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.scss'],
})
export class AccountFormComponent implements OnDestroy {

  @Output('onClose') public onClose: EventEmitter<void>;

  public form: FormGroup;
  public accounts?: Account[];

  private onDestroySub: Subject<void>;

  constructor(
    private accountService: AccountService,
    private formBuilder: FormBuilder
  ) {
    this.onClose = new EventEmitter();
    this.onDestroySub = new Subject();
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      account: [null],
      isActive: [true, Validators.required]
    });
    this.form.get('account')!.valueChanges.pipe(takeUntil(this.onDestroySub)).subscribe((newAccount: Account) => {
      if (newAccount) this.form.get('isActive')!.setValue(newAccount.isActive);
    });
    this.accountService.getAccounts().pipe(takeUntil(this.onDestroySub)).subscribe(accounts => this.accounts = accounts);
  }

  onSubmit() {
    this.accountService.createAccount(this.form.getRawValue()).then(() => this.onClose.emit());
  }

  ngOnDestroy(): void {
    this.onDestroySub.next();
    this.onDestroySub.complete();
  }

}
