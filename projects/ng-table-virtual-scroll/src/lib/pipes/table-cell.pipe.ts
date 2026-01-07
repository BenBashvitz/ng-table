import { Pipe, PipeTransform } from '@angular/core';
import {PrCell, PrColumnWithMetadata, PrRow, PrTable} from "ng-table-virtual-scroll";

@Pipe({
  name: 'tableCell',
  standalone: true,
})
export class TableCellPipe implements PipeTransform {
  transform(columnToCellMapper: PrTable['columnToCellMapper'], column: PrColumnWithMetadata, row: PrRow): PrCell {
    return columnToCellMapper[column.columnDef](row);
  }
}
