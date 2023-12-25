import { enableProdMode } from '@angular/core';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { environment } from './environments/environment';

import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
  ],
});
