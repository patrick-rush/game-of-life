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
}
