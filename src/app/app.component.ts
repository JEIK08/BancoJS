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

// Filtro de bolsillos en el form de transacciones
// Agregar bolsillo a transacciones con crédito
// Transacciones a la misma cuenta
// autocapitalize="sentences" a todos los ion-inputs
// takeUntilDestroyed: import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// ><
// TODO: Limpiar imports, tanto en el componente como en las utils
// TODO: Verificar estilos
// TODO: Formatear código