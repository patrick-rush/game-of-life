import { Injectable } from '@angular/core';

export enum Game {
  LIFE = 'life',
  RPS = 'rps',
}

@Injectable({
  providedIn: 'root',
})
export class DefaultsService {
  readonly boardSize: number = 100; // Board must be a positive, even number
  readonly interval: number = 0.01;
  readonly maxIterations: number = 999999;
  readonly cellSizeDividend: number = 750;
  readonly minBoardSize: number = 10;
  readonly maxBoardSize: number = 200;
  readonly minInterval: number = 0.01;
  readonly maxInterval: number = 200;
}
