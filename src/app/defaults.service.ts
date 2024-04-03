import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DefaultsService {
  readonly boardSize: number = 60; // Board must be a positive, even number
  readonly interval: number = 60;
  readonly maxIterations: number = 999999;
  readonly cellSizeDividend: number = 750;
}
