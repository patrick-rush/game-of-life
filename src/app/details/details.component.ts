import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent {
  @Input({ required: true }) iteration: number = 0;
  @Input({ required: true }) livingCells: number = 0;
}
