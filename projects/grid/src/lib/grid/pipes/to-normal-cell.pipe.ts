import { Pipe, PipeTransform } from '@angular/core';
import { PrCell, PrTextCell } from "@parlament/grid";

@Pipe({
  name: 'toNormalCell',
  standalone: true,
})
export class ToNormalCellPipe implements PipeTransform {
  transform(cell: PrCell): PrTextCell {
    return cell as PrTextCell;
  }
}
