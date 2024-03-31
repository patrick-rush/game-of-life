import {
  CommonModule,
  NgFor,
  NgIf,
  NgStyle,
  NgTemplateOutlet,
} from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ColorCellPipe } from '../color-cell.pipe';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    ColorCellPipe,
    CommonModule,
    NgFor,
    NgIf,
    NgStyle,
    NgTemplateOutlet,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export class GameComponent {
  intervalId: number | null = null;
  private readonly interval: number = 100;
  private readonly boardSize: number = 55;
  running: boolean = false;
  iteration: number = 0;
  livingCells: number = 0;
  board: [boolean][][];
  boardMap: Map<number, Map<number, [boolean]>>;

  constructor(private ref: ChangeDetectorRef) {
    const [newBoard, newBoardMap] = this.generateBoard();
    this.board = newBoard;
    this.boardMap = newBoardMap;
  }

  generateBoard(): [[boolean][][], Map<number, Map<number, [boolean]>>] {
    const newBoard: [boolean][][] = [];
    const newBoardMap: Map<number, Map<number, [boolean]>> = new Map();
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
  }

  stopGame() {
    if (!this.intervalId) return;
    window.clearInterval(this.intervalId);
    this.running = false;
    console.log('game stopped');
  }

  resetGame() {
    this.stopGame();
    this.iteration = 0;
    this.livingCells = 0;
    this.board = [];
    const [newBoard, newBoardMap] = this.generateBoard();
    this.board = newBoard;
    this.boardMap = newBoardMap;
    console.log('game reset');
  }

  runGame = () => {
    console.log('game running');
    this.iteration++;
    let newCellCount = 0;
    const [newBoard, newBoardMap] = this.generateBoard();
    let gameOver = true;
    this.board.forEach((row, i) => {
      row.forEach((cell, j) => {
        const newCell = newBoardMap.get(i)?.get(j)!;
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
    if (gameOver || this.iteration === 999999) this.stopGame();
    this.livingCells = newCellCount;
    this.board = newBoard;
    this.boardMap = newBoardMap;
  };

  flipCell(row: number, col: number) {
    const cell = this.boardMap.get(row)?.get(col);
    if (cell === undefined) return;
    cell[0] = !cell[0];
    if (cell[0]) this.livingCells++;
    else this.livingCells--;
    this.ref.detectChanges();
  }

  getLiveNeighborCount(row: number, col: number): number {
    let liveNeighbors: number = 0;
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r === row && c === col) continue;
        if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize) {
          if (this.boardMap.get(r)?.get(c)?.[0]) liveNeighbors++;
        }
      }
    }
    return liveNeighbors;
  }
}
