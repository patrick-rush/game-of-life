import { Pipe, PipeTransform } from '@angular/core';

type Binary = 0 | 1;

@Pipe({
  name: 'fillCell',
  standalone: true,
})
export class FillCellPipe implements PipeTransform {
  transform(value: Binary): unknown {
    return value ? 'dark' : 'light';
  }
}
