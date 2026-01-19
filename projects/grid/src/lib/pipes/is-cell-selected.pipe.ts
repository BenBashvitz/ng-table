import { Pipe, PipeTransform } from '@angular/core';
import {SelectedCellData} from "../types/grid.interface";

@Pipe({
  name: 'isCellSelected',
  standalone: true
})
export class IsCellSelectedPipe implements PipeTransform {
  transform(selectedCells: SelectedCellData[], cellColumnDef: string, cellRowId: string | number): boolean {
    return !!selectedCells.find(({columnDef, rowId}) => cellRowId === rowId && cellColumnDef === columnDef);
  }
}
