import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {PrGrid, PrRow} from "../../types/grid.interface";
import {AsyncPipe} from "@angular/common";
import {GridStore} from "../../store/grid.store";
import {Observable, Subject} from "rxjs";
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

  constructor(public gridStore: GridStore) {}

  ngOnInit() {
    this.gridStore.setGrid(this.grid);
    this.gridStore.grid$.pipe(takeUntil(this.destroy$)).subscribe(grid => {
      this.gridChange.emit(grid);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['grid'] && changes['grid'].currentValue !== changes['grid'].previousValue) {
      this.gridStore.setGrid(this.grid)
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
  }
}
