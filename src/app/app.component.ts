import { Component } from '@angular/core';

import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    IonApp,
    IonRouterOutlet
  ]
})
export class AppComponent { }

// TODO: Filtro de bolsillos en el form de transacciones
// TODO: Agregar bolsillo a transacciones con crédito
// TODO: Limpiar imports, tanto en el componente como en las utils
// TODO: Transacciones a la misma cuenta