import { Directive } from '@angular/core';

@Directive({
  selector: 'ng-template[appToolbarItemTemplate]',
})
export class ToolbarItemTemplateDirective {}

@Directive({
  selector: 'ng-template[appToolbarCollapseButtonTemplate]',
})
export class ToolbarCollapseButtonTemplateDirective {}


