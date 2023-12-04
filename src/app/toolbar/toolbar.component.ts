import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  HostBinding,
  Input,
  NgZone,
  OnDestroy,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Subject, debounceTime, fromEvent, startWith, takeUntil } from 'rxjs';
import { ELEMENT_GAP_DEFAULT } from './config';
import {
  ToolbarCollapseButtonTemplateDirective,
  ToolbarItemTemplateDirective,
} from './toolbar.directive';

@Directive({
  selector: '[appToolbarItem]',
})
export class ToolbarItemDirective {}

@Component({
  selector: 'app-toolbar',
  template: `
    <div class="toolbar" #toolbar>
      <div class="toolbar-panel" #panel>
        <ng-container
          *ngFor="let template of visibleTemplates; let idx = index"
        >
          <div
            appToolbarItem
            class="toolbar-item-visible"
            [style.marginLeft.px]="idx > 0 ? elementGap : 0"
          >
            <ng-container *ngTemplateOutlet="template"></ng-container>
          </div>
        </ng-container>
      </div>

      <div class="toolbar-anchor">
        <ng-container *ngIf="collapseTemplate">
          <ng-container *ngIf="hiddenTemplates?.length">
            <ng-container *ngTemplateOutlet="collapseTemplate"> </ng-container>
            <div class="hidden-templates border-solid border-1 rounded">
              <ng-container *ngFor="let template of hiddenTemplates">
                <div appToolbarItem class="toolbar-item-hidden">
                  <ng-template *ngTemplateOutlet="template"></ng-template>
                </div>
              </ng-container>
            </div>
          </ng-container>
        </ng-container>
      </div>
    </div>
  `,
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent
  implements AfterContentInit, AfterViewInit, OnDestroy
{
  @HostBinding('style.width') get hostWidth(): string {
    return this.toolbarWidth;
  }
  @Input() toolbarWidth: string = '100%';
  @Input() elementGap = ELEMENT_GAP_DEFAULT;

  @ViewChild('toolbar', { static: true })
  readonly toolbar!: ElementRef<HTMLDivElement>;
  @ViewChild('panel', { static: true })
  readonly panel!: ElementRef<HTMLDivElement>;

  @ContentChild(ToolbarCollapseButtonTemplateDirective, { read: TemplateRef })
  public readonly collapseTemplate?: TemplateRef<ToolbarCollapseButtonTemplateDirective>;

  @ViewChildren(ToolbarItemDirective, { read: ElementRef })
  private readonly _toolbarItems?: QueryList<ElementRef<HTMLDivElement>>;

  @ContentChildren(ToolbarItemTemplateDirective, { read: TemplateRef })
  private readonly _tooltipItemTemplates?: QueryList<
    TemplateRef<ToolbarItemTemplateDirective>
  >;

  public visibleTemplates: TemplateRef<ToolbarItemTemplateDirective>[] = [];
  public hiddenTemplates: TemplateRef<ToolbarItemTemplateDirective>[] = [];

  private readonly _hiddenIndex$ = new Subject<number | undefined>();
  private readonly _destroy$ = new Subject<void>();
  private _elementWidthMap: Record<number, number> = {};

  constructor(
    private _zone: NgZone,
    private _changeDetector: ChangeDetectorRef
  ) {
  
  }

  ngAfterContentInit(): void {
    this._displayElements();
  }

  ngAfterViewInit(): void {
    this._composeElementWidthMap();
    this._zone.runOutsideAngular(() => {
      fromEvent(window, 'resize')
        .pipe(takeUntil(this._destroy$), startWith(null), debounceTime(300))
        .subscribe(() => {
          this._detectHiddenElements();
        });
    });
  }

  private _composeElementWidthMap(): void {
    const elements = this._toolbarItems?.toArray() ?? [];
    this._elementWidthMap = elements.reduce((map, element, index) => {
      const previouseWidth = map[index - 1] ?? 0;
      const elementWidth = element.nativeElement.clientWidth;
      map[index] = elementWidth + previouseWidth + this.elementGap;
      return map;
    }, {} as Record<number, number>);
  }

  private _displayElements(): void {
    this._hiddenIndex$
      .pipe(
        takeUntil(this._destroy$),
        startWith(this._tooltipItemTemplates?.length ?? -1)
      )
      .subscribe((hiddenIndex) => {
        const templates = this._tooltipItemTemplates?.toArray() ?? [];
        this.hiddenTemplates = templates.slice(hiddenIndex);
        this.visibleTemplates = templates.slice(0, hiddenIndex);
        this._changeDetector.detectChanges();
      });
  }

  private _detectHiddenElements(): void {
    const panelWidth = this.panel?.nativeElement?.clientWidth;
    for (const index of Object.keys(this._elementWidthMap)) {
      const width = this._elementWidthMap[Number(index)];
      if (width >= panelWidth) {
        this._hiddenIndex$.next(Number(index));
        return;
      }
    }
    this._hiddenIndex$.next(this._toolbarItems?.length);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
