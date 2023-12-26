import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ViewWillEnter } from '@ionic/angular';

import { AuthService } from '../services/auth.service';
import { AccountService } from './services/accounts.service';

import { IMPORTS, addComponentIcons } from './home.utils';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: IMPORTS
})
export default class HomeComponent implements ViewWillEnter {

  public isFormOpen: boolean = false;
  private isLoggingOut: boolean = false;

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private router: Router
  ) {
    addComponentIcons();
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

}