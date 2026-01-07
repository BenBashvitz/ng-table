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
import {defaults, PrColumnGroup, PrColumnWithMetadata, PrRow, PrTable} from "../../types/table.interface";
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
import {GridColumnGroupRowComponent} from "../grid-column-group-row/grid-column-group-row.component";

@Component({
  selector: 'tvs-grid-rows',
  templateUrl: './grid-rows.component.html',
  styleUrls: ['./grid-rows.component.less'],
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
    GridColumnGroupRowComponent,
  ]
})
export class GridRowsComponent implements AfterViewInit, OnDestroy{
  @Input() table: PrTable;
  @Input() gridTemplateColumns: string;
  @Input() columns: PrColumnWithMetadata[];
  @Input() tableWidthInPx: number;
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
