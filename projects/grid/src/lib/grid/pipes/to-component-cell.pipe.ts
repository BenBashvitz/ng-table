import { Pipe, PipeTransform } from '@angular/core';
import { PrCell, PrCustomCell } from "@parlament/grid";

@Pipe({
  name: 'toComponentCell',
  standalone: true,
})
export class ToComponentCellPipe implements PipeTransform {
  transform(cell: PrCell): PrCustomCell {
    return cell as PrCustomCell;
  }
}
