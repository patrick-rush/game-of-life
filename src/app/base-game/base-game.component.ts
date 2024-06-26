import { Component, Inject } from '@angular/core';
import { DefaultsService, Game } from '../defaults.service';

@Component({
  selector: 'app-base-game',
  standalone: true,
  imports: [],
  templateUrl: './base-game.component.html',
  styleUrl: './base-game.component.css',
})
export abstract class BaseGameComponent {
  protected intervalId: number | null = null;
  abstract activeGame: Game;
  abstract board: [unknown][][];
  abstract boardMap: Map<number, Map<number, [unknown]>>;

  interval: number;
  boardSize: number;
  colorMode: boolean = false;
  cellSize: string;
  cellSizeDividend: number;
  iteration: number = 0;
  maxIterations: number;
  running: boolean = false;

  constructor(@Inject(DefaultsService) protected defaults: DefaultsService) {
    this.boardSize = defaults.boardSize;
    this.interval = defaults.interval;
    this.maxIterations = defaults.maxIterations;
    this.cellSizeDividend = defaults.cellSizeDividend;
    this.cellSize = this.cellSizeDividend / this.boardSize + 'px';
  }

  ngOnDestroy() {
    this.stopGame();
  }

  abstract generateBoard(): void;

  abstract resetGame(): void;

  abstract runGame(): void;

  abstract tallyNeighbors<T, R>(
    boardMap: Map<number, Map<number, [T]>>,
    col: number,
    row: number
  ): R;

  abstract getCellStyle(col: number, row: number): string;

  startGame(): void {
    this.intervalId = window.setInterval(this.runGame, this.interval);
    this.running = true;
    console.log('Game started');

    // benchmarking
    // console.time('game timer');
  }

  pauseGame(): void {
    if (!this.intervalId) return;
    window.clearInterval(this.intervalId);
    console.log('Game paused');
  }

  stopGame(): void {
    this.pauseGame();
    this.running = false;
    console.log('Game stopped');

    // benchmarking
    // console.timeEnd('game timer');
  }

  getCell<T>(
    board: Map<number, Map<number, [T]>>,
    col: number,
    row: number
  ): [T] {
    return board.get(col)?.get(row)!;
  }

  getCellValue<T>(
    board: Map<number, Map<number, [T]>>,
    col: number,
    row: number
  ): T {
    return this.getCell(board, col, row)[0]!;
  }

  handleChangeBoardSize(size: number) {
    this.boardSize = size;
    this.cellSize = this.cellSizeDividend / this.boardSize + 'px';
    this.resetGame();
  }

  handleChangeInterval(interval: number) {
    this.interval = interval;
    this.pauseGame();
    this.startGame();
  }

  cloneBoard<T>(
    widthMod: number = 1
  ): [[T][][], Map<number, Map<number, [T]>>] {
    const clonedBoard: [T][][] = [];
    const clonedBoardMap: Map<number, Map<number, [T]>> = new Map();
    for (let i = 0; i < this.boardSize * widthMod; i++) {
      const col: [T][] = [];
      const colMap = new Map<number, [T]>();
      for (let j = 0; j < this.boardSize; j++) {
        const cell: [T] = [this.board[i][j][0]] as [T];
        colMap.set(j, cell);
        col.push(cell);
      }
      clonedBoardMap.set(i, colMap);
      clonedBoard.push(col);
    }
    return [clonedBoard, clonedBoardMap];
  }
}
