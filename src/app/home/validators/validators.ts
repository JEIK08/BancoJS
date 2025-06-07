import { FormControl, ValidatorFn } from '@angular/forms';

export const IsNumber = ((control: FormControl) => typeof control.value === 'number' ? null : { notNumber: true }) as ValidatorFn;