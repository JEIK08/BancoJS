import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, combineLatest, filter, map, pairwise, startWith, takeUntil } from 'rxjs';

import { AccountService } from 'src/app/home/services/accounts.service';
import { TransactionsService } from 'src/app/home/services/transactions.service';

import { Account, Pocket } from 'src/app/interfaces/account';
import { TransactionType } from 'src/app/interfaces/transaction';
import { IMPORTS, addComponentIcons } from './transaction-forn.utils';
import { IsNumber } from '../validators/validators';

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
  public accounts?: Account[];
  public calendarInitialDate?: string;
  public timeZoneOffset: number = (new Date()).getTimezoneOffset() * 60 * 1000;
  public destinationAccounts?: Account[];
  public showToast: boolean = false;
  public isLoading: boolean = false;
  public TransactionType = TransactionType;

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
      description: [undefined, Validators.required],
      type: [TransactionType.OUT],
      value: [undefined, IsNumber],
      date: [new Date()],
      origin: this.formBuilder.group({
        account: [undefined, Validators.required],
        pocket: [{ value: undefined, disabled: true }]
      }),
      destination: this.formBuilder.group({
        account: [{ value: undefined, disabled: true }, Validators.required],
        pocket: [{ value: undefined, disabled: true }]
      })
    });

    this.form.get('type')!.valueChanges.pipe(
      takeUntil(this.onDestroySubject),
      map(() => this.form.value.origin as { account?: Account, pocket?: Pocket }),
      filter(({ account, pocket }) => !!(account?.isActive && pocket === account.pockets[0])),
      map(({ account }) => account as Account),
    ).subscribe(account => this.form.get('origin.pocket')!.setValue(account.pockets?.[1]));

    this.form.get('origin.account')!.valueChanges.pipe(
      takeUntil(this.onDestroySubject)
    ).subscribe(({ isActive, pockets }: Account) => {
      const pocketControl = this.form.get('origin.pocket')!;
      if (isActive) {
        pocketControl.enable();
        pocketControl.setValue(pockets[1]);
      } else {
        pocketControl.disable();
      }
    });

    this.form.get('destination.account')!.valueChanges.pipe(
      takeUntil(this.onDestroySubject)
    ).subscribe((destinationAccount?: Account) => {
      const pocketControl = this.form.get('destination.pocket')!;
      if (destinationAccount && destinationAccount.isActive) {
        pocketControl.enable();
        pocketControl.setValue(destinationAccount.pockets[1]);
      } else {
        pocketControl.disable();
      }
    });

    combineLatest([
      this.form.get('type')!.valueChanges.pipe(startWith(this.form.value.type)),
      this.form.get('origin.account')!.valueChanges
    ]).pipe(
      map(([type, account]: [TransactionType, Account]) => {
        if (type === TransactionType.OUT && !account.isActive) return 'PASIVE_T';
        if (type === TransactionType.TRANSFER) return 'TRANSFER_T';
        return undefined;
      }),
      startWith(undefined),
      pairwise(),
      filter(([from, to]) => from !== to),
      map(([, state]) => state),
      takeUntil(this.onDestroySubject),
    ).subscribe(newState => {
      const destinationAccount = this.form.get('destination.account') as FormControl;
      switch (newState) {
        case 'PASIVE_T': {
          destinationAccount.enable();
          this.destinationAccounts = this.activeAccounts;
          break;
        }

        case 'TRANSFER_T': {
          destinationAccount.enable();
          this.destinationAccounts = this.accounts;
          break;
        }

        case undefined: {
          destinationAccount.disable();
          this.destinationAccounts = undefined;
          break;
        }
      }
    });
  }

  initCalendarDate() {
    this.calendarInitialDate = (new Date((this.form.value.date as Date).getTime() - this.timeZoneOffset)).toISOString();
  }

  setDate(event: any) {
    this.form.get('date')!.setValue(new Date(event.detail.value));
  }

  onSubmit() {
    const formValue = this.form.value;
    if (formValue.type == TransactionType.TRANSFER && formValue.origin.account === formValue.destination?.account) {
      this.showToast = true;
      return;
    }
    this.isLoading = true;
    this.transactionsService.createTransaction(this.form.value).subscribe(() => this.closeModal.emit());
  }

  ngOnDestroy() {
    this.onDestroySubject.next();
    this.onDestroySubject.complete();
  }

}
