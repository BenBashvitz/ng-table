import { Component, Input } from '@angular/core';
import { PrColumnWithMetadata, PrGrid, PrRow , SelectedCellData} from '@parlament/grid';
import { AsyncPipe, NgForOf } from '@angular/common';
import { GridCellComponent } from '../grid-cell/grid-cell.component';
import { GridCellPipe } from '../../pipes/table-cell.pipe';
import { GridStore } from '../../store/grid.store';
import {IsCellSelectedPipe} from "../../pipes/is-cell-selected.pipe";

@Component({
  selector: 'pr-grid-row',
  templateUrl: './grid-row.component.html',
  styleUrls: ['./grid-row.component.less'],
  standalone: true,
  imports: [NgForOf, GridCellComponent, GridCellPipe, AsyncPipe,
    IsCellSelectedPipe
  ]
})
export class GridRowComponent {
  @Input() row: PrRow;
  @Input() columns: PrColumnWithMetadata[];
  @Input() columnToCellMapper: PrGrid['columnToCellMapper'];
  @Input() gridTemplateColumns: string;
  @Input() selectedCells: SelectedCellData[];

  constructor(public gridStore: GridStore) {}

  onClickCell(columnDef: string) {
    this.gridStore.setSelectedCell({columnDef , rowId: this.row.id})
  }
}
