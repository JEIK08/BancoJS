import { Component } from '@angular/core';

import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cashOutline, listOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [
    IonIcon,
    IonLabel,
    IonTabBar,
    IonTabButton,
    IonTabs
  ]
})
export default class HomeComponent {

  constructor() {
    addIcons({ cashOutline, listOutline });
  }

}