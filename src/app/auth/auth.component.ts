import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { IonButton, IonContent, IonInput, IonItem, IonList, IonSpinner } from '@ionic/angular/standalone';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonButton,
    IonContent,
    IonInput,
    IonItem,
    IonList,
    IonSpinner
  ]
})
export default class AuthComponent {

  public form: FormGroup;
  public isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.form = this.formBuilder.group({
      email: ['jjsuarez8@hotmail.es', [Validators.required, Validators.email]],
      password: ['123456', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.authService.logIn(this.form.value.email, this.form.value.password).subscribe({
      next: loggedIn => {
        if (loggedIn) this.router.navigate([''], { replaceUrl: true });
      },
      error: () => this.isLoading = false
    });
  }

}
