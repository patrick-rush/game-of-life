import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export enum Game {
  LIFE = 'life',
  RPS = 'rps',
}

@Injectable({
  providedIn: 'root',
})
export class DefaultsService {
  activeGame: Game = Game.LIFE;
  private defaultGame: BehaviorSubject<Game>;
  defaultGame$: Observable<Game>;

  constructor() {
    this.defaultGame = new BehaviorSubject(this.activeGame);
    this.defaultGame$ = this.defaultGame.asObservable();
  }

  readonly boardSize: number = 60; // Board must be a positive, even number
  readonly interval: number = 60;
  readonly maxIterations: number = 999999;
  readonly cellSizeDividend: number = 750;

  toggleActiveGame = (game: Game): void => {
    const nextGame = game === Game.LIFE ? Game.RPS : Game.LIFE;
    this.activeGame = nextGame;
    this.defaultGame.next(this.activeGame);
  };
}
