import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {PrColumnWithMetadata, PrGrid, PrRow, SelectedCellData} from "@parlament/grid";
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {MatTableModule} from "@angular/material/table";
import {CdkDrag, CdkDragDrop, CdkDragPreview, CdkDropList} from "@angular/cdk/drag-drop";
import {GridRowComponent} from "../grid-row/grid-row.component";
import {GridHeaderRowComponent} from "../grid-header-row/grid-header-row.component";
import {GridStore} from "../../store/grid.store";
import {AsyncPipe, NgForOf} from "@angular/common";
import {Observable, Subject, tap} from "rxjs";
import {GridColumnGroupRowComponent} from "../grid-column-group-row/grid-column-group-row.component";

@Component({
  selector: 'pr-grid-rows',
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
export class GridRowsComponent implements OnInit, OnDestroy {
  @Input() table: PrGrid;
  @Input() columns: PrColumnWithMetadata[];
  @Input() selectedCells: SelectedCellData[];
  @Output() clickRow = new EventEmitter<PrRow>();
  @Output() dblclickRow = new EventEmitter<PrRow>();
  @ViewChild('body') body: ElementRef<Element>
  @ViewChild(CdkVirtualScrollViewport)
  virtualViewport: CdkVirtualScrollViewport;

  gridWidthInPx$: Observable<number>;
  gridMaxWidthInPx$ = this.gridStore.maxWidth$;
  gridTemplate$: Observable<string>;


  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const element = event.target as Element;

    if (!this.body.nativeElement.contains(element)) {
    }
  }

  destroyed$ = new Subject<void>();

  constructor(public gridStore: GridStore, private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.gridWidthInPx$ = this.gridStore.gridWidth$.pipe(tap(() => this.cd.detectChanges()));
    this.gridTemplate$ = this.gridStore.gridTemplate$.pipe(tap(() => this.cd.detectChanges()));
    this.gridMaxWidthInPx$ = this.gridStore.maxWidth$.pipe(tap(() => this.cd.detectChanges()));
  }

  ngOnDestroy() {
    this.destroyed$.next()
  }

  trackByRow(_: number, row: PrRow) {
    return row.id
  }

  onDropRow(event: CdkDragDrop<unknown, unknown, PrRow>) {
    this.gridStore.moveRow({
      item: event.item.data,
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex
    });
  }

  onClickRow(row: PrRow, index: number) {
    this.clickRow.emit(row)
  }

  onDoubleClickRow(row: PrRow) {
    this.dblclickRow.emit(row)
  }

  public get inverseOfTranslation(): string {
    if (!this.virtualViewport) {
      return '-0px';
    }
    const offset = this.virtualViewport.getOffsetToRenderedContentStart();

    return `translateY(-${offset}px)`;
  }
}
