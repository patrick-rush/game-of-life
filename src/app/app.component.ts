import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LifeComponent } from './life/life.component';
import { RpsComponent } from './rps/rps.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LifeComponent, RouterOutlet, RpsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'game-of-life';
}
