import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div
      class="flex flex-col items-center justify-center h-screen w-100 bg-slate-800"
    >
      <div class="text-2xl text-gray-300 mb-20">Try resize the window</div>
      <div class="container h-40 w-full flex flex-col gap-4">
        <app-toolbar class="border-solid p-4 border-2 rounded">
          <ng-container *ngFor="let _ of [].constructor(100); let idx = index">
            <ng-template appToolbarItemTemplate>
              <button
                class="border-solid border-2 border-sky-500 bg-slate-500 rounded px-1.5"
                (click)="handleClick($event)"
              >
                Element {{ idx }}
              </button>
            </ng-template>
          </ng-container>
          <ng-template appToolbarCollapseButtonTemplate>
            <div>
              <button
                type="button"
                class="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                id="menu-button"
                aria-expanded="true"
                aria-haspopup="true"
              >
                More
                <ng-container *ngTemplateOutlet="arrowDownIcon"></ng-container>
              </button>
            </div>
          </ng-template>
        </app-toolbar>
      </div>
    </div>

    <ng-template #arrowDownIcon>
      <svg
        class="-mr-1 h-5 w-5 text-gray-400"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clip-rule="evenodd"
        />
      </svg>
    </ng-template>
  `,
})
export class AppComponent {
  public handleClick(event: MouseEvent): void {
    console.log(event);
  }
}
