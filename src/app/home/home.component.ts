import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

import { Platform, ViewWillEnter } from '@ionic/angular';

import { AuthService } from '../services/auth.service';
import { AccountService } from './services/accounts.service';
import { OcrService } from './services/ocr.service';

import { TransactionFormComponent } from './transaction-form/transaction-form.component';
import { IMPORTS, addComponentIcons } from './home.utils';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: IMPORTS
})
export default class HomeComponent implements ViewWillEnter {
  @ViewChild(TransactionFormComponent) public transactionForm!: TransactionFormComponent;

  public isFormOpen: boolean = false;
  public isDev = !environment.production;
  private isLoggingOut: boolean = false;

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private accountService: AccountService,
    private ocrService: OcrService,
    private router: Router
  ) {
    addComponentIcons();

    this.platform.ready().then(() => this.ocrService.processReceipt()).then(data => this.initFormWith(data));
  }

  logOut() {
    if (this.isLoggingOut) return;
    this.isLoggingOut = true;
    this.authService.logOut().subscribe(() => {
      this.router.navigate(['login'], { replaceUrl: true });
      this.isLoggingOut = false;
    });
  }

  ionViewWillEnter() {
    this.accountService.listenAccounts();
  }

  selectFile(event: any) {
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);

    reader.onload = () => {
      this.ocrService.readImage(reader.result as string).then(data => {
        console.log(data);
        this.initFormWith(data);
      });
    };
  }

  private initFormWith(receiptData: any) {
    if (!receiptData) return;
    this.isFormOpen = true;
    setTimeout(() => {
      const form = this.transactionForm.form;
      form.get('type')!.setValue(receiptData.type);
      form.get('value')!.setValue(receiptData.value);
      form.get('date')!.setValue(receiptData.date);
      form.get('origin.account')!.setValue(this.transactionForm.accounts?.find(({ id }) => id === receiptData.account));
      if (receiptData.destination) {
        form.get('destination.account')!.setValue(this.transactionForm.accounts?.find(({ id }) => id === receiptData.destination));
      }
    });
  }

}