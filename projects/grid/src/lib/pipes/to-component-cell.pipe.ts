import { Pipe, PipeTransform } from '@angular/core';
import { PrCellType, PrComponentCell } from "@parlament/grid";

@Pipe({
  name: 'toComponentCell',
  standalone: true,
})
export class ToComponentCellPipe implements PipeTransform {
  transform(cell: PrCellType): PrComponentCell {
    return cell as PrComponentCell;
  }
}
