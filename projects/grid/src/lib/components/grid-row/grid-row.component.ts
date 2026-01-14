import {Component, Input} from '@angular/core';
import {PrColumnGroup, PrGrid, PrRow, SelectedCellData} from '@parlament/grid';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {GridCellComponent} from '../grid-cell/grid-cell.component';
import {GridCellPipe} from '../../pipes/table-cell.pipe';
import {GridStore} from '../../store/grid.store';
import {IsCellSelectedPipe} from "../../pipes/is-cell-selected.pipe";
import {GridColumnGroupSpacerComponent} from "../grid-column-group-spacer/grid-column-group-spacer.component";

@Component({
  selector: 'pr-grid-row',
  templateUrl: './grid-row.component.html',
  styleUrls: ['./grid-row.component.less'],
  standalone: true,
  imports: [NgForOf, GridCellComponent, GridCellPipe, AsyncPipe,
    IsCellSelectedPipe, GridColumnGroupSpacerComponent, NgIf
  ]
})
export class GridRowComponent {
  @Input() row: PrRow;
  @Input() columnGroups: PrColumnGroup[];
  @Input() columnToCellMapper: PrGrid['columnToCellMapper'];
  @Input() gridTemplateColumns: string;
  @Input() selectedCells: SelectedCellData[];

  constructor(public gridStore: GridStore) {}

  onClickCell(columnDef: string) {
    this.gridStore.setSelectedCell({columnDef , rowId: this.row.id})
  }
}
