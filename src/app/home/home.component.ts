import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { delay, filter, take, tap } from 'rxjs';

import { Platform } from '@ionic/angular';

import { AuthService } from '../services/auth.service';
import { AccountService } from './services/accounts.service';
import { OcrService } from './services/ocr.service';

import { TransactionFormComponent } from './transaction-form/transaction-form.component';
import { IMPORTS, addComponentIcons } from './home.utils';
import { TransactionType } from '../interfaces/transaction';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: IMPORTS
})
export default class HomeComponent {

  @ViewChild(TransactionFormComponent) public transactionForm!: TransactionFormComponent;

  public isFormOpen = false;
  public isProcessingImg = false;
  public showIntentError = false;
  public isDev = !environment.production;

  private isLoggingOut = false;
  private fromIntent = false;

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private accountService: AccountService,
    private ocrService: OcrService,
    private router: Router
  ) {
    addComponentIcons();
    this.accountService.listenAccounts();

    this.platform.ready()
      .then(() => this.ocrService.getIntentData())
      .then(image => {
        if (!image) return;
        this.fromIntent = true;
        this.isProcessingImg = true;
        return this.ocrService.getImageData(image);
      })
      .then(data => {
        if (!data) return;
        this.openFormWith(data);
      }).catch(() => {
        this.isProcessingImg = false;
        this.showIntentError = true;
      });

    this.accountService.onChangeBoxValue().subscribe(({ accountId, difference }) => {
      this.openFormWith({
        type: TransactionType.IN,
        value: difference,
        date: new Date(),
        account: accountId
      });
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

  selectFile(event: any) {
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    this.isProcessingImg = true;

    reader.onload = () => {
      this.ocrService.getImageData(reader.result as string).then(data => {
        this.openFormWith(data);
      }).catch(() => {
        this.isProcessingImg = false;
        this.showIntentError = true;
      });
    };
  }

  private openFormWith(data: any) {
    this.accountService.getAccounts().pipe(
      filter(accounts => !!accounts),
      take(1),
      tap(() => this.isFormOpen = true),
      delay(0)
    ).subscribe(() => {
      this.isProcessingImg = false;
      this.transactionForm.initFormWith(data);
    });
  }

  closeIntent() {
    if (this.fromIntent) this.ocrService.terminate();
  }

}