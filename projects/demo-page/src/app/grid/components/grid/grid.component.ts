import {Component, Input, OnInit} from '@angular/core';
import {PrGrid} from "../../types/grid.interface";
import {AsyncPipe} from "@angular/common";
import {GridStore} from "../../store/grid.store";
import {Observable} from "rxjs";
import {GridRowsComponent} from "../grid-rows/grid-rows.component";

@Component({
  selector: 'tvs-grid',
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
  @Input() grid: PrGrid
  gridTemplate: Observable<string>;

  constructor(public gridStore: GridStore) {}

  ngOnInit() {
    this.gridStore.setGrid(this.grid);
    this.gridTemplate = this.gridStore.gridTemplate$
  }
}
