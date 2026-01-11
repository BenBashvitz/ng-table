import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PrGrid, PrRow} from "../../types/grid.interface";
import {AsyncPipe} from "@angular/common";
import {GridStore} from "../../store/grid.store";
import {Observable} from "rxjs";
import {GridRowsComponent} from "../grid-rows/grid-rows.component";

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
export class GridComponent implements OnInit {
  @Input() grid: PrGrid;
  @Output() gridChange = new EventEmitter<PrGrid>();
  @Output() clickRow = new EventEmitter<PrRow>();
  @Output() dblclickRow = new EventEmitter<PrRow>();

  constructor(public gridStore: GridStore) {}

  ngOnInit() {
    this.gridStore.setGrid(this.grid);
  }
}
