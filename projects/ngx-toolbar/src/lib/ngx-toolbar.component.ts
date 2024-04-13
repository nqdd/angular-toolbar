import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
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
import { ELEMENT_GAP_DEFAULT } from './ngx-toolbar-config';
import {
  NgxToolbarExtraButtonDirective,
  NgxToolbarItemDirective,
  NgxToolbarItemTemplateDirective,
} from './ngx-toolbar.directive';

@Component({
  selector: 'ngx-toolbar',
  template: `
    <div class="toolbar" #toolbar>
      <div class="toolbar-panel" #panel>
        <ng-container
          *ngFor="let template of visibleTemplates; let idx = index"
        >
          <div
            ngxToolbarItem
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
                <div ngxToolbarItem class="toolbar-item-hidden">
                  <ng-template *ngTemplateOutlet="template"></ng-template>
                </div>
              </ng-container>
            </div>
          </ng-container>
        </ng-container>
      </div>
    </div>
  `,
  styleUrls: ['./ngx-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxToolbarComponent
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

  @ContentChild(NgxToolbarExtraButtonDirective, {
    read: TemplateRef,
  })
  public readonly collapseTemplate?: TemplateRef<NgxToolbarExtraButtonDirective>;

  @ViewChildren(NgxToolbarItemDirective, { read: ElementRef })
  private readonly _toolbarItems?: QueryList<ElementRef<HTMLDivElement>>;

  @ContentChildren(NgxToolbarItemTemplateDirective, { read: TemplateRef })
  private readonly _tooltipItemTemplates?: QueryList<
    TemplateRef<NgxToolbarItemTemplateDirective>
  >;

  public visibleTemplates: TemplateRef<NgxToolbarItemDirective>[] = [];
  public hiddenTemplates: TemplateRef<NgxToolbarItemDirective>[] = [];

  private readonly _hiddenIndex$ = new Subject<number | undefined>();
  private readonly _destroy$ = new Subject<void>();
  private _elementWidthMap: Record<number, number> = {};

  constructor(
    private _zone: NgZone,
    private _changeDetector: ChangeDetectorRef
  ) {}

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
