import { Component, Inject } from '@angular/core';
import { DefaultsService, Game } from '../defaults.service';

export type TallyCallback<T> = (
  cellValue: T,
  tallies: Record<string, any>
) => void;
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
  minInterval: number;
  maxInterval: number;
  boardSize: number;
  minBoardSize: number;
  maxBoardSize: number;
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
    this.minInterval = defaults.minInterval;
    this.maxInterval = defaults.maxInterval;
    this.minBoardSize = defaults.minBoardSize;
    this.maxBoardSize = defaults.maxBoardSize;
    this.cellSize = this.calculateCellSize(
      this.cellSizeDividend,
      this.boardSize
    );
  }

  ngOnDestroy() {
    this.stopGame();
  }

  abstract generateBoard(): void;

  abstract resetGame(): void;

  abstract runGame(): void;

  abstract getCellStyle(col: number, row: number): string;

  tallyNeighbors<T>(
    boardMap: Map<number, Map<number, [T]>>,
    row: number,
    col: number,
    callback: TallyCallback<T>,
    initialTallies: Record<string, any>
  ): Record<string, any> {
    let tallies = { ...initialTallies };

    for (let r = row - 1, rr = row + 1; r <= rr; r++) {
      for (let c = col - 1, cc = col + 1; c <= cc; c++) {
        if (r === row && c === col) continue;

        let thisRow = r < 0 ? this.boardSize - 1 : r >= this.boardSize ? 0 : r;
        let thisCol = c < 0 ? this.boardSize - 1 : c >= this.boardSize ? 0 : c;

        const cellValue = this.getCellValue(boardMap, thisRow, thisCol);
        if (cellValue !== undefined) {
          callback(cellValue, tallies);
        }
      }
    }

    return tallies;
  }

  calculateCellSize = (dividend: number, size: number): string =>
    dividend / size + 'px';

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
    this.cellSize = this.calculateCellSize(
      this.cellSizeDividend,
      this.boardSize
    );
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
