import { Component } from '@angular/core';

import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [
    IonContent
  ]
})
export default class HomeComponent { }