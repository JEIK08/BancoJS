import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { AccountService } from 'src/app/services/accounts.service';

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
  public calendarInitialDate?: string;
  public timeZoneOffset: number;
  public accounts!: Account[];
  public TransactionType: typeof TransactionType;

  private onDestroySubject: Subject<void>;

  constructor(
    private accountService: AccountService,
    private formBuilder: FormBuilder
  ) {
    this.onClose = new EventEmitter();
    const today = new Date();
    this.timeZoneOffset = today.getTimezoneOffset() * 60 * 1000;
    this.accountService.getAccounts().subscribe(accounts => this.accounts = accounts!);
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
      affectDebts: [true]
    });

    this.form.get('type')?.valueChanges.pipe(takeUntil(this.onDestroySubject)).subscribe((newType: TransactionType) => {
      this.form.get('destination')?.setValidators(newType == TransactionType.TRANSFER ? Validators.required : null);
    });
  }

  initCalendarDate() {
    this.calendarInitialDate = (new Date((this.form.get('date')?.value as Date).getTime() - this.timeZoneOffset)).toISOString();
  }

  setDate(event: any) {
    this.form.get('date')?.setValue(new Date(event.detail.value));
  }

  onSubmit() {

  }

  ngOnDestroy() {
    this.onDestroySubject.next();
    this.onDestroySubject.complete();
  }

}
