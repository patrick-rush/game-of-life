import { CommonModule, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ColorCellPipe } from '../color-cell.pipe';
import { LIFE } from '../../constants';
import { ControlsComponent } from '../controls/controls.component';
import { DetailsComponent } from '../details/details.component';
import { DefaultsService } from '../defaults.service';

type BoardMap = Map<number, Map<number, [boolean]>>;

@Component({
  selector: 'app-life',
  standalone: true,
  imports: [
    DetailsComponent,
    ColorCellPipe,
    CommonModule,
    ControlsComponent,
    NgFor,
    NgIf,
    NgStyle,
  ],
  providers: [ColorCellPipe],
  templateUrl: './life.component.html',
  styleUrl: './life.component.css',
})
export class LifeComponent {
  private intervalId: number | null = null;
  interval: number;
  boardSize: number;

  board: [boolean][][];
  boardMap: BoardMap;

  cellSize: string;
  cellSizeDividend: number;

  colorMode: boolean = false;
  colorButtonHovered: boolean = false;
  currentColor: string;

  iteration: number = 0;
  maxIterations: number;

  livingCells: number = 0;
  running: boolean = false;

  dragging: boolean = false;
  dragBehavior: 'create' | 'destroy' | null = null;
  hoveredCell: [number, number] | null = null;

  constructor(
    private colorCell: ColorCellPipe,
    @Inject(DefaultsService) private defaults: DefaultsService
  ) {
    this.boardSize = defaults.boardSize;
    this.interval = defaults.interval;
    this.maxIterations = defaults.maxIterations;
    this.cellSizeDividend = defaults.cellSizeDividend;

    const [newBoard, newBoardMap] = this.generateBoard();
    this.board = newBoard;
    this.boardMap = newBoardMap;
    this.cellSize = this.cellSizeDividend / this.boardSize + 'px';
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

  startGame(): void {
    this.intervalId = window.setInterval(this.runGame, this.interval);
    this.running = true;

    // benchmarking
    // console.log('living cells at start:', this.livingCells);
    // console.time('game timer');
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

  resetGame() {
    this.stopGame();
    const [newBoard, newBoardMap] = this.generateBoard();
    this.iteration = 0;
    this.updateLivingCellCount(0);
    this.board = newBoard;
    this.boardMap = newBoardMap;
  }

  runGame = () => {
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

  toggleColorMode() {
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

  handleMouseOver(event: MouseEvent, row: number, col: number) {
    const cellValue = this.getCellValue(this.boardMap, row, col);
    const [hRow, hCol] = this.hoveredCell || [null, null];
    if (this.dragging && hRow !== row && hCol !== col) {
      this.hoveredCell = [row, col];
      if (
        (cellValue && this.dragBehavior === 'destroy') ||
        (!cellValue && this.dragBehavior === 'create')
      ) {
        event.target?.addEventListener('mouseleave', this.handleMouseLeave);
        this.flipCell(row, col);
      }
    }
  }

  handleMouseLeave = () => (this.hoveredCell = null);

  setDragging(desiredState: boolean, row?: number, col?: number) {
    this.dragging = desiredState;
    if (this.dragging && row != null && col != null) {
      this.dragBehavior = this.getCellValue(this.boardMap, row, col)
        ? 'destroy'
        : 'create';
      this.hoveredCell = [row, col];
      this.flipCell(row, col);
    }
  }
}
