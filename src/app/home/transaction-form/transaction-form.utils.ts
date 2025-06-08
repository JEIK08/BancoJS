import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { HideOnDisableDirective } from '../directives/hide-on-disable.directive';

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
  IonLabel,
  IonList,
  IonModal,
  IonRow,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { calendarOutline, timeOutline } from 'ionicons/icons';

export const IMPORTS = [
  ReactiveFormsModule,
  CurrencyPipe,
  DatePipe,
  NgClass,

  HideOnDisableDirective,

  IonButton,
  IonCol,
  IonContent,
  IonDatetime,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonRow,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
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