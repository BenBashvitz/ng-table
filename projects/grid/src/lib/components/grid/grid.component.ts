import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {PrGrid, PrDisplayableRow, PrRow} from '../../types/grid.interface';
import {AsyncPipe} from "@angular/common";
import {GridStore} from "../../store/grid.store";
import { Observable, Subject, tap } from 'rxjs';
import {GridRowsComponent} from "../grid-rows/grid-rows.component";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'pr-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    GridRowsComponent,
  ],
  providers: [GridStore]
})
export class GridComponent implements OnInit, OnDestroy, OnChanges {
  @Input() grid: PrGrid;
  @Output() gridChange = new EventEmitter<PrGrid>();
  @Output() clickRow = new EventEmitter<PrRow>();
  @Output() dblclickRow = new EventEmitter<PrRow>();

  destroy$ = new Subject<void>();
  currentRows$: Observable<PrDisplayableRow[]>

  constructor(public gridStore: GridStore, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.gridStore.setGrid(this.grid);
    this.gridStore.grid$.pipe(takeUntil(this.destroy$)).subscribe(grid => {
      this.gridChange.emit(grid);
    });
    this.currentRows$ = this.gridStore.currentRows$.pipe(tap(() => this.cd.detectChanges()));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['grid']?.currentValue?.groupByColumnIds && changes['grid'].currentValue.groupByColumnIds !== changes['grid'].previousValue.groupByColumnIds) {
      this.gridStore.setGroupByColumnIds(this.grid.groupByColumnIds);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
  }
}
