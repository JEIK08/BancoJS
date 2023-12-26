import { Injectable } from '@angular/core';
import { from, map, take } from 'rxjs';

import { Auth, User, signInWithEmailAndPassword, user } from '@angular/fire/auth';

@Injectable()
export class AuthService {

  private user: User | null = null;

  constructor(private auth: Auth) {
    console.log('Create AuthService Instance');
  }

  isLoggedUser() {
    return user(this.auth).pipe(
      take(1),
      map(user => {
        this.user = user;
        return !!this.user;
      })
    );
  }

  logIn(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map(data => {
        this.user = data.user;
        return undefined;
      })
    );
  }

}
