import { Component, Inject, Input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LifeComponent } from './life/life.component';
import { RpsComponent } from './rps/rps.component';
import { NgIf } from '@angular/common';
import { DefaultsService, Game } from './defaults.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LifeComponent, NgIf, RouterOutlet, RpsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'game-of-life';
  activeGame: Game = Game.LIFE;
  private subscription: Subscription | null = null;

  constructor(private defaultService: DefaultsService) {}

  ngOnInit() {
    this.subscription = this.defaultService.defaultGame$.subscribe((game) => {
      this.activeGame = game;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
