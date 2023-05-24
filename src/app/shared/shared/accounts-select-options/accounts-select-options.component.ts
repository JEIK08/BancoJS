import { Component, AfterViewInit, ContentChild, ViewChild, TemplateRef, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Account } from 'src/app/interfaces/account';

type TemplateContext = TemplateRef<{ $implicit: Account, paddingClass: 'lvl-0' | 'lvl-1' | 'lvl-2' }>;

@Component({
  selector: 'app-accounts-select-options',
  templateUrl: './accounts-select-options.component.html',
  styleUrls: ['./accounts-select-options.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AccountsSelectOptionsComponent),
      multi: true,
    }
  ]
})
export class AccountsSelectOptionsComponent implements AfterViewInit, ControlValueAccessor {

  @Input('accounts') public accounts?: Account[];
  @Input('label') public label!: string;
  @Input('allowClear') public allowClear: boolean;
  @ContentChild('customTemplate') externalTemplate?: TemplateContext;
  @ViewChild('internalTemplate') internalTemplate?: TemplateContext;

  public onChange: Function;
  public onTouched: Function;

  public optionTemplate?: TemplateContext;
  public account?: Account;

  constructor() {
    this.onTouched = () => { };
    this.onChange = () => { };
    this.accounts = [];
    this.allowClear = true;
  }

  ngAfterViewInit(): void {
    this.optionTemplate = this.externalTemplate ?? this.internalTemplate;
  }

  setValue(event: any) {
    if (event) event = event.detail.value;
    this.writeValue(event);
    this.onChange(event)
  }

  writeValue(value: any) {
    this.account = value;
  }

  registerOnChange(fn: Function) {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function) {
    this.onTouched = fn;
  }

}
