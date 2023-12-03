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
  selector: '[toolbarItem]',
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
            toolbarItem
            class="toolbar-item-visible"
            [style.marginLeft.px]="idx > 0 ? elementGap : 0"
          >
            <ng-container *ngTemplateOutlet="template"></ng-container>
          </div>
        </ng-container>
      </div>

      <div class="toolbar-anchor">
        <ng-container *ngIf="collapseTemplate">
          <ng-container *ngTemplateOutlet="collapseTemplate"> </ng-container>
          <div class="hidden-templates">
            <ng-container *ngFor="let template of hiddenTemplates">
              <div toolbarItem class="toolbar-item-hidden">
                <ng-template *ngTemplateOutlet="template"></ng-template>
              </div>
            </ng-container>
          </div>
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
  @HostBinding('style.width') get hostWidth() {
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

  private readonly _hiddenIndex$ = new Subject<number>();
  private readonly _destroy$ = new Subject<void>();
  private _elementWidthMap: Record<number, number> = {};

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this._composeElementWidthMap();
    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, 'resize')
        .pipe(takeUntil(this._destroy$), startWith(null), debounceTime(300))
        .subscribe(() => {
          this._detectHiddenElements();
        });
    });
  }

  ngAfterContentInit(): void {
    this._displayElements();
  }

  private _composeElementWidthMap() {
    console.log(this.elementGap);
    const elements = this._toolbarItems?.toArray() ?? [];
    this._elementWidthMap = elements.reduce((map, element, index) => {
      const previouseWidth = map[index - 1] ?? 0;
      const elementWidth = element.nativeElement.clientWidth;
      map[index] = elementWidth + previouseWidth + this.elementGap;
      return map;
    }, {} as Record<number, number>);
    console.log(this._elementWidthMap);
  }

  private _displayElements(): void {
    this._hiddenIndex$
      .pipe(
        takeUntil(this._destroy$),
        startWith(this._tooltipItemTemplates?.length ?? -1)
      )
      .subscribe((hiddenIndex) => {
        console.log(hiddenIndex);
        console.log(this._tooltipItemTemplates?.toArray());
        const templates = this._tooltipItemTemplates?.toArray() ?? [];
        this.hiddenTemplates = templates.slice(hiddenIndex);
        this.visibleTemplates = templates.slice(0, hiddenIndex);
        this.cdr.detectChanges();
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
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
