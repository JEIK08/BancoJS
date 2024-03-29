import { enableProdMode, importProvidersFrom } from '@angular/core';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { environment } from './environments/environment';

import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { connectFirestoreEmulator, getFirestore, provideFirestore } from '@angular/fire/firestore';

import { AuthService } from './app/services/auth.service';
import { FirestoreService } from './app/services/firestore.service';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    AuthService,
    FirestoreService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
    importProvidersFrom([
      provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
      provideAuth(() => {
        const auth = getAuth();
        if (!environment.production) connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        return auth;
      }),
      provideFirestore(() => {
        const firestore = getFirestore();
        if (!environment.production) connectFirestoreEmulator(firestore, 'localhost', 8080);
        return firestore;
      }),
    ])
  ],
});
