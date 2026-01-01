import {AfterViewInit, Directive, ElementRef, Input, NgZone, OnDestroy, OnInit, Renderer2,} from '@angular/core';
import {fromEvent, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {TableSizeService} from "../services/table-size.service";
import {columnDefaults, PrColumn, PrColumnGroup, PrColumnWithMetadata} from "ng-table-virtual-scroll";

@Directive({
  selector: '[tvsColumnResize]',
  standalone: true,
})
export class ColumnResizeDirective implements AfterViewInit, OnDestroy, OnInit {
  @Input() resizableTable: HTMLElement | null = null;
  @Input() prColumn: PrColumnWithMetadata;
  @Input() columnGroups: PrColumnGroup[];

  prGroup: PrColumn;

  private startX!: number;
  private startWidth!: number;
  private isResizing = false;
  private column: HTMLElement;
  private resizer!: HTMLElement;
  private destroy$ = new Subject<void>();

  private _previousDiff = 0;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private zone: NgZone,
    private tableSizeService: TableSizeService,
  ) {
    this.column = this.el.nativeElement;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.tableSizeService.updateSize((previousSize) => previousSize + this.column.offsetWidth);
    this.resizer = (this.column.getElementsByClassName('resizer')).item(0) as HTMLElement;
    this.initializeResizeListener();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.tableSizeService.reset();
  }

  private initializeResizeListener() {
    this.zone.runOutsideAngular(() => {
      fromEvent(this.resizer, 'mousedown')
        .pipe(takeUntil(this.destroy$))
        .subscribe((event: MouseEvent) => this.onMouseDown(event));

      fromEvent(document, 'mousemove')
        .pipe(takeUntil(this.destroy$))
        .subscribe((event: MouseEvent) => this.onMouseMove(event));

      fromEvent(document, 'mouseup')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.onMouseUp());

      fromEvent(this.resizer, 'dblclick')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.onDoubleClick());
    });
  }

  private onMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.isResizing = true;
    this.startX = event.pageX;
    this.startWidth = this.column.offsetWidth;
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.isResizing) return;

    const mousePositionDiff = (event.pageX - this.startX);
    const newColumnWidth = this.startWidth + mousePositionDiff;
    const adjustedMousePositionDiff =  mousePositionDiff - this._previousDiff

    if (newColumnWidth >= parseFloat(this.column.style.maxWidth) || newColumnWidth <= parseFloat(this.column.style.minWidth)) return;

    this.renderer.setStyle(this.column, 'width', `${newColumnWidth}px`);

    if(this._previousDiff != mousePositionDiff) {

      this.tableSizeService.updateSize((previousSize) => previousSize + adjustedMousePositionDiff);
      this._previousDiff = mousePositionDiff;
    }
  }

  private onMouseUp() {
    if (!this.isResizing) return;
    this.isResizing = false;
    this._previousDiff = 0
  }


  private onDoubleClick() {
    let maxWidth = this.column.offsetWidth;
    const columnCells = document.getElementsByClassName(this.prColumn.columnDef);

    for (let i = 0; i < columnCells.length; i++) {
      const cell = columnCells.item(i) as HTMLElement;

      if(cell.scrollWidth > maxWidth) {
        maxWidth = cell.scrollWidth;
      }
    }

    const clampedMaxWidth = Math.min(maxWidth, this.prColumn.maxWidthInPx ?? columnDefaults.maxWidthInPx);
    const adjustedMaxWidth = clampedMaxWidth - this.column.offsetWidth;
    this.renderer.setStyle(this.column, 'width', `${clampedMaxWidth}px`);
    this.tableSizeService.updateSize((previousSize) => previousSize + adjustedMaxWidth);
  }
}
