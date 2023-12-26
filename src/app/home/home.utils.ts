import {
  IonFab,
  IonFabButton,
  IonIcon,
  IonLabel,
  IonModal,
  IonTabBar,
  IonTabButton,
  IonTabs
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cashOutline, listOutline, powerOutline, add } from 'ionicons/icons';

import { TransactionFormComponent } from './transaction-form/transaction-form.component';

export const IMPORTS = [
  IonFab,
  IonFabButton,
  IonIcon,
  IonLabel,
  IonModal,
  IonTabBar,
  IonTabButton,
  IonTabs,
  TransactionFormComponent
];

export const addComponentIcons = () => {
    addIcons({ cashOutline, listOutline, powerOutline, add });
};