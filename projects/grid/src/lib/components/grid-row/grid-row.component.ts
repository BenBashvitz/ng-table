import { Component, Input } from '@angular/core';
import { PrColumnWithMetadata, PrGrid, PrRow } from '@parlament/grid';
import { AsyncPipe, NgForOf } from '@angular/common';
import { GridCellComponent } from '../grid-cell/grid-cell.component';
import { GridCellPipe } from '../../pipes/table-cell.pipe';
import { GridStore } from '../../store/grid.store';

@Component({
  selector: '<pr-grid-row',
  templateUrl: './grid-row.component.html',
  styleUrls: ['./grid-row.component.less'],
  standalone: true,
  imports: [NgForOf, GridCellComponent, GridCellPipe, AsyncPipe]
})
export class GridRowComponent {
  @Input() row: PrRow;
  @Input() columns: PrColumnWithMetadata[];
  @Input() columnToCellMapper: PrGrid['columnToCellMapper'];
  @Input() gridTemplateColumns: string;

  constructor(public tableStore: GridStore) {}
}
