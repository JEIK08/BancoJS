import { CurrencyPipe, NgClass, NgTemplateOutlet } from '@angular/common';

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
import { PocketsComponent } from './pockets/pockets.component';

export const IMPORTS = [
  CurrencyPipe,
  NgClass,
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
  AccountFormComponent,
  PocketsComponent
];

export const addComponentIcons = () => {
  addIcons({ addCircleSharp, chevronDownOutline });
};