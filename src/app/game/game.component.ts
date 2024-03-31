import { CommonModule, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { ColorCellPipe } from '../color-cell.pipe';

type BoardMap = Map<number, Map<number, [boolean]>>;
@Component({
  selector: 'app-game',
  standalone: true,
  imports: [ColorCellPipe, CommonModule, NgFor, NgIf, NgStyle],
  providers: [ColorCellPipe],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export class GameComponent {
  private readonly interval: number = 100;
  private readonly boardSize: number = 60; // Board must be a positive, even number
  private intervalId: number | null = null;
  running: boolean = false;
  iteration: number = 0;
  livingCells: number = 0;
  board: [boolean][][];
  boardMap: BoardMap;
  colorMode: boolean = false;
  colorButtonHovered: boolean = false;
  currentColor: string;

  constructor(private colorCell: ColorCellPipe) {
    const [newBoard, newBoardMap] = this.generateBoard();
    this.board = newBoard;
    this.boardMap = newBoardMap;
    this.writeName();
    this.currentColor = this.colorCell.transform(this.livingCells);
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
          this.livingCells++;
        }
      });
    });
  }

  startGame() {
    this.intervalId = window.setInterval(this.runGame, this.interval);
    this.running = true;
    console.log('game started');

    // testing
    console.time('game');
  }

  stopGame() {
    if (!this.intervalId) return;
    window.clearInterval(this.intervalId);
    this.running = false;
    console.log('game stopped');

    //testing
    console.timeEnd('game');
  }

  resetGame() {
    this.stopGame();
    const [newBoard, newBoardMap] = this.generateBoard();
    this.iteration = 0;
    this.livingCells = 0;
    this.board = newBoard;
    this.boardMap = newBoardMap;
    console.log('game reset');
  }

  runGame = () => {
    console.log('game running');

    this.iteration++;
    let newCellCount = 0;
    let gameOver = true;
    const [newBoard, newBoardMap] = this.generateBoard();

    this.board.forEach((row, i) => {
      row.forEach((cell, j) => {
        const newCell = this.getCell(newBoardMap, i, j);
        const neighbors = this.getLiveNeighborCount(i, j);
        if (cell[0]) {
          gameOver = false;
          if (neighbors < 2 || neighbors > 3) {
            newCell[0] = false;
          } else {
            newCell[0] = true;
          }
        } else {
          if (neighbors === 3) {
            newCell[0] = true;
          }
        }
        if (newCell[0]) newCellCount++;
      });
    });

    // if (gameOver || this.iteration === 999999) this.stopGame();

    //testing
    if (gameOver || this.iteration === 100) this.stopGame();

    this.livingCells = newCellCount;
    this.currentColor = this.colorCell.transform(this.livingCells);
    this.board = newBoard;
    this.boardMap = newBoardMap;
  };

  flipCell(row: number, col: number) {
    const cell = this.getCell(this.boardMap, row, col);

    if (!cell) return;

    const newValue = !cell[0];
    cell[0] = newValue;

    if (newValue) this.livingCells++;
    else this.livingCells--;
  }

  getLiveNeighborCount(row: number, col: number): number {
    let liveNeighbors: number = 0;

    for (let r = row - 1, rr = row + 1; r <= rr; r++) {
      for (let c = col - 1, cc = col + 1; c <= cc; c++) {
        if (r === row && c === col) continue;
        if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize) {
          if (this.getCellValue(this.boardMap, r, c)) liveNeighbors++;
        }
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

  LIFE = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  writeName() {
    const boardSizeReference = this.boardSize / 2;
    const negativeSpace = this.LIFE.length;
    const min = boardSizeReference - negativeSpace / 2;
    for (let row = 0; row < negativeSpace; row++) {
      for (let col = 0; col < negativeSpace; col++) {
        if (this.LIFE[col][row]) this.flipCell(row + min, col + min);
      }
    }
  }
}
