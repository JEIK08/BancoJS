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

  public isFormOpen = false;
  public isProcessingImg = false;
  public showIntentError = false;
  public isDev = !environment.production;

  private isLoggingOut = false;

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private accountService: AccountService,
    private ocrService: OcrService,
    private router: Router
  ) {
    addComponentIcons();

    this.platform.ready()
      .then(() => this.ocrService.getIntentData())
      .then(image => {
        if (!image) return;
        this.isProcessingImg = true;
        return this.ocrService.getImageData(image);
      })
      .then(data => {
        if (!data) return;
        this.isFormOpen = true;
        setTimeout(() => {
          this.transactionForm.initFormWith(data);
          this.isProcessingImg = false;
        });
      }).catch(() => {
        this.isProcessingImg = false;
        this.showIntentError = true;
      });
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
    this.isProcessingImg = true;

    reader.onload = () => {
      this.ocrService.getImageData(reader.result as string).then(data => {
        this.isProcessingImg = false;
        this.isFormOpen = true;
        setTimeout(() => this.transactionForm.initFormWith(data));
      }).catch(() => {
        this.isProcessingImg = false;
        this.showIntentError = true;
      });
    };
  }

  closeIntent() {
    this.ocrService.terminate();
  }

}