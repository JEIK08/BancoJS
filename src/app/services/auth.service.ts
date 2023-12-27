import { Injectable } from '@angular/core';
import { Observable, concatMap, filter, from, map, of, take } from 'rxjs';

import { Auth, User, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';

import { FirebaseService } from '../home/services/firebase.service';

@Injectable()
export class AuthService {

  private logOutObservable: Observable<void>;

  constructor(
    private auth: Auth,
    private firebaseService: FirebaseService
  ) {
    this.logOutObservable = user(this.auth).pipe(
      filter(user => !user),
      map(() => {})
    );
  }

  private saveUserData(user: User | null) {
    if (!user) return of(false);
    return this.firebaseService.setUserDatabase(user.uid).pipe(map(() => true));
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

}
