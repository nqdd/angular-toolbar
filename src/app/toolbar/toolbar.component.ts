import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  NgZone,
  OnDestroy,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ToolbarCollapseButtonTemplateDirective, ToolbarItemTemplateDirective } from './toolbar.directive';

@Directive({
  selector: '[toolbarItem]',
})
export class ToolbarItemDirective {}


@Component({
  selector: 'app-toolbar',
  template: `
    <div class="toolbar" #toolbar>
      <div class="toolbar-panel" #panel> 
        <ng-container *ngFor="let template of templates">
          <div class="toolbar-item" toolbarItem>
            <ng-container *ngTemplateOutlet="template"></ng-container>
          </div>
        </ng-container>
      </div>

      <div class="toolbar-anchor">
        <ng-container *ngTemplateOutlet="collapseTemplate">
        </ng-container>
        <div class="hidden-templates">
          <ng-container *ngFor="let template of hiddenTemplates">
              <ng-template *ngTemplateOutlet="template"></ng-template>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./toolbar.component.scss'],
  providers: [],
})
export class ToolbarComponent implements AfterContentInit, AfterViewInit, OnDestroy {
  @ViewChild('toolbar', { static: true }) toolbar!: ElementRef<HTMLDivElement>;
  @ViewChild('panel', {static: true}) panel!: ElementRef<HTMLDivElement>;

  @ViewChildren(ToolbarItemDirective, { read: ElementRef})
  toolbarItems?: QueryList<ElementRef<HTMLDivElement>>;

  @ContentChild(ToolbarCollapseButtonTemplateDirective, { read: TemplateRef })
  collapseTemplate: TemplateRef<ToolbarCollapseButtonTemplateDirective> | null = null;

  @ContentChildren(ToolbarItemTemplateDirective, { read: TemplateRef })
  set _itemTemplates(
    value: QueryList<TemplateRef<ToolbarItemTemplateDirective>>
  ) {
    this.templates = value?.toArray();
  }

  public templates?: TemplateRef<ToolbarItemTemplateDirective>[];
  public hiddenTemplates?: TemplateRef<ToolbarItemTemplateDirective>[];

  private _hiddenIds$ = new BehaviorSubject<number[]>([]);
  private _destroy$ = new Subject<void>();
 
  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._detectHiddenElements();
    }, 0)
  }

  ngAfterContentInit(): void {
    this._displayElements();
  }

  private _displayElements() {
    this._hiddenIds$.subscribe((ids) => {
      this.hiddenTemplates = this.templates?.filter((_, index) => ids.includes(index));
      this.templates = this.templates?.filter((_, index) => !ids.includes(index));
    });
  }

  private _detectHiddenElements() {
    const hiddenIds: number[] = [];
    const paneOffsetRight = this.panel.nativeElement.getBoundingClientRect().right;
    this.toolbarItems?.forEach((item, index) => {
      const offset = item.nativeElement.getBoundingClientRect().right;
      if (offset > paneOffsetRight) {
        hiddenIds.push(index);
      }
    });
    this._hiddenIds$.next(hiddenIds);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
