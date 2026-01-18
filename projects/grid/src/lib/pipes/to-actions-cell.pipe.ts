import {Pipe, PipeTransform} from '@angular/core';
import {PrActionsCell, PrCellType} from "../types/grid.interface";

@Pipe({
  name: 'toActionsCell',
  standalone: true,
})
export class ToActionsCellPipe implements PipeTransform {
  transform(cell: PrCellType): PrActionsCell {
    return cell as PrActionsCell;
  }
}
