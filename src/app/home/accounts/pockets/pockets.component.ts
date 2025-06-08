import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemReorderEventDetail } from '@ionic/angular';

import { AccountService } from 'src/app/home/services/accounts.service';

import { Account, Pocket } from 'src/app/interfaces/account';
import { IMPORTS, addComponentIcons } from './pockets.utils';
import { IsNumber } from '../../validators/validators';

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

  public form!: FormGroup;
  public pockets!: FormArray<FormGroup>;

  public total = 0;
  public isLoading: boolean = false;

  constructor(
    private accountService: AccountService,
    private formBuilder: FormBuilder,
  ) {
    addComponentIcons();
  }

  ngOnInit() {
    this.form = this.formBuilder.group({ name: [this.account.name, Validators.required] });

    if (this.account.isActive) {
      this.pockets = this.formBuilder.array<FormGroup>([]);
      this.form.addControl('pockets', this.pockets);
      this.account.pockets.forEach(pocket => this.addPocket(pocket));
      this.form.setValidators(() => this.validatePockets());
    }
  }

  validatePockets() {
    this.total = this.pockets.controls.reduce((total, pocket) => total + pocket.value.value, 0);
    this.total = Math.round(this.total * 100) / 100;
    return this.total === this.account.value ? null : { noTotal: true };
  }

  addPocket(pocket?: Pocket) {
    const newPocket = this.formBuilder.group({
      name: [pocket?.name, Validators.required],
      value: [pocket?.value ?? 0, IsNumber]
    });
    this.pockets.push(newPocket);
  }

  deletePocket(index: number) {
    this.pockets.removeAt(index);
  }

  dragPocket({ from, to, complete }: ItemReorderEventDetail) {
    if (from <= 1 || to <= 1) {
      complete(false);
      return;
    }

    const reorderedPockets = complete(this.pockets.value) as Pocket[];
    this.pockets.clear();
    reorderedPockets.forEach(pocket => this.addPocket(pocket));
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
