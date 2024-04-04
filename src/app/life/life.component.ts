import { CommonModule, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ColorCellPipe } from '../color-cell.pipe';
import { LIFE } from '../../constants';
import { ControlsComponent } from '../controls/controls.component';
import { DetailsComponent } from '../details/details.component';
import { DefaultsService } from '../defaults.service';
import { BaseGameComponent } from '../base-game/base-game.component';
import { Game } from '../defaults.service';

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
export class LifeComponent extends BaseGameComponent {
  protected override intervalId: number | null = null;
  readonly activeGame: Game = Game.LIFE;

  board: [boolean][][];
  boardMap: BoardMap;

  colorButtonHovered: boolean = false;
  currentColor: string;

  livingCells: number = 0;

  dragging: boolean = false;
  dragBehavior: 'create' | 'destroy' | null = null;
  hoveredCell: [number, number] | null = null;

  constructor(
    private colorCell: ColorCellPipe,
    @Inject(DefaultsService) protected override defaults: DefaultsService
  ) {
    super(defaults);

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
      const col: [boolean][] = [];
      const colMap = new Map<number, [boolean]>();
      for (let j = 0; j < this.boardSize; j++) {
        const cell: [boolean] = [false];
        colMap.set(j, cell);
        col.push(cell);
      }
      newBoardMap.set(i, colMap);
      newBoard.push(col);
    }
    return [newBoard, newBoardMap];
  }

  randomizeBoard() {
    this.resetGame();
    const boundary = Math.random() * (0.95 - 0.7) + 0.7;
    this.board.forEach((col) => {
      col.forEach((cell) => {
        if (Math.random() > boundary) {
          cell[0] = true;
          this.updateLivingCellCount();
        }
      });
    });
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
    console.log('Game running');
    this.iteration++;
    let newCellCount = 0;
    let gameOver = true;
    const [boardClone, boardMapClone] = this.cloneBoard<boolean>();

    boardClone.forEach((col, i) => {
      col.forEach((cell, j) => {
        const activeCell = this.getCell(this.boardMap, i, j);
        const neighbors = this.tallyNeighbors<boolean, number>(
          boardMapClone as BoardMap,
          i,
          j
        );
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

  flipCell(col: number, row: number) {
    const cell = this.getCell(this.boardMap, col, row);

    if (!cell) return;

    const newValue = !cell[0];
    cell[0] = newValue;

    if (newValue) this.updateLivingCellCount();
    else this.updateLivingCellCount(-1);
  }

  tallyNeighbors<T, R>(
    boardMap: Map<number, Map<number, [T]>>,
    row: number,
    col: number
  ): R {
    let liveNeighbors: number = 0;
    for (let c = col - 1, cc = col + 1; c <= cc; c++) {
      for (let r = row - 1, rr = row + 1; r <= rr; r++) {
        if (r === row && c === col) continue;
        let thisColumn = c;
        let thisRow = r;
        if (c < 0) thisColumn = this.boardSize - 1;
        if (c >= this.boardSize) thisColumn = 0;
        if (r < 0) thisRow = this.boardSize - 1;
        if (r >= this.boardSize) thisRow = 0;
        if (this.getCellValue(boardMap, thisRow, thisColumn)) liveNeighbors++;
      }
    }

    return liveNeighbors as R;
  }

  toggleColorMode() {
    this.colorMode = !this.colorMode;
  }

  writeName() {
    const boardSizeReference = this.boardSize / 2;
    const negativeSpace = LIFE.length;
    const min = boardSizeReference - negativeSpace / 2;
    for (let col = 0; col < negativeSpace; col++) {
      for (let row = 0; row < negativeSpace; row++) {
        const cell = LIFE[row][col];
        if (cell) {
          this.flipCell(col + min, row + min);
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

  getCellPosition(event: MouseEvent): [number | null, number | null] {
    const closestCol = (event.target as HTMLElement).closest('[data-col]');
    const closestRow = (event.target as HTMLElement).closest('[data-row]');
    if (!closestCol || !closestRow) return [null, null];
    try {
      const col = (closestCol?.attributes as NamedNodeMap)['data-col' as any]
        ?.value;
      const row = (closestRow?.attributes as NamedNodeMap)['data-row' as any]
        ?.value;
      if (row == null || col == null)
        throw new Error(`Invalid cell position. ROW: ${row}, COL: ${col}`);
      return [+col, +row];
    } catch (err) {
      console.error('Error getting cell position', err);
      throw err;
    }
  }

  handleMouseOver(event: MouseEvent) {
    const [col, row] = this.getCellPosition(event);
    if (col == null || row == null) return;
    const cellValue = this.getCellValue(this.boardMap, col, row);
    const [hRow, hCol] = this.hoveredCell || [null, null];
    if (this.dragging && hRow !== row && hCol !== col) {
      this.hoveredCell = [col, row];
      if (
        (cellValue && this.dragBehavior === 'destroy') ||
        (!cellValue && this.dragBehavior === 'create')
      ) {
        event.target?.addEventListener('mouseleave', this.handleMouseLeave);
        this.flipCell(col, row);
      }
    }
  }

  handleMouseLeave = () => (this.hoveredCell = null);

  setDragging(event: MouseEvent, desiredState: boolean) {
    event.preventDefault();
    const [col, row] = this.getCellPosition(event);
    this.dragging = desiredState;
    if (this.dragging && col != null && row != null) {
      this.dragBehavior = this.getCellValue(this.boardMap, col, row)
        ? 'destroy'
        : 'create';
      this.hoveredCell = [col, row];
      this.flipCell(col, row);
    }
  }

  getCellStyle(colIndex: number, rowIndex: number): string {
    const cellValue = this.getCellValue(this.boardMap, colIndex, rowIndex);
    if (!cellValue) {
      return 'var(--light)';
    } else if (this.colorMode) {
      return this.currentColor;
    } else {
      return 'var(--dark)';
    }
  }
}
