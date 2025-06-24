import { CurrencyPipe, NgClass } from '@angular/common';

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
  IonReorder,
  IonReorderGroup,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleSharp, chevronDownOutline, reorderTwoOutline } from 'ionicons/icons';

import { AccountFormComponent } from './account-form/account-form.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';

export const IMPORTS = [
  CurrencyPipe,
  NgClass,

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
  IonReorder,
  IonReorderGroup,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,

  AccountFormComponent,
  AccountSettingsComponent
];

export const addComponentIcons = () => {
  addIcons({ addCircleSharp, chevronDownOutline, reorderTwoOutline });
};