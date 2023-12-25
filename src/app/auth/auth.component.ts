import { Component } from '@angular/core';

import { IonContent, IonInput, IonItem, IonList } from '@ionic/angular/standalone';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonInput,
    IonItem,
    IonList
  ]
})
export default class AuthComponent {

  constructor() { }

}
