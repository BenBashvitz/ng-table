import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  standalone: true,
  name: 'sum'
})
export class SumPipe implements PipeTransform {
  transform(items: any[], attr: string): number {
    if (!items || !attr) {
      return 0;
    }

    return items.reduce((accumulator, currentItem) => {
      const value = Number(currentItem[attr]);

      return accumulator + (isNaN(value) ? 0 : value);
    }, 0);
  }
}
