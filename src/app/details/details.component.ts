import { CommonModule, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

enum Turn {
  NONE,
  RIGHT,
  AROUND,
  LEFT,
}
@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent {
  @Input({ required: true }) iteration: number = 0;
  @Input() livingCells?: number;
  @Input() turnSequence?: Turn[];

  castedTurnSequence: string = '';

  ngOnInit() {
    if (this.turnSequence) {
      this.castedTurnSequence = this.turnSequence
        .map((turn) => Turn[turn].substring(0, 1))
        .join(', ');
    }
  }
}
