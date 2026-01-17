import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toggleLabel',
  standalone: true,
  pure: true,
})
export class ToggleLabelPipe implements PipeTransform {
  transform(
    array: string[],
    value: string,
    addLabel: string,
    removeLabel: string
  ): string {
    return array.includes(value) ? removeLabel : addLabel;
  }
}
