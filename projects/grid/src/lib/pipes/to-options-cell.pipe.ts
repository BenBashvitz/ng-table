import { Pipe, PipeTransform } from '@angular/core';
import {PrCellType, PrFreeTextCell, PrOptionsCell} from "../types/grid.interface";

@Pipe({
  name: 'toOptionsCell',
  standalone: true,
})
export class ToOptionsCellPipe implements PipeTransform {
  transform(cell: PrCellType): PrOptionsCell {
    return cell as PrOptionsCell;
  }
}
