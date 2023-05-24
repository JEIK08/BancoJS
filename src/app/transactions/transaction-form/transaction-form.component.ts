import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, delay, merge, takeUntil } from 'rxjs';

import { AccountService } from 'src/app/services/accounts.service';
import { TransactionsService } from 'src/app/services/transactions.service';
import { Account } from 'src/app/interfaces/account';
import { TransactionType } from 'src/app/interfaces/transaction';

@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss'],
})
export class TransactionFormComponent implements OnDestroy {

  @Output('onClose') public onClose: EventEmitter<void>;

  public form: FormGroup;
  public TransactionType: typeof TransactionType;
  public calendarInitialDate?: string;
  public timeZoneOffset: number;
  public accounts?: Account[];
  public destinationAccounts?: Account[];
  public showDestination: boolean;

  private activeAccounts?: Account[];
  private onDestroySubject: Subject<void>;

  constructor(
    private accountService: AccountService,
    private transactionsService: TransactionsService,
    private formBuilder: FormBuilder
  ) {
    this.onClose = new EventEmitter();
    this.TransactionType = TransactionType;
    const today = new Date();
    this.timeZoneOffset = today.getTimezoneOffset() * 60 * 1000;
    this.showDestination = false;
    this.onDestroySubject = new Subject();
    this.accountService.getAccounts().subscribe(accounts => {
      this.accounts = accounts;
      this.activeAccounts = accounts.filter(({ isActive }) => isActive);
    });
    this.form = this.formBuilder.group({
      description: [null, Validators.required],
      type: [TransactionType.OUT, Validators.required],
      value: [0, Validators.required],
      date: [new Date(), Validators.required],
      origin: this.formBuilder.group({
        account: [null, Validators.required],
        pocket: [null]
      }, { validators: [this.isValidAccount] }),
      destination: this.formBuilder.group({
        account: [null],
        pocket: [null]
      })
    });

    this.form.get('destination')!.setValidators((control: AbstractControl) => this.requiredDestinationAccount(control));

    this.form.get('origin.account')!.valueChanges.pipe(takeUntil(this.onDestroySubject)).subscribe((newAccount: Account) => {
      this.form.get('origin.pocket')!.setValue(newAccount.isActive ? newAccount.pockets![0] : null);
    });
    this.form.get('destination.account')!.valueChanges.pipe(takeUntil(this.onDestroySubject)).subscribe((newAccount: Account) => {
      this.form.get('destination.pocket')!.setValue(newAccount?.isActive ? newAccount.pockets![0] : null);
    });

    merge(this.form.get('type')!.valueChanges, this.form.get('origin.account')!.valueChanges)
      .pipe(takeUntil(this.onDestroySubject), delay(0)).subscribe(() => {
        const { type, origin: { account } } = this.form.value;
        let newShowDestination: boolean = false;
        let newDestinationAccounts: Account[] | undefined;

        switch (type) {
          case TransactionType.OUT:
            if (account) {
              newShowDestination = !account.isActive;
              newDestinationAccounts = this.activeAccounts;
            } else {
              newShowDestination = false;
              newDestinationAccounts = undefined;
            }
            break;

          case TransactionType.TRANSFER:
            newShowDestination = true;
            newDestinationAccounts = this.accounts;
            break;

          case TransactionType.IN:
            newShowDestination = false;
            newDestinationAccounts = undefined;
            break;
        }

        if ((this.showDestination && !newShowDestination) || this.destinationAccounts !== newDestinationAccounts) {
          this.form.get('destination.account')!.setValue(null);
        }
        this.showDestination = newShowDestination;
        this.destinationAccounts = newDestinationAccounts;
        this.form.get('destination')!.updateValueAndValidity();
      });
  }

  private isValidAccount(group: AbstractControl) {
    return group.value.account ? null : { invalidAccount: true };
  }

  private requiredDestinationAccount(group: AbstractControl) {
    return this.showDestination ? this.isValidAccount(group) : null;
  }

  setTransactionType(newType: TransactionType) {
    if (this.form.value.type != newType) this.form.get('type')!.setValue(newType);
  }

  initCalendarDate() {
    this.calendarInitialDate = (new Date((this.form.value.date as Date).getTime() - this.timeZoneOffset)).toISOString();
  }

  setDate(event: any) {
    this.form.get('date')?.setValue(new Date(event.detail.value));
  }

  onSubmit() {
    this.transactionsService.createTransaction(this.form.value);
  }

  ngOnDestroy() {
    this.onDestroySubject.next();
    this.onDestroySubject.complete();
  }

}
