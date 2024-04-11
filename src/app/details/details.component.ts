import { CommonModule, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

enum Turn {
  NONE,
  RIGHT,
  AROUND,
  LEFT,
}
@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, NgIf, ReactiveFormsModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent {
  @Input({ required: true }) iteration: number = 0;
  @Input() livingCells?: number;
  @Input() turnSequence?: Turn[];

  @Output() sequenceChangeEvent = new EventEmitter<Turn[]>();

  sequenceForm: FormGroup;
  castedTurnSequence: string = '';

  constructor() {
    this.sequenceForm = new FormGroup({
      sequence: new FormControl(),
    });
  }

  ngOnInit() {
    if (this.turnSequence) {
      console.log('original sequence', this.turnSequence);
      this.castedTurnSequence = this.normalizeSequence(this.turnSequence);
      this.sequenceForm.setValue({ sequence: this.castedTurnSequence });
    }
  }

  handleFormSubmit() {
    let { sequence } = this.sequenceForm.value;
    if (sequence != null) console.log(sequence);
    const newSequence = this.processSequenceInput(sequence);
    this.sequenceChangeEvent.emit(newSequence);
    this.castedTurnSequence = this.normalizeSequence(newSequence);
    // console.log(this.normalizeSequence(sequence));
  }

  normalizeSequence(sequence: Turn[]) {
    return sequence.map((turn) => Turn[turn].substring(0, 1)).join(', ');
  }

  processSequenceInput(sequence: string) {
    const pattern = new RegExp('([ARLNarln])+');
    return sequence
      .split('')
      .filter((char) => pattern.test(char))
      .map((turn) => {
        let normalized = turn.trim().toUpperCase();
        if (normalized === 'R') return Turn.RIGHT;
        if (normalized === 'L') return Turn.LEFT;
        if (normalized === 'A') return Turn.AROUND;
        return Turn.NONE;
      });
  }
}
