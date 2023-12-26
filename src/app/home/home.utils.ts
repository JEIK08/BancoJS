import {
  IonFab,
  IonFabButton,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cashOutline, listOutline, powerOutline } from 'ionicons/icons';

export const IMPORTS = [
  IonFab,
  IonFabButton,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs
];

export const addComponentIcons = () => {
    addIcons({ cashOutline, listOutline, powerOutline });
};