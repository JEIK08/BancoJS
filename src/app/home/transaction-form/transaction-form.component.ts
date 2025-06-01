import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, delay, merge, takeUntil } from 'rxjs';

import { AccountService } from 'src/app/home/services/accounts.service';
import { TransactionsService } from 'src/app/home/services/transactions.service';

import { Account } from 'src/app/interfaces/account';
import { TransactionType } from 'src/app/interfaces/transaction';
import { IMPORTS, addComponentIcons } from './transaction-forn.utils';

@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss'],
  standalone: true,
  imports: IMPORTS
})
export class TransactionFormComponent implements OnDestroy {

  @Output() public closeModal: EventEmitter<void> = new EventEmitter();

  public form: FormGroup;
  public calendarInitialDate?: string;
  public accounts?: Account[];
  public destinationAccounts?: Account[];
  public TransactionType: typeof TransactionType = TransactionType;
  public timeZoneOffset: number = (new Date()).getTimezoneOffset() * 60 * 1000;
  public showDestination: boolean = false;
  public showToast: boolean = false;
  public isLoading: boolean = false;

  private activeAccounts?: Account[];
  private onDestroySubject: Subject<void> = new Subject();

  constructor(
    private accountService: AccountService,
    private transactionsService: TransactionsService,
    private formBuilder: FormBuilder
  ) {
    addComponentIcons();
    this.accountService.getAccounts().subscribe(accounts => {
      this.accounts = accounts;
      this.activeAccounts = accounts?.filter(({ isActive }) => isActive);
    });
    this.form = this.formBuilder.group({
      description: [null, Validators.required],
      type: [TransactionType.OUT, Validators.required],
      value: [null, Validators.required],
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

    this.form.get('type')!.valueChanges.pipe(takeUntil(this.onDestroySubject)).subscribe(() => {
      this.form.get('destination.account')!.setValue(null);
      if (this.form.value.origin.pocket === 0) this.form.get('origin.pocket')!.setValue(this.form.value.origin.account.pockets[0]);
    });
    this.form.get('origin.account')!.valueChanges.pipe(takeUntil(this.onDestroySubject)).subscribe((newAccount: Account) => {
      this.form.get('origin.pocket')!.setValue(newAccount.isActive ? newAccount.pockets[0] : null);
    });
    this.form.get('destination.account')!.valueChanges.pipe(takeUntil(this.onDestroySubject)).subscribe((newAccount: Account) => {
      this.form.get('destination.pocket')!.setValue(newAccount?.isActive ? newAccount.pockets[0] : null);
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

        const toHideDestination = this.showDestination && !newShowDestination;
        this.showDestination = newShowDestination;
        this.destinationAccounts = newDestinationAccounts;
        if (toHideDestination) this.form.get('destination.account')!.setValue(null);
        else this.form.get('destination')!.updateValueAndValidity();
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
    this.form.get('date')!.setValue(new Date(event.detail.value));
  }

  onSubmit() {
    const { type, origin: { account: origin }, destination: { account: destination } } = this.form.value;
    if (type == TransactionType.TRANSFER && origin === destination) {
      this.showToast = true;
      return;
    }
    this.isLoading = true;
    this.transactionsService.createTransaction(this.form.getRawValue()).subscribe(() => this.closeModal.emit());
  }

  ngOnDestroy() {
    this.onDestroySubject.next();
    this.onDestroySubject.complete();
  }

}
