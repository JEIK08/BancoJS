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
// TODO: Agregar bolsillo a transacciones con crédito
// TODO: Transacciones a la misma cuenta
// TODO: autocapitalize="sentences" a todos los ion-inputs
// TODO: takeUntilDestroyed: import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// TODO: Limpiar imports, tanto en el componente como en las utils
// TODO: Verificar estilos
// TODO: Formatear código