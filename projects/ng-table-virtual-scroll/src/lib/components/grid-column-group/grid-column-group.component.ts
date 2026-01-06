import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input, OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import {defaults, PrColumnGroup, PrRow, PrTable} from "../../types/table.interface";
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {MatTableModule} from "@angular/material/table";
import {ColumnResizeDirective} from "../../directives/column-resize.directive";
import {CdkDrag, CdkDragDrop, CdkDragPreview, CdkDropList} from "@angular/cdk/drag-drop";
import {GridRowComponent} from "../grid-row/grid-row.component";
import {GridHeaderRowComponent} from "../grid-header-row/grid-header-row.component";
import {TableStore} from "../../store/table.store";
import {AsyncPipe, NgForOf} from "@angular/common";
import {combineLatest, Subject, tap} from "rxjs";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'tvs-grid-column-group',
  templateUrl: './grid-column-group.component.html',
  styleUrls: ['./grid-column-group.component.less'],
  standalone: true,
  imports: [
    CdkVirtualScrollViewport,
    MatTableModule,
    ColumnResizeDirective,
    CdkDropList,
    CdkDrag,
    CdkVirtualForOf,
    CdkFixedSizeVirtualScroll,
    GridRowComponent,
    GridHeaderRowComponent,
    AsyncPipe,
    CdkDragPreview,
    NgForOf,
  ]
})
export class GridColumnGroupComponent implements AfterViewInit, OnDestroy{
  @Input() columnGroup: PrColumnGroup
  @ViewChild('body') body: ElementRef<Element>
  @ViewChild(CdkVirtualScrollViewport)
  virtualViewport: CdkVirtualScrollViewport;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const element = event.target as Element;

    if (!this.body.nativeElement.contains(element)) {
    }
  }

  destroyed$ = new Subject<void>();

  constructor(public tableStore: TableStore) {}

  ngAfterViewInit() {
    combineLatest([
      this.virtualViewport.elementScrolled().pipe(
        tap((event) => {
          this.tableStore.setScrollTop((event.target as HTMLElement).scrollTop);
          this.tableStore.setScrollRange(this.virtualViewport.getRenderedRange())
        })
      ),
      this.tableStore.scrollTop$.pipe(
        tap((scrollTop) => {
          this.virtualViewport.scrollToOffset(scrollTop)
        })
      )
    ]).pipe(
      takeUntil(this.destroyed$)
    ).subscribe()
  }

  ngOnDestroy() {
    this.destroyed$.next()
  }

  get gridTemplate() {
    return this.columnGroup.columns.map(col => {
      return `${col.widthInPx ?? defaults.widthInPx}px`
    }).join(' ');
  }

  trackByRow(_: number, row: PrRow) {
    return row.id
  }

  onDropRow(event: CdkDragDrop<unknown, unknown, PrRow>) {
    this.tableStore.moveRow({
      item: event.item.data,
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex
    });
  }
}
