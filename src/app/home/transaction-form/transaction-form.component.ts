import { Component, Output, EventEmitter, DestroyRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest, debounceTime, filter, map, merge, pairwise, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AccountService } from 'src/app/home/services/accounts.service';
import { TransactionsService } from 'src/app/home/services/transactions.service';

import { Account, Pocket } from 'src/app/interfaces/account';
import { TransactionType } from 'src/app/interfaces/transaction';
import { IMPORTS, addComponentIcons } from './transaction-form.utils';
import { IsNumber } from '../validators/validators';

@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss'],
  standalone: true,
  imports: IMPORTS
})
export class TransactionFormComponent {

  @Output() public closeModal: EventEmitter<void> = new EventEmitter();

  public form: FormGroup;
  public accounts?: Account[];
  public calendarInitialDate?: string;
  public timeZoneOffset: number = (new Date()).getTimezoneOffset() * 60 * 1000;
  public filteredPockets?: Pocket[];
  public destinationAccounts?: Account[];
  public showToast: boolean = false;
  public isLoading: boolean = false;
  public TransactionType = TransactionType;

  private activeAccounts?: Account[];

  constructor(
    private accountService: AccountService,
    private transactionsService: TransactionsService,
    private formBuilder: FormBuilder,
    private destroyRef: DestroyRef
  ) {
    addComponentIcons();

    this.accountService.getAccounts().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(accounts => {
      this.accounts = accounts;
      this.activeAccounts = accounts?.filter(({ isActive }) => isActive);
    });

    this.form = this.formBuilder.group({
      description: [undefined, this.validateDescription],
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
      takeUntilDestroyed(this.destroyRef),
      map(() => this.form.value.origin as { account?: Account, pocket?: Pocket }),
      filter(({ account, pocket }) => !!(account?.isActive && pocket === account.pockets[0])),
      map(({ account }) => account as Account),
    ).subscribe(account => this.form.get('origin.pocket')!.setValue(account.pockets?.[1]));

    this.form.get('origin.account')!.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
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
      takeUntilDestroyed(this.destroyRef)
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
      takeUntilDestroyed(this.destroyRef),
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

    merge(
      this.form.get('origin.pocket')!.valueChanges,
      this.form.get('destination.pocket')!.valueChanges
    ).pipe(
      takeUntilDestroyed(this.destroyRef),
      debounceTime(10)
    ).subscribe(() => this.form.get('description')?.updateValueAndValidity());
  }

  validateDescription(control: FormControl) {
    if (!control.parent) return null;
    const formValue = control.parent.value;
    return (formValue.origin.pocket || formValue.destination?.pocket) ? null : Validators.required(control);
  }

  initFormWith(receiptData: any) {
    this.form.get('type')!.setValue(receiptData.type);
    this.form.get('value')!.setValue(receiptData.value);
    this.form.get('date')!.setValue(receiptData.date);
    this.form.get('origin.account')!.setValue(this.accounts?.find(({ id }) => id === receiptData.account));
    if (receiptData.destination) {
      this.form.get('destination.account')!.setValue(this.accounts?.find(({ id }) => id === receiptData.destination));
    }
  }

  initCalendarDate() {
    this.calendarInitialDate = (new Date((this.form.value.date as Date).getTime() - this.timeZoneOffset)).toISOString();
  }

  setDate(event: any) {
    this.form.get('date')!.setValue(new Date(event.detail.value));
  }

  filterPockets(filter: string, isOrigin: boolean) {
    this.filteredPockets = isOrigin ? this.form.value.origin.account.pockets : this.form.value.destination.account.pockets;
    this.filteredPockets = isOrigin && this.form.value.type === TransactionType.TRANSFER
      ? this.filteredPockets
      : this.filteredPockets!.slice(1);
    if (!filter) return;
    filter = filter.toLowerCase();
    this.filteredPockets = this.filteredPockets!.filter(({ name }) => name.toLowerCase().includes(filter));
  }

  selectPocket(controlRoute: string, pocket: Pocket) {
    const control = this.form.get(controlRoute) as FormControl;
    control.setValue(pocket);
    control.markAsDirty();
    control.markAsTouched();
  }

  onSubmit() {
    const formValue = this.form.value;
    if (formValue.origin.pocket && formValue.origin.pocket === formValue.destination?.pocket) {
      this.showToast = true;
      return;
    }
    this.isLoading = true;
    this.transactionsService.createTransaction(this.form.value).subscribe(() => this.closeModal.emit());
  }

}