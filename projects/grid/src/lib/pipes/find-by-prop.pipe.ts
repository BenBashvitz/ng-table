import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'findByProp',
  standalone: true,
  pure: true
})
export class FindByPropPipe implements PipeTransform {

  transform<T extends Record<string, any>>(
    array: T[] | null | undefined,
    prop: keyof T,
    value: any
  ): T | undefined {
    if (!array) return undefined;
    return array.find(item => item[prop] === value);
  }
}
