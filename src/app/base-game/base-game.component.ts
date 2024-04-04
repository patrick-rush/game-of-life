import { Component, Inject } from '@angular/core';
import { DefaultsService } from '../defaults.service';

@Component({
  selector: 'app-base-game',
  standalone: true,
  imports: [],
  templateUrl: './base-game.component.html',
  styleUrl: './base-game.component.css',
})
export abstract class BaseGameComponent {
  protected intervalId: number | null = null;
  interval: number;
  boardSize: number;

  abstract board: [unknown][][];
  abstract boardMap: Map<number, Map<number, [unknown]>>;

  colorMode: boolean = false;
  cellSize: string;
  cellSizeDividend: number;

  iteration: number = 0;
  maxIterations: number;

  running: boolean = false;

  // @ts-ignore
  constructor(@Inject(DefaultsService) protected defaults: DefaultsService) {
    this.boardSize = defaults.boardSize;
    this.interval = defaults.interval;
    this.maxIterations = defaults.maxIterations;
    this.cellSizeDividend = defaults.cellSizeDividend;
    this.cellSize = this.cellSizeDividend / this.boardSize + 'px';
  }

  abstract generateBoard(): void;

  startGame(): void {
    this.intervalId = window.setInterval(this.runGame, this.interval);
    this.running = true;
  }

  pauseGame(): void {
    if (!this.intervalId) return;
    window.clearInterval(this.intervalId);
  }

  stopGame(): void {
    this.pauseGame();
    this.running = false;

    // benchmarking
    // console.log('living cells at end:', this.livingCells);
    // console.timeEnd('game timer');
  }

  abstract resetGame(): void;

  abstract runGame(): void;

  abstract tallyNeighbors<T, R>(
    boardMap: Map<number, Map<number, [T]>>,
    row: number,
    col: number
  ): R;

  getCell<T>(
    board: Map<number, Map<number, [T]>>,
    row: number,
    col: number
  ): [T] {
    return board.get(row)?.get(col)!;
  }

  getCellValue<T>(
    board: Map<number, Map<number, [T]>>,
    row: number,
    col: number
  ): T {
    return this.getCell(board, row, col)[0]!;
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
      const row: [T][] = [];
      const rowMap = new Map<number, [T]>();
      for (let j = 0; j < this.boardSize; j++) {
        const cell: [T] = [this.board[i][j][0]] as [T];
        rowMap.set(j, cell);
        row.push(cell);
      }
      clonedBoardMap.set(i, rowMap);
      clonedBoard.push(row);
    }
    return [clonedBoard, clonedBoardMap];
  }
}
