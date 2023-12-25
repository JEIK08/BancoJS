import { Injectable } from '@angular/core';
import { from, map } from 'rxjs';

import { Auth, User, signInWithEmailAndPassword, user } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private user: User | null = null;

  constructor(private auth: Auth) {
    user(auth).subscribe((user: User | null) => this.user = user);
  }

  logIn(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(map(() => undefined));
  }

}
