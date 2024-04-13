import { Directive } from '@angular/core';

@Directive({
  selector: '[ngxToolbarItem]',
})
export class NgxToolbarItemDirective {}

@Directive({
  selector: 'ng-template[ngxToolbarItem]',
})
export class NgxToolbarItemTemplateDirective {}

@Directive({
  selector: 'ng-template[ngxToolbarExtraButton]',
})
export class NgxToolbarExtraButtonDirective {}
