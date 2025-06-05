import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { AccountService } from 'src/app/home/services/accounts.service';

import { Account } from 'src/app/interfaces/account';
import { IMPORTS, addComponentIcons } from './pockets.utils';

@Component({
  selector: 'app-pockets',
  templateUrl: './pockets.component.html',
  styleUrls: ['./pockets.component.scss'],
  standalone: true,
  imports: IMPORTS
})
export class PocketsComponent implements OnInit {

  @Input() public account!: Account;
  @Output() public closeModal: EventEmitter<void> = new EventEmitter();

  public accountName!: string;
  public total = 0;
  public isLoading: boolean = false;

  public form!: FormGroup;
  public pockets!: FormArray<FormGroup>;

  constructor(
    private accountService: AccountService,
    private formBuilder: FormBuilder,
  ) {
    setTimeout(() => {
      (window as any).comp = this;
      (window as any).form = this.form;
    });
    addComponentIcons();
  }

  ngOnInit() {
    this.form = this.formBuilder.group({ name: [this.account.name, Validators.required] });

    if (this.account.isActive) {
      this.pockets = this.formBuilder.array<FormGroup>([]);
      this.form.addControl('debt', this.formBuilder.control(0, this.isNumber as ValidatorFn));
      this.form.addControl('pockets', this.pockets);
      this.account.pockets.forEach(() => this.addPocket());
      this.form.setValidators(() => this.validatePockets());
    }
    this.form.reset(this.account);
  }

  validatePockets() {
    this.total = this.pockets.controls.reduce(
      (total, pocket) => total + pocket.get('value')!.value,
      this.form.get('debt')!.value as number
    );
    this.total = Math.round(this.total * 100) / 100;
    return this.total === this.account.value ? null : { noTotal: true };
  }

  addPocket() {
    this.pockets.push(
      this.formBuilder.group({ name: ['', Validators.required], value: [0, this.isNumber] })
    );
  }

  isNumber(control: FormControl) {
    return typeof control.value === 'number' ? null : { notNumber: true };
  }

  deletePocket(index: number) {
    this.pockets.removeAt(index);
  }

  save() {
    if (this.form.pristine) {
      this.closeModal.emit();
    } else {
      this.isLoading = true;
      this.accountService.updateAccount(this.account.id, this.form.value).subscribe(() => this.closeModal.emit());
    }
  }

}
