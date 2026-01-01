import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef, EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit, Output,
  Renderer2,
} from '@angular/core';
import {fromEvent, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {columnDefaults, isColumnGroup, PrColumnGroup, PrColumnWithMetadata} from "ng-table-virtual-scroll";

@Directive({
  selector: '[tvsColumnResize]',
  standalone: true,
})
export class ColumnResizeDirective implements AfterViewInit, OnDestroy {
  @Input() resizableTable: HTMLElement | null = null;
  @Input() prColumn: PrColumnWithMetadata;
  @Output() resize = new EventEmitter<MouseEvent>()

  private startX!: number;
  private startWidth!: number;
  private startWidths!: number[];
  private isResizing = false;
  private column: HTMLElement;
  private resizer!: HTMLElement;
  private destroy$ = new Subject<void>();


  constructor(
    private el: ElementRef,
    private zone: NgZone,
    private cd: ChangeDetectorRef,
  ) {
    this.column = this.el.nativeElement;
  }

  ngAfterViewInit() {
    this.resizer = (this.column.getElementsByClassName('resizer')).item(0) as HTMLElement;
    this.initializeResizeListener();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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


    if (isColumnGroup(this.prColumn)) {
      this.startWidths = this.prColumn.columns.map(({widthInPx}) => widthInPx ?? columnDefaults.widthInPx)
      console.log(this.startWidths);
    } else {
      this.startWidth = this.prColumn.widthInPx ?? columnDefaults.widthInPx;
    }
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.isResizing) return;

    const mousePositionDiff = (event.pageX - this.startX);

    if (!isColumnGroup(this.prColumn)) {
      const newColumnWidth = this.startWidth + mousePositionDiff;

      if (newColumnWidth >= parseFloat(this.column.style.maxWidth) || newColumnWidth <= parseFloat(this.column.style.minWidth)) return;

      this.prColumn.widthInPx = newColumnWidth;
    } else {
      const newColumnWidths = this.startWidths.map(startWidth => startWidth + (mousePositionDiff / 3));

      for (let i = 0; i < this.prColumn.columns.length; i++) {
        if (
          (newColumnWidths[i] <= (this.prColumn.columns[i].maxWidthInPx ?? columnDefaults.maxWidthInPx)) &&
          (newColumnWidths[i] >= (this.prColumn.columns[i].minWidthInPx ?? columnDefaults.minWidthInPx))) {
          this.prColumn.columns[i].widthInPx = newColumnWidths[i];
        }
      }
    }

    this.cd.detectChanges();
    this.resize.emit(event);
  }

  private onMouseUp() {
    if (!this.isResizing) return;
    this.isResizing = false;
  }


  private onDoubleClick() {
    if(isColumnGroup(this.prColumn)) return;

    let maxWidth = this.column.offsetWidth;
    const columnCells = document.getElementsByClassName(this.prColumn.columnDef);

    for (let i = 0; i < columnCells.length; i++) {
      const cell = columnCells.item(i) as HTMLElement;

      if (cell.scrollWidth > maxWidth) {
        maxWidth = cell.scrollWidth;
      }
    }

    this.prColumn.widthInPx = Math.min(maxWidth, this.prColumn.maxWidthInPx ?? columnDefaults.maxWidthInPx);
    this.cd.detectChanges()
  }
}
