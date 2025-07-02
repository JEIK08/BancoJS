import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemReorderEventDetail } from '@ionic/angular';

import { IonContent } from '@ionic/angular/standalone';

import { AccountService } from 'src/app/home/services/accounts.service';

import { Account, Pocket } from 'src/app/interfaces/account';
import { IMPORTS, addComponentIcons } from './account-settings.utils';
import { IsNumber } from '../../validators/validators';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss'],
  standalone: true,
  imports: IMPORTS
})
export class AccountSettingsComponent implements OnInit, AfterViewInit {

  @ViewChild(IonContent) public content!: IonContent;

  @Input() public account!: Account;
  @Output() public closeModal: EventEmitter<void> = new EventEmitter();

  public form!: FormGroup;
  public pockets?: FormArray<FormGroup>;

  public total = 0;
  public isLoading: boolean = false;

  private scrollElement?: HTMLElement;

  constructor(
    private accountService: AccountService,
    private formBuilder: FormBuilder
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
      if (this.account.boxValue) {
        this.form.addControl('boxValue', this.formBuilder.control(this.account.boxValue, IsNumber));
      }
    } else {
      this.form.addControl('limit', this.formBuilder.control(this.account.limit, IsNumber));
    }
  }

  ngAfterViewInit() {
    if (this.account.isActive) this.content.getScrollElement().then(element => this.scrollElement = element);
  }

  validatePockets() {
    this.total = this.pockets!.controls.reduce((total, pocket) => total + pocket.value.value, 0);
    this.total = Math.round(this.total * 100) / 100;
    return this.total === this.account.value ? null : { noTotal: true };
  }

  addPocket(pocket?: Pocket) {
    const newPocket = this.formBuilder.group({
      name: [pocket?.name, Validators.required],
      value: [pocket?.value ?? 0, IsNumber]
    });
    this.pockets!.push(newPocket);
  }

  deletePocket(index: number) {
    this.pockets!.removeAt(index);
    this.pockets!.markAsDirty();
  }

  dragPocket({ from, to, complete }: ItemReorderEventDetail) {
    if (from <= 1 || to <= 1) {
      complete(false);
      return;
    }

    const scroll = this.scrollElement?.scrollTop;
    const reorderedPockets = complete(this.pockets!.value) as Pocket[];
    this.pockets!.clear();
    reorderedPockets.forEach(pocket => this.addPocket(pocket));
    this.pockets!.markAsDirty();
    this.scrollElement!.scrollTo({ top: scroll });
  }

  save() {
    if (this.form.pristine) {
      this.closeModal.emit();
    } else {
      this.isLoading = true;
      this.accountService.updateAccount(this.account.id, this.form.value).subscribe(() => {
        this.closeModal.emit();
        if (!this.account.isActive || !this.account.boxValue) return;

        const oldBoxalue = this.account.boxValue;
        const newBoxalue = this.form.value.boxValue;
        if (newBoxalue === oldBoxalue) return;
        this.accountService.changeBoxValue(newBoxalue - oldBoxalue);
      });
    }
  }

}
