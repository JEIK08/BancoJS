import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, merge, takeUntil } from 'rxjs';

import { AccountService } from 'src/app/services/accounts.service';

import { Account } from 'src/app/interfaces/account';
import { TransactionType } from 'src/app/interfaces/transaction';
import { TransactionsService } from 'src/app/services/transactions.service';

@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss'],
})
export class TransactionFormComponent implements OnDestroy {

  @Output('onClose') public onClose: EventEmitter<void>;

  public form: FormGroup;
  public calendarInitialDate?: string;
  public timeZoneOffset: number;
  public accounts?: Account[];
  public activeAccounts?: Account[];
  public TransactionType: typeof TransactionType;

  private onDestroySubject: Subject<void>;

  constructor(
    private accountService: AccountService,
    private transactionsService: TransactionsService,
    private formBuilder: FormBuilder
  ) {
    this.onClose = new EventEmitter();
    const today = new Date();
    this.timeZoneOffset = today.getTimezoneOffset() * 60 * 1000;
    this.accountService.getAccounts().subscribe(accounts => {
      this.accounts = accounts;
      this.activeAccounts = accounts.filter(({ isActive }) => isActive);
    });
    this.TransactionType = TransactionType;
    this.onDestroySubject = new Subject();
    this.form = this.formBuilder.group({
      description: [null, Validators.required],
      type: [TransactionType.OUT, Validators.required],
      value: [0, Validators.required],
      date: [new Date(), Validators.required],
      account: [null, Validators.required],
      activeAccount: [null],
      installments: [null],
      destination: [null],
      affectDebts: [true],
      showAffectDebts: [false]
    });

    this.form.get('type')?.valueChanges.pipe(takeUntil(this.onDestroySubject)).subscribe((newType: TransactionType) => {
      this.form.get('destination')?.setValidators(newType == TransactionType.TRANSFER ? Validators.required : null);
    });
    merge(this.form.get('account')!.valueChanges, this.form.get('destination')!.valueChanges).subscribe((x) => {
      setTimeout(() => {
        if (this.form.value.type != TransactionType.TRANSFER) {
          this.form.get('showAffectDebts')!.setValue(false);
          return;
        }
        this.form.get('showAffectDebts')!.setValue(this.form.value.account && this.form.value.destination
          && this.form.value.account.isActive != this.form.value.destination.isActive);
      });
    });
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
