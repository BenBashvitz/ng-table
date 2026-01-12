import { Pipe, PipeTransform } from '@angular/core';
import {PrCellType, PrFreeTextCell} from "../types/grid.interface";

@Pipe({
  name: 'toFreeTextCell',
  standalone: true,
})
export class ToFreeTextCellPipe implements PipeTransform {
  transform(cell: PrCellType): PrFreeTextCell {
    return cell as PrFreeTextCell;
  }
}
