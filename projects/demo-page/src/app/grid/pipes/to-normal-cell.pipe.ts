import { Pipe, PipeTransform } from '@angular/core';
import {PrCell, PrTextCell} from "../types/grid.interface";

@Pipe({
  name: 'toNormalCell',
  standalone: true,
})
export class ToNormalCellPipe implements PipeTransform {
  transform(cell: PrCell): PrTextCell {
    return cell as PrTextCell;
  }
}
