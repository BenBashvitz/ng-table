import { Pipe, PipeTransform } from '@angular/core';
import {PrCell, PrColumnWithMetadata, PrRow, PrTable} from "ng-table-virtual-scroll";

@Pipe({
  name: 'tableCell',
  standalone: true,
})
export class TableCellPipe implements PipeTransform {
  transform(table: PrTable, column: PrColumnWithMetadata, row: PrRow): PrCell {
    return table.columnToCellMapper[column.columnDef](row);
  }
}
