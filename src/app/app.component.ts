import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="flex items-center justify-items-center">
      <app-toolbar [elementGap]="8">
        <ng-container *ngFor="let _ of [].constructor(100); let idx = index">
          <ng-template appToolbarItemTemplate>
            <button>Button {{ idx }}</button>
          </ng-template>
        </ng-container>
        <ng-template appToolbarCollapseButtonTemplate>More</ng-template>
      </app-toolbar>
    </div>
  `,
  styles: [],
})
export class AppComponent {
  title = 'angular-toolbar';
}
