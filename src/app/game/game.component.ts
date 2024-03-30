import { CommonModule, NgFor } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';

type Binary = 0 | 1;

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [NgFor, CommonModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export class GameComponent {
  intervalId: number | null = null;
  // board: Binary[][] = Array(60).fill(Array(60).fill(0));
  board: [Boolean][][] = [];
  boardMap: Map<number, Map<number, [Boolean]>> = new Map();
  private readonly interval;

  constructor(private ref: ChangeDetectorRef) {
    this.interval = 1000;
    this.generateBoard();
  }

  generateBoard() {
    for (let i = 0; i < 60; i++) {
      const row: [Boolean][] = [];
      const rowMap = new Map<number, [Boolean]>();
      for (let j = 0; j < 60; j++) {
        const cell: [Boolean] = [true];
        rowMap.set(j, cell);
        row.push(cell);
      }
      this.boardMap.set(i, rowMap);
      this.board.push(row);
    }
  }

  startGame() {
    this.intervalId = window.setInterval(this.runGame, this.interval);
    console.log('Game started');
  }

  stopGame() {
    if (!this.intervalId) return;
    window.clearInterval(this.intervalId);
    console.log('Game stopped');
  }

  resetGame() {
    console.log('Game reset');
  }

  private runGame() {
    console.log('Game running');
  }

  flipCell(row: number, col: number) {
    const cell = this.boardMap.get(row)?.get(col);
    if (cell === undefined) return;
    console.log('before', cell[0]);
    console.log('ref', this.boardMap.get(row)?.get(col));
    console.log('arr ref', this.board[row][col]);
    cell[0] = !cell[0];
    console.log('after', cell[0]);
    console.log('ref', this.boardMap.get(row)?.get(col));
    console.log('arr ref', this.board[row][col]);
    this.ref.detectChanges();
    console.log('Cell flipped');
  }

  /**
   * Rules:
   *  Birth:    An empty, or “dead,” cell with precisely three “live” neighbors (full cells) becomes live.
   *  Death:    A live cell with zero or one neighbors dies of isolation; a live cell with four or more neighbors dies of overcrowding.
   *  Survival: A live cell with two or three neighbors remains alive.
   */
}
