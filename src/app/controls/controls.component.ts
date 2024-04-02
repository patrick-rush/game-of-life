import { NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [NgStyle, ReactiveFormsModule],
  templateUrl: './controls.component.html',
  styleUrl: './controls.component.css',
})
export class ControlsComponent {
  @Input({ required: true }) boardSize!: number;
  @Input({ required: true }) interval!: number;
  @Input({ required: true }) colorMode!: boolean;
  @Input({ required: true }) currentColor!: string;
  @Input({ required: true }) running!: boolean;

  @Output() boardSizeChangeEvent = new EventEmitter<number>();
  @Output() intervalChangeEvent = new EventEmitter<number>();
  @Output() toggleColorModeEvent = new EventEmitter<void>();
  @Output() startGamePlayEvent = new EventEmitter<void>();
  @Output() stopGamePlayEvent = new EventEmitter<void>();
  @Output() resetGamePlayEvent = new EventEmitter<void>();
  @Output() randomizeBoardEvent = new EventEmitter<void>();

  colorButtonHovered: boolean = false;
  readonly defaultBoardSize: number = 60;
  readonly minBoardSize: number = 20;
  readonly maxBoardSize: number = 100;
  readonly boardSizeStep: number = 2;
  readonly defaultInterval: number = 100;
  readonly minInterval: number = 10;
  readonly maxInterval: number = 200;
  readonly intervalStep: number = 10;

  gameForm = new FormGroup({
    boardSize: new FormControl(this.defaultBoardSize),
    interval: new FormControl(this.defaultInterval),
  });

  handleFormSubmit() {
    let { boardSize, interval } = this.gameForm.value;
    if (boardSize != null && +boardSize !== this.boardSize)
      this.handleBoardSizeChange(+boardSize);
    if (interval != null && +interval !== this.interval)
      this.handleIntervalChange(+interval);
  }

  handleBoardSizeChange(size: number) {
    if (size === 0) this.boardSize = this.defaultBoardSize;
    this.boardSize = this.enforceValidNumber(
      size,
      this.minBoardSize,
      this.maxBoardSize,
      this.boardSizeStep
    );
    this.boardSizeChangeEvent.emit(this.boardSize);
  }

  handleIntervalChange(interval: number) {
    if (interval === 0) this.interval = this.defaultInterval;
    this.interval = this.enforceValidNumber(
      interval,
      this.minInterval,
      this.maxInterval,
      this.intervalStep
    );
    this.intervalChangeEvent.emit(this.interval);
  }

  handleToggleColorMode() {
    this.toggleColorModeEvent.emit();
  }

  handleGamePlay() {
    if (this.running) this.stopGamePlayEvent.emit();
    else this.startGamePlayEvent.emit();
  }

  handleResetGamePlay() {
    this.resetGamePlayEvent.emit();
  }

  handleRandomizeBoard() {
    this.randomizeBoardEvent.emit();
  }

  enforceValidNumber(
    input: number,
    min: number,
    max: number,
    step: number
  ): number {
    input = Math.round(input);
    if (input > max) return max;
    if (input < min) return min;
    return input % step === 0 ? input : Math.ceil(input / step) * step;
  }
}
