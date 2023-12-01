import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ToolbarComponent, ToolbarItemDirective } from './toolbar.component';
import { ToolbarCollapseButtonTemplateDirective, ToolbarItemTemplateDirective } from './toolbar.directive';

@NgModule({
  declarations: [
    ToolbarComponent,
    ToolbarItemDirective,
    ToolbarItemTemplateDirective,
    ToolbarCollapseButtonTemplateDirective
  
  ],
  imports: [CommonModule],
  exports: [
    ToolbarComponent,
    ToolbarItemTemplateDirective,
    ToolbarCollapseButtonTemplateDirective
  ],
})
export class ToolbarModule {}
