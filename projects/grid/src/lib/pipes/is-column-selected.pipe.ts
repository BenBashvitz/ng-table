import { Pipe, PipeTransform } from '@angular/core';
import {PrColumnWithMetadata} from "@parlament/grid";

@Pipe({
  name: 'isColumnSelected',
  standalone: true
})
export class IsColumnSelectedPipe implements PipeTransform {
  transform(selectedColumns: PrColumnWithMetadata[], column:PrColumnWithMetadata): boolean {
    return !!selectedColumns.find(({columnDef}) => columnDef === column.columnDef);
  }
}
