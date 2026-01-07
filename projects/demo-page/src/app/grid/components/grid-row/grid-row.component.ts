import {Component, Input, SimpleChanges} from '@angular/core';
import {PrColumnWithMetadata, PrRow, PrTable} from "../../types/table.interface";
import {AsyncPipe, NgForOf} from "@angular/common";
import {GridCellComponent} from "../grid-cell/grid-cell.component";
import {TableCellPipe} from "../../pipes/table-cell.pipe";
import {TableStore} from "../../store/table.store";

@Component({
  selector: 'tvs-grid-row',
  templateUrl: './grid-row.component.html',
  styleUrls: ['./grid-row.component.less'],
  standalone: true,
  imports: [
    NgForOf,
    GridCellComponent,
    TableCellPipe,
    AsyncPipe
  ]
})
export class GridRowComponent {
  @Input() row: PrRow
  @Input() columns: PrColumnWithMetadata[];
  @Input() columnToCellMapper: PrTable['columnToCellMapper'];
  @Input() gridTemplateColumns: string

  constructor(public tableStore: TableStore) {}

  onClickRow() {
    this.tableStore.selectRow(this.row.id)
  }

  onDoubleClickRow() {

  }
}
