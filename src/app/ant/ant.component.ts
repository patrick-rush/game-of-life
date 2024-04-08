import { CommonModule, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ColorCellPipe } from '../color-cell.pipe';
import { ControlsComponent } from '../controls/controls.component';
import { DetailsComponent } from '../details/details.component';
import { DefaultsService, Game } from '../defaults.service';
import { BaseGameComponent } from '../base-game/base-game.component';
import { ANT } from '../../constants';

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

export enum Turn {
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
  readonly activeGame: Game = Game.ANT;
  colorMap: Map<
    number,
    {
      color: string;
      degreeTurn: Turn;
    }
  > = new Map([
    [
      -1,
      {
        color: 'var(--dark)',
        degreeTurn: Turn.LEFT,
      },
    ],
  ]);
  sequence: [Turn, number][] = [];

  override boardSize = 60;
  override interval = 10;
  override maxBoardSize = 200;
  override minInterval = 10;

  board: [Cell][][];
  boardMap: BoardMap;

  ant: Ant;
  colorSequence: number[];
  turnSequence: Turn[];
  untouchedCellBehavior: Turn = Turn.LEFT;
  nameShowing: boolean = false;

  constructor(
    @Inject(DefaultsService) protected override defaults: DefaultsService
  ) {
    super(defaults);

    this.cellSize = this.calculateCellSize(
      this.cellSizeDividend,
      this.boardSize
    );

    this.colorSequence = this.generateColorSequence();

    this.ant = {
      colorSequence: this.colorSequence,
      sequenceIndex: 0,
      coordinates: this.placeAnt(),
      facing: Facing.UP,
    };

    for (let i = 0; i <= Math.max(...this.colorSequence); i++) {
      const turnOptions = this.enumToIterable(Turn);
      this.colorMap.set(i, {
        color: this.genRanHex(6),
        degreeTurn: Math.floor(Math.random() * turnOptions.length),
      });
    }

    this.turnSequence = this.colorSequence.map(
      (color) => this.colorMap.get(color)!.degreeTurn
    );

    const [newBoard, newBoardMap] = this.generateBoard();
    this.board = newBoard;
    this.boardMap = newBoardMap;

    this.writeName();
  }

  generateColorSequence(): number[] {
    const sequenceLength = Math.ceil(Math.random() * 10);
    const colorSequence = Array.from(
      { length: sequenceLength },
      () => Math.floor(Math.random() * 10) % sequenceLength
    );
    return colorSequence;
  }

  placeAnt(): [number, number] {
    const randomCol = Math.floor(Math.random() * this.boardSize);
    const randomRow = Math.floor(Math.random() * this.boardSize);
    const newCoordinates: [number, number] = [randomCol, randomRow];
    return newCoordinates;
  }

  generateBoard(): [[Cell][][], BoardMap] {
    const newBoard: [Cell][][] = [];
    const newBoardMap: BoardMap = new Map();

    const [antCol, antRow] = this.ant.coordinates;
    for (let i = 0; i < this.boardSize; i++) {
      const col: [Cell][] = [];
      const colMap = new Map<number, [Cell]>();
      for (let j = 0; j < this.boardSize; j++) {
        let cell = this.colorMap.get(-1)!;
        if (i === antCol && j === antRow) {
          cell = this.colorMap.get(0)!;
        }
        colMap.set(j, [cell]);
        col.push([cell]);
      }
      newBoardMap.set(i, colMap);
      newBoard.push(col);
    }
    return [newBoard, newBoardMap];
  }

  override startGame(): void {
    if (this.nameShowing) this.resetGame();
    this.intervalId = window.setInterval(this.runGame, this.interval);
    this.running = true;
    console.log('Game started');

    // benchmarking
    // console.time('game timer');
  }

  move() {
    // get ant location
    const [col, row] = this.ant.coordinates;

    // get current cell info
    const cell = this.getCellValue(this.boardMap, col, row);

    // extract degree turn from cell
    let { degreeTurn } = cell;
    if (cell.color === 'var(--dark)') degreeTurn = this.untouchedCellBehavior;

    // clone cell for updating
    let cellClone: Cell = { ...cell };

    // update cloned cell color
    cellClone = this.colorMap.get(
      this.ant.colorSequence[this.ant.sequenceIndex]
    )!;

    // update ant's color sequence index
    this.ant.sequenceIndex =
      (this.ant.sequenceIndex + 1) % this.ant.colorSequence.length;

    // update ant's facing
    this.ant.facing = this.turn(this.ant, degreeTurn);

    // move ant according to new facing
    this.ant.coordinates = this.determineNewLocation(this.ant);

    // update board
    this.boardMap.get(col)!.set(row, [cellClone]);
  }

  turn(ant: Ant, turn: Turn): Facing {
    const newFacing = (ant.facing + turn) % 4;
    return newFacing;
  }

  determineNewLocation(ant: Ant): [number, number] {
    const [col, row] = ant.coordinates;

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
    this.nameShowing = false;
    this.ant = {
      colorSequence: this.colorSequence,
      sequenceIndex: 0,
      coordinates: this.placeAnt(),
      facing: Facing.UP,
    };
    const [newBoard, newBoardMap] = this.generateBoard();
    this.iteration = 0;
    this.board = newBoard;
    this.boardMap = newBoardMap;
  }

  runGame = () => {
    // console.log('Game running');
    this.iteration++;
    this.move();
  };

  genRanHex = (size: number) =>
    [...Array(size)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');

  toggleColorMode() {
    for (const [key, value] of this.colorMap) {
      if (key === -1) continue;
      value.color = this.genRanHex(6);
    }
  }

  writeName() {
    this.nameShowing = true;
    const boardSizeReference = this.boardSize / 2;
    const negativeSpace = ANT.length;
    const min = boardSizeReference - negativeSpace / 2;
    for (let col = 0; col < negativeSpace; col++) {
      for (let row = 0; row < negativeSpace; row++) {
        const cell = ANT[row][col];
        if (cell) {
          this.boardMap.get(col + min)!.get(row + min)![0] =
            this.colorMap.get(0)!;
        }
      }
    }
  }

  getCellStyle(col: number, row: number): string {
    const cell = this.getCellValue(this.boardMap, col, row);
    const color = cell.color;
    return `#${color}`;
  }

  logUnused() {
    // console.log('Unused');
  }

  toggleUntouchedCellBehavior(): void {
    this.untouchedCellBehavior =
      (this.untouchedCellBehavior + 1) % this.enumToIterable(Turn).length;
    this.colorMap.set(-1, {
      color: 'var(--dark)',
      degreeTurn: this.untouchedCellBehavior,
    });
  }

  enumToIterable<T>(enumObject: T): string[] {
    if (typeof enumObject !== 'object' || enumObject === null) {
      throw new Error('Invalid input');
    }
    return Object.keys(enumObject).filter((key) => isNaN(Number(key)));
  }
}
