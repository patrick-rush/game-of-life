import { CommonModule, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ColorCellPipe } from '../color-cell.pipe';
import { ControlsComponent } from '../controls/controls.component';
import { DetailsComponent } from '../details/details.component';
import { DefaultsService, Game } from '../defaults.service';
import { BaseGameComponent } from '../base-game/base-game.component';
import { RPS } from '../../constants';

enum CellState {
  ROCK,
  PAPER,
  SCISSORS,
}

type TallyNeighborsReturn = {
  [CellState.ROCK]: number;
  [CellState.PAPER]: number;
  [CellState.SCISSORS]: number;
};

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
export class RpsComponent extends BaseGameComponent {
  protected override intervalId: number | null = null;
  readonly activeGame: Game = Game.RPS;

  board: [CellState][][];
  boardMap: BoardMap;

  rockColor: string;
  paperColor: string;
  scissorsColor: string;

  rockCount: number = 0;
  paperCount: number = 0;
  scissorsCount: number = 0;

  constructor(
    @Inject(DefaultsService) protected override defaults: DefaultsService
  ) {
    super(defaults);

    const [newBoard, newBoardMap] = this.generateBoard();
    this.board = newBoard;
    this.boardMap = newBoardMap;
    this.cellSize = this.cellSizeDividend / this.boardSize + 'px';

    const [rockColor, paperColor, scissorsColor] = this.toggleColorMode();
    this.rockColor = rockColor;
    this.paperColor = paperColor;
    this.scissorsColor = scissorsColor;

    this.writeName();
  }

  generateBoard(): [[CellState][][], BoardMap] {
    const newBoard: [CellState][][] = [];
    const newBoardMap: BoardMap = new Map();
    for (let i = 0; i < this.boardSize; i++) {
      const col: [CellState][] = [];
      const colMap = new Map<number, [CellState]>();
      for (let j = 0; j < this.boardSize; j++) {
        const random = Math.floor(Math.random() * 3);
        const cell: [CellState] = [random];
        colMap.set(j, cell);
        col.push(cell);
      }
      newBoardMap.set(i, colMap);
      newBoard.push(col);
    }
    return [newBoard, newBoardMap];
  }

  resetGame() {
    this.stopGame();
    const [newBoard, newBoardMap] = this.generateBoard();
    this.iteration = 0;
    this.board = newBoard;
    this.boardMap = newBoardMap;
  }

  runGame = () => {
    console.log('Game running');
    this.iteration++;
    let rock = 0;
    let paper = 0;
    let scissors = 0;
    const [boardClone, boardMapClone] = this.cloneBoard<CellState>();

    boardClone.forEach((col, i) => {
      col.forEach((_, j) => {
        const activeCell = this.getCell(this.boardMap, i, j);
        const neighbors = this.tallyNeighbors<CellState, TallyNeighborsReturn>(
          boardMapClone,
          i,
          j
        );
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

  tallyNeighbors<T, R>(
    boardMap: Map<number, Map<number, [T]>>,
    col: number,
    row: number
  ): R {
    let rock: number = 0;
    let paper: number = 0;
    let scissors: number = 0;
    for (let r = col - 1, rr = col + 1; r <= rr; r++) {
      for (let c = row - 1, cc = row + 1; c <= cc; c++) {
        if (r === col && c === row) continue;
        let thisRow = r;
        let thisColumn = c;
        if (r < 0) thisRow = this.boardSize - 1;
        if (r >= this.boardSize) thisRow = 0;
        if (c < 0) thisColumn = this.boardSize - 1;
        if (c >= this.boardSize) thisColumn = 0;
        const cellValue = this.getCellValue<T>(boardMap, thisRow, thisColumn);
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
    } as R;
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

  writeName() {
    const boardHeightReference = Math.round(this.boardSize / 2);
    const boardWidthReference = Math.round(this.boardSize / 3);
    const negativeCol = RPS[0].length;
    const negativeRow = RPS.length;
    const minH = Math.round(boardHeightReference - negativeRow / 2);
    const minW = Math.round(boardWidthReference - negativeRow / 3);
    for (let col = 0; col < negativeCol; col++) {
      for (let row = 0; row < negativeRow; row++) {
        const cell = RPS[row][col];
        if (cell !== 3) {
          this.getCell(this.boardMap, col + minW, row + minH)[0] = cell;
        }
      }
    }
  }

  getCellStyle(col: number, row: number): string {
    const cell = this.getCellValue(this.boardMap, col, row);
    switch (cell) {
      case CellState.ROCK:
        return this.rockColor;
      case CellState.PAPER:
        return this.paperColor;
      case CellState.SCISSORS:
        return this.scissorsColor;
    }
  }
}
