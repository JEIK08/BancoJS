import { CurrencyPipe, NgTemplateOutlet } from '@angular/common';

import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleSharp, chevronDownOutline } from 'ionicons/icons';

import { AccountFormComponent } from './account-form/account-form.component';

export const IMPORTS = [
  CurrencyPipe,
  NgTemplateOutlet,
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  AccountFormComponent
];

export const addComponentIcons = () => {
  addIcons({ addCircleSharp, chevronDownOutline });
};