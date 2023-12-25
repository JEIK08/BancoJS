import { Component } from '@angular/core';

import {
  IonApp,
  IonFab,
  IonFabButton,
  IonIcon,
  IonLabel,
  IonModal,
  IonTabBar,
  IonTabButton,
  IonTabs
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    IonApp,
    IonFab,
    IonFabButton,
    IonIcon,
    IonLabel,
    IonModal,
    IonTabBar,
    IonTabButton,
    IonTabs
  ]
})
export class AppComponent {

  public isFormOpen: boolean;

  constructor() {
    this.isFormOpen = false;
  }

}
