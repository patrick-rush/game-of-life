import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'colorCell',
  standalone: true,
})
export class ColorCellPipe implements PipeTransform {
  transform(inputNumber: number): string {
    const clampedInput = Math.max(0, Math.min(500, inputNumber));
    const hue = (clampedInput / 500) * 270;
    return `hsl(${hue}, 50%, 50%)`;
  }
}
