import { Directive } from '@angular/core';

@Directive({
  selector: 'ng-template[toolbarItemTemplate]',
})
export class ToolbarItemTemplateDirective {}

@Directive({
  selector: 'ng-template[toolbarCollapseButtonTemplate]',
})
export class ToolbarCollapseButtonTemplateDirective {}


