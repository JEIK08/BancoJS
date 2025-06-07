import { AbstractControl } from '@angular/forms';
import { filter, map, pairwise, startWith } from 'rxjs';

export const onEnabledChange = (control: AbstractControl) => {
  return control.statusChanges.pipe(
    startWith('DISABLED', control.status),
    map(status => status !== 'DISABLED'),
    pairwise(),
    filter(([wasEnabled, isEnabled]) => wasEnabled !== isEnabled),
    map(([, isEnabled]) => isEnabled)
  );
}