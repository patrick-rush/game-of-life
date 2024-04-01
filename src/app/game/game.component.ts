import { CommonModule, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { ColorCellPipe } from '../color-cell.pipe';
import { LIFE } from '../../constants';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

type BoardMap = Map<number, Map<number, [boolean]>>;
@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    ColorCellPipe,
    CommonModule,
    ReactiveFormsModule,
    NgFor,
    NgIf,
    NgStyle,
  ],
  providers: [ColorCellPipe],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export class GameComponent {
  private readonly interval: number = 100;
  private intervalId: number | null = null;
  readonly maxBoardSize: number = 100;
  readonly minBoardSize: number = 20;
  boardSize: number = 60; // Board must be a positive, even number

  boardMap: BoardMap;
  board: [boolean][][];
  currentColor: string;

  cellSize: string = '14px';
  colorMode: boolean = false;
  colorButtonHovered: boolean = false;
  iteration: number = 0;
  livingCells: number = 0;
  maxIterations: number = 999999;
  running: boolean = false;

  boardSizeForm = new FormGroup({
    boardSize: new FormControl('60'),
  });

  constructor(private colorCell: ColorCellPipe) {
    const [newBoard, newBoardMap] = this.generateBoard();
    this.board = newBoard;
    this.boardMap = newBoardMap;
    this.writeName();
    this.currentColor = this.updateColor();
  }

  generateBoard(): [[boolean][][], BoardMap] {
    const newBoard: [boolean][][] = [];
    const newBoardMap: BoardMap = new Map();
    for (let i = 0; i < this.boardSize; i++) {
      const row: [boolean][] = [];
      const rowMap = new Map<number, [boolean]>();
      for (let j = 0; j < this.boardSize; j++) {
        const cell: [boolean] = [false];
        rowMap.set(j, cell);
        row.push(cell);
      }
      newBoardMap.set(i, rowMap);
      newBoard.push(row);
    }
    return [newBoard, newBoardMap];
  }

  randomizeBoard() {
    this.resetGame();
    const boundary = Math.random() * (0.95 - 0.7) + 0.7;
    this.board.forEach((row) => {
      row.forEach((cell) => {
        if (Math.random() > boundary) {
          cell[0] = true;
          this.updateLivingCellCount();
        }
      });
    });
  }

  startGame() {
    this.intervalId = window.setInterval(this.runGame, this.interval);
    this.running = true;
    console.log('game started');

    // benchmarking
    // console.log('living cells at start:', this.livingCells);
    // console.time('game timer');
  }

  stopGame() {
    if (!this.intervalId) return;
    window.clearInterval(this.intervalId);
    this.running = false;
    console.log('game stopped');

    // benchmarking
    // console.log('living cells at end:', this.livingCells);
    // console.timeEnd('game timer');
  }

  resetGame() {
    this.stopGame();
    const [newBoard, newBoardMap] = this.generateBoard();
    this.iteration = 0;
    this.updateLivingCellCount(0);
    this.board = newBoard;
    this.boardMap = newBoardMap;
    console.log('game reset');
  }

  runGame = () => {
    console.log('game running');

    this.iteration++;
    let newCellCount = 0;
    let gameOver = true;
    const [boardClone, boardMapClone] = this.cloneBoard();

    boardClone.forEach((row, i) => {
      row.forEach((cell, j) => {
        const activeCell = this.getCell(this.boardMap, i, j);
        const neighbors = this.getLiveNeighborCount(boardMapClone, i, j);
        if (cell[0]) {
          gameOver = false;
          if (neighbors < 2 || neighbors > 3) {
            activeCell[0] = false;
          } else {
            activeCell[0] = true;
          }
        } else {
          if (neighbors === 3) {
            activeCell[0] = true;
          }
        }
        if (activeCell[0]) newCellCount++;
      });
    });

    if (gameOver || this.iteration === this.maxIterations) this.stopGame();
    this.updateLivingCellCount(newCellCount);
  };

  flipCell(row: number, col: number) {
    const cell = this.getCell(this.boardMap, row, col);

    if (!cell) return;

    const newValue = !cell[0];
    cell[0] = newValue;

    if (newValue) this.updateLivingCellCount();
    else this.updateLivingCellCount(-1);
  }

  getLiveNeighborCount(boardMap: BoardMap, row: number, col: number): number {
    let liveNeighbors: number = 0;
    for (let r = row - 1, rr = row + 1; r <= rr; r++) {
      for (let c = col - 1, cc = col + 1; c <= cc; c++) {
        if (r === row && c === col) continue;
        let thisRow = r;
        let thisColumn = c;
        if (r < 0) thisRow = this.boardSize - 1;
        if (r >= this.boardSize) thisRow = 0;
        if (c < 0) thisColumn = this.boardSize - 1;
        if (c >= this.boardSize) thisColumn = 0;
        if (this.getCellValue(boardMap, thisRow, thisColumn)) liveNeighbors++;
      }
    }

    return liveNeighbors;
  }

  getCell(board: BoardMap, row: number, col: number): [boolean] {
    return board.get(row)?.get(col)!;
  }

  getCellValue(board: BoardMap, row: number, col: number): boolean {
    return this.getCell(board, row, col)[0]!;
  }

  flipColorMode() {
    this.colorMode = !this.colorMode;
  }

  writeName() {
    const boardSizeReference = this.boardSize / 2;
    const negativeSpace = LIFE.length;
    const min = boardSizeReference - negativeSpace / 2;
    for (let row = 0; row < negativeSpace; row++) {
      for (let col = 0; col < negativeSpace; col++) {
        const cell = LIFE[col][row];
        if (cell) {
          this.flipCell(row + min, col + min);
        }
      }
    }
  }

  /**
   * @param count
   * (optional) if provided, will set the living cell count to the provided value.
   * If -1, will decrement the living cell count by 1.
   * If not provided, will increment the living cell count by 1.
   */
  updateLivingCellCount(count?: number): void {
    if (count === -1) this.livingCells--;
    else if (count != null) this.livingCells = count;
    else this.livingCells++;
    this.updateColor();
  }

  updateColor(): string {
    const color = this.colorCell.transform(this.livingCells, this.boardSize);
    this.currentColor = color;
    return color;
  }

  handleFormSubmit() {
    console.log('form submitted');
    const { boardSize } = this.boardSizeForm.value;
    if (!boardSize) return;
    this.boardSize = this.enforceValidNumber(+boardSize);
    this.cellSize = Math.round(840 / this.boardSize) + 'px';
    this.resetGame();
  }

  enforceValidNumber(value: number): number {
    if (value > this.maxBoardSize) return this.maxBoardSize;
    if (value < this.minBoardSize) return this.minBoardSize;
    return value % 2 === 0 ? value : value + 1;
  }

  cloneBoard(): [[boolean][][], BoardMap] {
    const clonedBoard: [boolean][][] = [];
    const clonedBoardMap: BoardMap = new Map();
    for (let i = 0; i < this.boardSize; i++) {
      const row: [boolean][] = [];
      const rowMap = new Map<number, [boolean]>();
      for (let j = 0; j < this.boardSize; j++) {
        const cell: [boolean] = [this.board[i][j][0]];
        rowMap.set(j, cell);
        row.push(cell);
      }
      clonedBoardMap.set(i, rowMap);
      clonedBoard.push(row);
    }
    return [clonedBoard, clonedBoardMap];
  }
}
