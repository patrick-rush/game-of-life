import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'colorCell',
  standalone: true,
})
export class ColorCellPipe implements PipeTransform {
  transform(inputNumber: number, boardSize: number): string {
    const hue = (inputNumber / boardSize) * 20;
    return `hsl(${hue}, 50%, 50%)`;
  }
}
