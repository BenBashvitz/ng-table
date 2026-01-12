import { Pipe, PipeTransform } from '@angular/core';
import { PrCell, PrColumnWithMetadata, PrGrid, PrRow } from "@parlament/grid";

@Pipe({
  name: 'gridCell',
  standalone: true,
})
export class GridCellPipe implements PipeTransform {
  transform(columnToCellMapper: PrGrid['columnToCellMapper'], column: PrColumnWithMetadata, row: PrRow): PrCell {
    return columnToCellMapper[column.columnDef](row);
  }
}
