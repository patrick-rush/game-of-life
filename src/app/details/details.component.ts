import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [NgIf],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent {
  @Input({ required: true }) iteration: number = 0;
  @Input() livingCells?: number;
}
