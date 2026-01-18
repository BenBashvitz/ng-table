import { Pipe, PipeTransform } from '@angular/core';
import {PrColumnGroup} from "../types/grid.interface";

@Pipe({
  name: 'hasRequiredColumn',
  standalone: true
})
export class HasRequiredColumnPipe implements PipeTransform {
  transform(columnGroup: PrColumnGroup): boolean {
    return columnGroup.columns.some(({isRequired}) => isRequired);
  }
}
