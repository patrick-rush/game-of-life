import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameComponent } from './game/game.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GameComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'game-of-life';

  startGame() {
    console.log('Game started');
  }
  /**
   * Rules:
   *  Birth:    An empty, or “dead,” cell with precisely three “live” neighbors (full cells) becomes live.
   *  Death:    A live cell with zero or one neighbors dies of isolation; a live cell with four or more neighbors dies of overcrowding.
   *  Survival: A live cell with two or three neighbors remains alive.
   */
}
