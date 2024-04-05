import { CommonModule, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ColorCellPipe } from '../color-cell.pipe';
import { ControlsComponent } from '../controls/controls.component';
import { DetailsComponent } from '../details/details.component';
import { DefaultsService, Game } from '../defaults.service';
import { BaseGameComponent } from '../base-game/base-game.component';
import { RPS } from '../../constants';

type Ant = {
  colorSequence: number[];
  sequenceIndex: number;
  coordinates: [number, number];
  facing: Facing;
};

type Cell = {
  color: string;
  degreeTurn: Turn;
};

enum Turn {
  NONE,
  RIGHT,
  AROUND,
  LEFT,
}

enum Facing {
  UP,
  RIGHT,
  DOWN,
  LEFT,
}

/**
 * Multi-Color Ant Rules
 * - On each turn, the ant will evaluate the color of the cell it is on
 * - Based on the color of the cell it is on, it will turn in the direction specified by that color
 * - The ant will then change the color of the cell it is on to the next color in the sequence
 *
 * Things the cell knows: ✔
 * - The color of the cell
 * - The degree turn the ant should make
 *
 *   Cell Data Should Look Like:
 *   [color, degreeTurn]
 *
 * Things the ant knows: ✔
 * - The sequence of colors
 * - Its current place in the sequence
 * - The direction it is currently facing
 * - The coordinates of the cell it is currently on
 *
 *   Ant Data Should Look Like:
 *   [color, direction]
 *
 * Things the board knows:
 * - The color of each cell
 * - The current position of the ant
 *
 * Possible Degree Turns (and corresponding direction if the ant is facing up): ✔
 * - 0: No Turn
 * - 1: Turn Right
 * - 2: Turn Around
 * - 3: Turn Left
 *
 * Possible Colors: ✔
 * - Colors are generated randomly at the beginning of each game
 *
 * Possible Directions: ✔
 * - 0: Up
 * - 1: Right
 * - 2: Down
 * - 3: Left
 */

type TallyNeighborsReturn = {
  // [number.ROCK]: number;
  // [number.PAPER]: number;
  // [number.SCISSORS]: number;
};

type BoardMap = Map<number, Map<number, [Cell]>>;

@Component({
  selector: 'app-ant',
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
  templateUrl: './ant.component.html',
  styleUrl: './ant.component.css',
})
export class AntComponent extends BaseGameComponent {
  protected override intervalId: number | null = null;
  readonly activeGame: Game = Game.RPS;
  colorMap: Map<
    number,
    {
      color: string;
      degreeTurn: Turn;
    }
  > = new Map();
  sequence: [Turn, number][] = [];

  // override boardSize;
  // override cellSize;

  board: [Cell][][];
  boardMap: BoardMap;

  override interval;

  ant: Ant;

  constructor(
    @Inject(DefaultsService) protected override defaults: DefaultsService
  ) {
    super(defaults);

    // this.boardSize = 150;

    const randomCol = Math.floor(Math.random() * this.boardSize);
    const randomRow = Math.floor(Math.random() * this.boardSize);

    this.ant = {
      colorSequence: [0, 1, 2],
      sequenceIndex: 0,
      coordinates: [randomCol, randomRow],
      facing: Facing.UP,
    };

    this.colorMap.set(-1, {
      color: 'var(--dark)',
      degreeTurn: Turn.RIGHT,
    });
    this.colorMap.set(0, {
      color: this.genRanHex(6),
      degreeTurn: Turn.LEFT,
    });
    this.colorMap.set(1, {
      color: this.genRanHex(6),
      degreeTurn: Turn.RIGHT,
    });
    this.colorMap.set(2, {
      color: this.genRanHex(6),
      degreeTurn: Turn.LEFT,
    });

    const [newBoard, newBoardMap] = this.generateBoard();
    this.board = newBoard;
    this.boardMap = newBoardMap;
    this.interval = 200;

    // this.cellSize = this.cellSizeDividend / this.boardSize + 'px';

    // const [rockColor, paperColor, scissorsColor] = this.toggleColorMode();
    // this.writeName();
  }

  generateBoard(): [[Cell][][], BoardMap] {
    const newBoard: [Cell][][] = [];
    const newBoardMap: BoardMap = new Map();
    const [antCol, antRow] = this.ant.coordinates;
    for (let i = 0; i < this.boardSize; i++) {
      const col: [Cell][] = [];
      const colMap = new Map<number, [Cell]>();
      for (let j = 0; j < this.boardSize; j++) {
        let cell: Cell = {
          color: this.colorMap.get(-1)!.color,
          degreeTurn: 1,
        };
        if (i === antCol && j === antRow) {
          cell.color = this.colorMap.get(0)!.color;
          cell.degreeTurn = 1;
        }
        colMap.set(j, [cell]);
        col.push([cell]);
      }
      newBoardMap.set(i, colMap);
      newBoard.push(col);
    }
    console.log('Generated board:', { newBoard, newBoardMap });
    return [newBoard, newBoardMap];
  }

