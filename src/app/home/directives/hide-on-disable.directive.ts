import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { ControlContainer, FormControl } from '@angular/forms';
import { filter, map, pairwise, startWith, Subscription } from 'rxjs';

@Directive({
  selector: '[hideOnDisable]',
  standalone: true
})
export class HideOnDisableDirective implements OnInit, OnDestroy {

  @Input('hideOnDisable') controlName!: string;
  @Input() disabledValue?: any;

  private enableSubscription!: Subscription;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private controlContainer: ControlContainer,
    private templateRef: TemplateRef<any>
  ) { }

  ngOnInit() {
    const control = this.controlContainer.control?.get(this.controlName) as FormControl;
    this.enableSubscription = control.statusChanges.pipe(
      startWith('DISABLED', control.status),
      map(status => status !== 'DISABLED'),
      pairwise(),
      filter(([wasEnabled, isEnabled]) => wasEnabled !== isEnabled),
      map(([, isEnabled]) => isEnabled)
    ).subscribe(isEnable => {
      if (isEnable) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainerRef.clear();
        control.setValue(undefined);
      }
    });
  }

  ngOnDestroy() {
    this.enableSubscription.unsubscribe();
  }

}
