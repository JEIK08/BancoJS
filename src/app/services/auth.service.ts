import { Injectable } from '@angular/core';
import { from, map } from 'rxjs';

import { Auth, User, signInWithEmailAndPassword, user } from '@angular/fire/auth';

@Injectable()
export class AuthService {

  private user: User | null = null;

  constructor(private auth: Auth) {
    console.log('Create AuthService Instance');
    user(auth).subscribe((user: User | null) => {
      console.log('User status', user);
      this.user = user;
    });
  }

  logIn(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(map(() => undefined));
  }

}
