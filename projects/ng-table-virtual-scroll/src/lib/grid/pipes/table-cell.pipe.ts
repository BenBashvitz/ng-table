import { Pipe, PipeTransform } from '@angular/core';
import {PrCell, PrColumnWithMetadata, PrRow, PrGrid} from "../types/grid.interface";

@Pipe({
  name: 'gridCell',
  standalone: true,
})
export class GridCellPipe implements PipeTransform {
  transform(columnToCellMapper: PrGrid['columnToCellMapper'], column: PrColumnWithMetadata, row: PrRow): PrCell {
    return columnToCellMapper[column.columnDef](row);
  }
}
