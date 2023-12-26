import { Injectable } from '@angular/core';
import { Observable, concatMap, filter, from, map, of, take } from 'rxjs';

import { Auth, User, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';

@Injectable()
export class AuthService {

  private claims: { isAdmin: boolean, database: string } = { isAdmin: false, database: '' };
  private logOutObservable: Observable<null>;

  constructor(private auth: Auth) {
    this.logOutObservable = user(this.auth).pipe(
      filter(user => !user),
      map(() => {
        this.claims.isAdmin = false;
        this.claims.database = '';
        return null;
      })
    );
  }

  private saveUserData(user: User | null) {
    if (!user) return of(false);
    return from(user.getIdTokenResult()).pipe(
      map(results => {
        this.claims = results.claims as any;
        return !!user;
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

  onLogOut() {
    return this.logOutObservable;
  }

  logOut() {
    return from(signOut(this.auth));
  }

  getDatabaseName() {
    return this.claims.database;
  }

}
