import { Pipe, PipeTransform } from '@angular/core';
import {PrCell, PrTextCell} from "ng-table-virtual-scroll";

@Pipe({
  name: 'toNormalCell',
  standalone: true,
})
export class ToNormalCellPipe implements PipeTransform {
  transform(cell: PrCell): PrTextCell {
    return cell as PrTextCell;
  }
}
