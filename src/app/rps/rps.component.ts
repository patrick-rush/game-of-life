import { CommonModule, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ColorCellPipe } from '../color-cell.pipe';
import { ControlsComponent } from '../controls/controls.component';
import { DetailsComponent } from '../details/details.component';
import { DefaultsService } from '../defaults.service';

enum CellState {
  ROCK,
  PAPER,
  SCISSORS,
}

type BoardMap = Map<number, Map<number, [CellState]>>;

@Component({
  selector: 'app-rps',
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
  templateUrl: './rps.component.html',
  styleUrl: './rps.component.css',
})
export class RpsComponent {
  private intervalId: number | null = null;
  interval: number;
  boardSize: number;

  board: [CellState][][];
  boardMap: BoardMap;

  cellSize: string;
  cellSizeDividend: number;

  rockColor: string;
  paperColor: string;
  scissorsColor: string;

  colorMode: boolean = false;
  colorButtonHovered: boolean = false;

  iteration: number = 0;
  maxIterations: number;

  rockCount: number = 0;
  paperCount: number = 0;
  scissorsCount: number = 0;
  running: boolean = false;

  constructor(@Inject(DefaultsService) private defaults: DefaultsService) {
    this.boardSize = defaults.boardSize;
    this.interval = defaults.interval;
    this.maxIterations = defaults.maxIterations;
    this.cellSizeDividend = defaults.cellSizeDividend;

    const [newBoard, newBoardMap] = this.generateBoard();
    this.board = newBoard;
    this.boardMap = newBoardMap;
    this.cellSize = this.cellSizeDividend / this.boardSize + 'px';

    const [rockColor, paperColor, scissorsColor] = this.toggleColorMode();
    this.rockColor = rockColor;
    this.paperColor = paperColor;
    this.scissorsColor = scissorsColor;
  }

  generateBoard(): [[CellState][][], BoardMap] {
    const newBoard: [CellState][][] = [];
    const newBoardMap: BoardMap = new Map();
    for (let i = 0; i < this.boardSize * 2; i++) {
      const row: [CellState][] = [];
      const rowMap = new Map<number, [CellState]>();
      for (let j = 0; j < this.boardSize; j++) {
        const random = Math.floor(Math.random() * 3);
        const cell: [CellState] = [random];
        rowMap.set(j, cell);
        row.push(cell);
      }
      newBoardMap.set(i, rowMap);
      newBoard.push(row);
    }
    return [newBoard, newBoardMap];
  }

  startGame(): void {
    this.intervalId = window.setInterval(this.runGame, this.interval);
    this.running = true;

    // benchmarking
    // this.maxIterations = 100;
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
    // console.timeEnd('game timer');
  }

  resetGame() {
    this.stopGame();
    const [newBoard, newBoardMap] = this.generateBoard();
    this.iteration = 0;
    this.board = newBoard;
    this.boardMap = newBoardMap;
  }

  runGame = () => {
    this.iteration++;
    let rock = 0;
    let paper = 0;
    let scissors = 0;
    const [boardClone, boardMapClone] = this.cloneBoard();

    boardClone.forEach((row, i) => {
      row.forEach((_, j) => {
        const activeCell = this.getCell(this.boardMap, i, j);
        const neighbors = this.tallyNeighbors(boardMapClone, i, j);
        if (activeCell[0] === CellState.ROCK && neighbors[CellState.PAPER] >= 3)
          activeCell[0] = CellState.PAPER;
        if (
          activeCell[0] === CellState.PAPER &&
          neighbors[CellState.SCISSORS] >= 3
        )
          activeCell[0] = CellState.SCISSORS;
        if (
          activeCell[0] === CellState.SCISSORS &&
          neighbors[CellState.ROCK] >= 3
        )
          activeCell[0] = CellState.ROCK;
      });
    });
    this.rockCount = rock;
    this.paperCount = paper;
    this.scissorsCount = scissors;

    if (this.iteration >= this.maxIterations) this.stopGame();
  };

  tallyNeighbors(
    boardMap: BoardMap,
    row: number,
    col: number
  ): {
    [CellState.ROCK]: number;
    [CellState.PAPER]: number;
    [CellState.SCISSORS]: number;
  } {
    let rock: number = 0;
    let paper: number = 0;
    let scissors: number = 0;
    for (let r = row - 1, rr = row + 1; r <= rr; r++) {
      for (let c = col - 1, cc = col + 1; c <= cc; c++) {
        if (r === row && c === col) continue;
        let thisRow = r;
        let thisColumn = c;
        if (r < 0) thisRow = this.boardSize - 1;
        if (r >= this.boardSize * 2) thisRow = 0;
        if (c < 0) thisColumn = this.boardSize - 1;
        if (c >= this.boardSize) thisColumn = 0;
        const cellValue = this.getCellValue(boardMap, thisRow, thisColumn);
        switch (cellValue) {
          case CellState.ROCK:
            rock++;
            break;
          case CellState.PAPER:
            paper++;
            break;
          case CellState.SCISSORS:
            scissors++;
            break;
        }
      }
    }

    return {
      [CellState.ROCK]: rock,
      [CellState.PAPER]: paper,
      [CellState.SCISSORS]: scissors,
    };
  }

  getCell(board: BoardMap, row: number, col: number): [CellState] {
    return board.get(row)?.get(col)!;
  }

  getCellValue(board: BoardMap, row: number, col: number): CellState {
    return this.getCell(board, row, col)[0]!;
  }

  toggleColorMode(): [string, string, string] {
    const genRanHex = (size: number) =>
      [...Array(size)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('');
    this.rockColor = '#' + genRanHex(6);
    this.paperColor = '#' + genRanHex(6);
    this.scissorsColor = '#' + genRanHex(6);
    this.colorMode = !this.colorMode;
    return [this.rockColor, this.paperColor, this.scissorsColor];
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

  cloneBoard(): [[CellState][][], BoardMap] {
    const clonedBoard: [CellState][][] = [];
    const clonedBoardMap: BoardMap = new Map();
    for (let i = 0; i < this.boardSize * 2; i++) {
      const row: [CellState][] = [];
      const rowMap = new Map<number, [CellState]>();
      for (let j = 0; j < this.boardSize; j++) {
        const cell: [CellState] = [this.board[i][j][0]];
        rowMap.set(j, cell);
        row.push(cell);
      }
      clonedBoardMap.set(i, rowMap);
      clonedBoard.push(row);
    }
    return [clonedBoard, clonedBoardMap];
  }
}
