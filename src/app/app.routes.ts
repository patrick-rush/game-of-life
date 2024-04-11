import { Routes } from '@angular/router';
import { LifeComponent } from './life/life.component';
import { RpsComponent } from './rps/rps.component';
import { RedirectComponent } from './redirect/redirect.component';

export const routes: Routes = [
  { path: '', redirectTo: 'game-of-life', pathMatch: 'full' },
  { path: 'life', redirectTo: 'game-of-life', pathMatch: 'full' },
  { path: 'rps', redirectTo: 'rock-paper-scissors', pathMatch: 'full' },
  { path: 'game-of-life', component: LifeComponent },
  { path: 'rock-paper-scissors', component: RpsComponent },
  { path: '**', redirectTo: 'game-of-life', pathMatch: 'full' },
  // { path: '**', component: RedirectComponent },
];
