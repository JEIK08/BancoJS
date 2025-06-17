import {
  IonAlert,
  IonFab,
  IonFabButton,
  IonIcon,
  IonLabel,
  IonLoading,
  IonModal,
  IonTabBar,
  IonTabButton,
  IonTabs
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, cashOutline, documentOutline, listOutline, powerOutline } from 'ionicons/icons';

import { TransactionFormComponent } from './transaction-form/transaction-form.component';

export const IMPORTS = [
  IonAlert,
  IonFab,
  IonFabButton,
  IonIcon,
  IonLabel,
  IonLoading,
  IonModal,
  IonTabBar,
  IonTabButton,
  IonTabs,
  TransactionFormComponent
];

export const addComponentIcons = () => {
  addIcons({ add, cashOutline, documentOutline, listOutline, powerOutline });
};