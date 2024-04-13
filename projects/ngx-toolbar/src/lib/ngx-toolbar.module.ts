import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxToolbarComponent } from './ngx-toolbar.component';
import {
  NgxToolbarExtraButtonDirective,
  NgxToolbarItemDirective,
  NgxToolbarItemTemplateDirective,
} from './ngx-toolbar.directive';

@NgModule({
  declarations: [
    NgxToolbarComponent,
    NgxToolbarItemDirective,
    NgxToolbarItemTemplateDirective,
    NgxToolbarExtraButtonDirective,
  ],
  imports: [CommonModule],
  exports: [
    NgxToolbarComponent,
    NgxToolbarItemTemplateDirective,
    NgxToolbarExtraButtonDirective,
  ],
})
export class NgxToolbarModule {}
