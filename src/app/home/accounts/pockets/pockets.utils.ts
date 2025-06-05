import { CurrencyPipe, NgClass } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import {
  IonButton,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonRow,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeCircleOutline, addCircleOutline } from 'ionicons/icons';

export const IMPORTS = [
  CurrencyPipe,
  NgClass,
  ReactiveFormsModule,
  IonButton,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonRow,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar
];

export const addComponentIcons = () => {
  addIcons({ closeCircleOutline, addCircleOutline });
};