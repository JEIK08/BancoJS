import { Injectable } from '@angular/core';
import { concatMap, from, map, of, take } from 'rxjs';

import { Auth, User, signInWithEmailAndPassword, user } from '@angular/fire/auth';

@Injectable()
export class AuthService {

  private user: User | null = null;
  private claims: { isAdmin: boolean, database: string } = { isAdmin: false, database: '' };

  constructor(private auth: Auth) { }

  private saveUserData(user: User | null) {
    this.user = user;
    if (!user) return of(false);
    return from(user.getIdTokenResult()).pipe(
      map(results => {
        this.claims = results.claims as any;
        return !!this.user;
      })
    );
  }

  isLoggedUser() {
    return user(this.auth).pipe(
      take(1),
      concatMap(user => this.saveUserData(user))
    );
  }

  logIn(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      concatMap(({ user }) => this.saveUserData(user))
    );
  }

  getDatabaseName() {
    return this.claims.database;
  }

}
