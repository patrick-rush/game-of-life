import { NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, Output, input } from '@angular/core';
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
  @Input({ required: true }) colorMode!: boolean;
  @Input({ required: true }) currentColor!: string;
  @Input({ required: true }) running!: boolean;

  @Output() boardSizeChangeEvent = new EventEmitter<number>();
  @Output() toggleColorModeEvent = new EventEmitter<void>();
  @Output() startGamePlayEvent = new EventEmitter<void>();
  @Output() stopGamePlayEvent = new EventEmitter<void>();
  @Output() resetGamePlayEvent = new EventEmitter<void>();
  @Output() randomizeBoardEvent = new EventEmitter<void>();

  colorButtonHovered: boolean = false;
  readonly minBoardSize: number = 20;
  readonly maxBoardSize: number = 100;

  boardSizeForm = new FormGroup({
    boardSize: new FormControl('60'),
  });

  constructor() {}

  handleBoardSizeChange() {
    const { boardSize } = this.boardSizeForm.value;
    if (!boardSize) return;
    this.boardSize = this.enforceValidNumber(+boardSize);
    this.boardSizeChangeEvent.emit(this.boardSize);
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

  enforceValidNumber(value: number): number {
    if (value > this.maxBoardSize) return this.maxBoardSize;
    if (value < this.minBoardSize) return this.minBoardSize;
    return value % 2 === 0 ? value : value + 1;
  }
}
