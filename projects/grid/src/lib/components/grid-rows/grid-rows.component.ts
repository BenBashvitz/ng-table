import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  PrColumnWithMetadata,
  PrGrid,
  PrGroupByRow,
  PrDisplayableRow,
  PrRow
, SelectedCellData} from '@parlament/grid';
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {MatTableModule} from "@angular/material/table";
import {CdkDrag, CdkDragDrop, CdkDragPreview, CdkDropList} from "@angular/cdk/drag-drop";
import {GridRowComponent} from "../grid-row/grid-row.component";
import {GridHeaderRowComponent} from "../grid-header-row/grid-header-row.component";
import {GridStore} from "../../store/grid.store";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {Observable, Subject, tap} from "rxjs";
import {GridColumnGroupRowComponent} from "../grid-column-group-row/grid-column-group-row.component";
import { GridGroupByRowComponent } from '../grid-group-by-row/grid-group-by-row.component';

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
    GridGroupByRowComponent,
    GridHeaderRowComponent,
    AsyncPipe,
    CdkDragPreview,
    NgForOf,
    GridColumnGroupRowComponent,
    NgIf,
    NgForOf,
  ]
})
export class GridRowsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() table: PrGrid;
  @Input() allRows: PrDisplayableRow[];
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
  displayedRows$: Observable<PrDisplayableRow[]>

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
    this.displayedRows$ = this.gridStore.displayedRows$.pipe(tap(() => this.cd.detectChanges()));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['allRows']?.currentValue?.length > 0 && changes['allRows'].currentValue !== changes['allRows'].previousValue) {
      this.gridStore.setDisplayedRows(changes['allRows'].currentValue);
    }
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

  public onToggleGroupByRow(toggledRow: PrGroupByRow): void {
    toggledRow.isOpen = !toggledRow.isOpen;
    this.gridStore.setDisplayedRows(this.allRows);
  }
}
