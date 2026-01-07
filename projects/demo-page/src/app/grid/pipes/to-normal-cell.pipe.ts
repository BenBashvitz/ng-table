import { Pipe, PipeTransform } from '@angular/core';
import {PrCell, PrTextCell} from "../types/table.interface";

@Pipe({
  name: 'toNormalCell',
  standalone: true,
})
export class ToNormalCellPipe implements PipeTransform {
  transform(cell: PrCell): PrTextCell {
    return cell as PrTextCell;
  }
}
