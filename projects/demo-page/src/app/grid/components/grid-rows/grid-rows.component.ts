import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {PrColumnWithMetadata, PrRow, PrGrid} from "../../types/grid.interface";
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {MatTableModule} from "@angular/material/table";
import {CdkDrag, CdkDragDrop, CdkDragPreview, CdkDropList} from "@angular/cdk/drag-drop";
import {GridRowComponent} from "../grid-row/grid-row.component";
import {GridHeaderRowComponent} from "../grid-header-row/grid-header-row.component";
import {GridStore} from "../../store/grid.store";
import {AsyncPipe, NgForOf} from "@angular/common";
import {combineLatest, Observable, Subject, tap} from "rxjs";
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
export class GridRowsComponent implements OnInit, OnDestroy{
  @Input() table: PrGrid;
  @Input() columns: PrColumnWithMetadata[];
  @ViewChild('body') body: ElementRef<Element>
  @ViewChild(CdkVirtualScrollViewport)
  virtualViewport: CdkVirtualScrollViewport;

  tableWidthInPx$: Observable<number>;
  gridTemplate$: Observable<string>;


  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const element = event.target as Element;

    if (!this.body.nativeElement.contains(element)) {
    }
  }

  destroyed$ = new Subject<void>();

  constructor(public tableStore: GridStore , private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.tableWidthInPx$ = this.tableStore.gridWidth$.pipe(tap(() => this.cd.detectChanges()));
    this.gridTemplate$ = this.tableStore.gridTemplate$.pipe(tap(() => this.cd.detectChanges()));
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