  move() {
    console.log('Moving ant');

    // get the location of the ant
    const [col, row] = this.ant.coordinates;

    // get the information about the cell that the ant is on
    const cell = this.getCellValue(this.boardMap, col, row);
    console.log('Cell:', cell);
    // extract the degree turn from the cell
    // this is the turn before proceeding to the next cell
    const { degreeTurn } = cell;

    // clone the cell so we can update it
    const cellClone: Cell = { ...cell };

    // update the position in the sequence that the ant is on
    this.ant.sequenceIndex =
      (this.ant.sequenceIndex + 1) % this.ant.colorSequence.length;

    // update the color of the cloned cell
    cellClone.color = this.colorMap.get(
      this.ant.colorSequence[this.ant.sequenceIndex]
    )!.color;
    cellClone.degreeTurn = this.colorMap.get(
      this.ant.colorSequence[this.ant.sequenceIndex]
    )!.degreeTurn;

    // update the degree turn of the cloned cell
    // cellClone.degreeTurn = this.colorMap.get(cellClone.color)!;

    // update the ant's facing
    console.log('Current facing:', this.ant.facing);
    const newFacing = this.turn(this.ant, degreeTurn);
    this.ant.facing = newFacing;
    console.log('New facing:', newFacing);

    // move the ant one space according to its new facing
    const newCoordinates = this.determineNewLocation(this.ant);
    console.log('Current location:', newCoordinates);
    this.ant.coordinates = newCoordinates;

    // update the board
    this.boardMap.get(col)!.set(row, [cellClone]);
    console.log('Cell clone:', cellClone);

    // we have to get the turn degree associated with the color that the ant is on
    // cellClone.degreeTurn = this.colorMap.get(cellClone.color)!;
  }

  turn(ant: Ant, turn: Turn): Facing {
    const newFacing = (ant.facing + turn) % 4;
    return newFacing;
  }

  determineNewLocation(ant: Ant): [number, number] {
    const [col, row] = ant.coordinates;
    console.log('determineNewLocation:', { col, row });

    switch (ant.facing) {
      case Facing.UP:
        return [col, (row - 1 + this.boardSize) % this.boardSize];
      case Facing.RIGHT:
        return [(col + 1) % this.boardSize, row];
      case Facing.DOWN:
        return [col, (row + 1) % this.boardSize];
      case Facing.LEFT:
        return [(col - 1 + this.boardSize) % this.boardSize, row];
      default:
        this.stopGame();
        throw new Error('Invalid facing');
    }
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
    this.move();
  };

  tallyNeighbors<T, R>(
    boardMap: Map<number, Map<number, [T]>>,
    col: number,
    row: number
  ): R {
    return this.logUnused() as R;
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
        // switch (cellValue) {
        //   case number.ROCK:
        //     rock++;
        //     break;
        //   case number.PAPER:
        //     paper++;
        //     break;
        //   case number.SCISSORS:
        //     scissors++;
        //     break;
        // }
      }
    }

    return {
      // [number.ROCK]: rock,
      // [number.PAPER]: paper,
      // [number.SCISSORS]: scissors,
    } as R;
  }

  genRanHex = (size: number) =>
    [...Array(size)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');

  // toggleColorMode(): [string, string, string] {

  //   this.rockColor = '#' + genRanHex(6);
  //   this.paperColor = '#' + genRanHex(6);
  //   this.scissorsColor = '#' + genRanHex(6);
  //   this.colorMode = !this.colorMode;
  //   return [this.rockColor, this.paperColor, this.scissorsColor];
  // }

  // writeName() {
  //   return this.logUnused();
  //   const boardHeightReference = Math.round(this.boardSize / 2);
  //   const boardWidthReference = Math.round(this.boardSize / 3);
  //   const negativeCol = RPS[0].length;
  //   const negativeRow = RPS.length;
  //   const minH = Math.round(boardHeightReference - negativeRow / 2);
  //   const minW = Math.round(boardWidthReference - negativeRow / 3);
  //   for (let col = 0; col < negativeCol; col++) {
  //     for (let row = 0; row < negativeRow; row++) {
  //       const cell = RPS[row][col];
  //       if (cell !== 3) {
  //         this.getCell(this.boardMap, col + minW, row + minH)[0] = cell;
  //       }
  //     }
  //   }
  // }

  getCellStyle(col: number, row: number): string {
    const cell = this.getCellValue(this.boardMap, col, row);
    // const color = this.colorMap.get(cell.color)!;
    const color = cell.color;
    // console.log('Cell:', cell);
    // console.log('Color:', color);
    return `#${color}`;
  }

  // getCellStyle(col: number, row: number): string {
  //   const cell = this.getCellValue(this.boardMap, col, row);
  // switch (cell) {
  //   case number.ROCK:
  //     return this.rockColor;
  //   case number.PAPER:
  //     return this.paperColor;
  //   case number.SCISSORS:
  //     return this.scissorsColor;
  // }
  // }

  logUnused() {
    console.log('Unused');
  }
}
