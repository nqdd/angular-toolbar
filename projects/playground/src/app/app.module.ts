import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgxToolbarModule } from '@ngx-toolbar';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxToolbarModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
