import { CurrencyPipe, DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  IonButton,
  IonCol,
  IonContent,
  IonDatetime,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonModal,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToast,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, timeOutline } from 'ionicons/icons';

export const IMPORTS = [
  FormsModule,
  ReactiveFormsModule,
  CurrencyPipe,
  DatePipe,
  NgClass,
  NgTemplateOutlet,

  IonButton,
  IonCol,
  IonContent,
  IonDatetime,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonModal,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToast,
  IonToolbar
];

export const addComponentIcons = () => {
  addIcons({ calendarOutline, timeOutline });
};