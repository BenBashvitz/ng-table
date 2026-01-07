import {Component, Input, OnInit} from '@angular/core';
import {PrColumnGroup, PrTable} from "../../types/table.interface";
import {MatTableModule} from "@angular/material/table";
import {AsyncPipe} from "@angular/common";
import {TableStore} from "../../store/table.store";
import {Observable} from "rxjs";
import {GridRowsComponent} from "../grid-rows/grid-rows.component";

@Component({
  selector: 'tvs-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.less'],
  standalone: true,
  imports: [
    MatTableModule,
    AsyncPipe,
    GridRowsComponent,
  ],
  providers: [TableStore]
})
export class GridComponent implements OnInit {
  @Input() table: PrTable
  splitColumnGroups: Observable<PrColumnGroup[]>;

  constructor(public tableStore: TableStore) {}

  ngOnInit() {
    this.tableStore.setTable(this.table);
    this.splitColumnGroups = this.tableStore.columnGroups$;
  }
}
