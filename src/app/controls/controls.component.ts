import { Component, EventEmitter, Input, Output, Inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgStyle } from '@angular/common';
import { Game } from '../defaults.service';
import { Router } from '@angular/router';

export enum Turn {
  NONE,
  RIGHT,
  AROUND,
  LEFT,
}

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [NgStyle, ReactiveFormsModule],
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.css'],
})
export class ControlsComponent {
  @Input() activeGame!: Game;
  @Input() boardSize!: number;
  @Input() interval!: number;
  @Input() colorMode?: boolean;
  @Input() currentColor?: string;
  @Input() running!: boolean;
  @Input() untouchedCellBehavior?: Turn;
  @Input() minBoardSize!: number;
  @Input() maxBoardSize!: number;
  @Input() minInterval!: number;
  @Input() maxInterval!: number;

  @Output() boardSizeChangeEvent = new EventEmitter<number>();
  @Output() intervalChangeEvent = new EventEmitter<number>();
  @Output() toggleColorModeEvent = new EventEmitter<void>();
  @Output() startGamePlayEvent = new EventEmitter<void>();
  @Output() stopGamePlayEvent = new EventEmitter<void>();
  @Output() resetGamePlayEvent = new EventEmitter<void>();
  @Output() randomizeBoardEvent = new EventEmitter<void>();
  @Output() toggleUntouchedCellBehaviorEvent = new EventEmitter<void>();

  readonly boardSizeStep: number = 2;
  readonly intervalStep: number = 10;

  colorButtonHovered: boolean = false;
  gameForm: FormGroup;

  randomColor: string;

  TURN = Turn;

  constructor(private router: Router) {
    this.gameForm = new FormGroup({
      boardSize: new FormControl(this.boardSize),
      interval: new FormControl(this.interval),
    });

    this.randomColor = this.genRanHex(6);
  }

  ngOnInit() {
    this.gameForm.get('boardSize')?.setValue(this.boardSize);
    this.gameForm.get('interval')?.setValue(this.interval);
  }

  handleFormSubmit() {
    let { boardSize, interval } = this.gameForm.value;
    if (boardSize != null && +boardSize !== this.boardSize)
      this.handleBoardSizeChange(+boardSize);
    if (interval != null && +interval !== this.interval)
      this.handleIntervalChange(+interval);
  }

  handleBoardSizeChange(size: number) {
    if (size === 0) this.boardSize = this.minBoardSize;
    this.boardSize = this.enforceValidNumber(
      size,
      this.minBoardSize,
      this.maxBoardSize,
      this.boardSizeStep
    );
    this.boardSizeChangeEvent.emit(this.boardSize);
    this.gameForm.get('boardSize')?.setValue(this.boardSize);
  }

  handleIntervalChange(interval: number) {
    if (interval === 0) this.interval = this.minInterval;
    this.interval = this.enforceValidNumber(
      interval,
      this.minInterval,
      this.maxInterval,
      this.intervalStep
    );
    this.intervalChangeEvent.emit(this.interval);
    this.gameForm.get('interval')?.setValue(this.interval);
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

  toggleActiveGame() {
    console.log(this.activeGame);
    this.activeGame = this.activeGame === Game.LIFE ? Game.RPS : Game.LIFE;
    this.router.navigate([this.activeGame]);
  }

  handleToggleUntouchedCellBehavior(event: MouseEvent) {
    event.preventDefault();
    this.toggleUntouchedCellBehaviorEvent.emit();
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

  genRanHex = (size: number) =>
    [...Array(size)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
}
