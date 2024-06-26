import { Component, EventEmitter, Input, Output, Inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgStyle } from '@angular/common';
import { DefaultsService } from '../defaults.service';
import { Game } from '../defaults.service';
import { Router } from '@angular/router';

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

  @Output() boardSizeChangeEvent = new EventEmitter<number>();
  @Output() intervalChangeEvent = new EventEmitter<number>();
  @Output() toggleColorModeEvent = new EventEmitter<void>();
  @Output() startGamePlayEvent = new EventEmitter<void>();
  @Output() stopGamePlayEvent = new EventEmitter<void>();
  @Output() resetGamePlayEvent = new EventEmitter<void>();
  @Output() randomizeBoardEvent = new EventEmitter<void>();

  colorButtonHovered: boolean = false;
  gameForm: FormGroup;

  defaultBoardSize: number;
  minBoardSize: number;
  maxBoardSize: number;
  readonly boardSizeStep: number = 2;

  defaultInterval: number;
  minInterval: number;
  maxInterval: number;
  readonly intervalStep: number = 10;

  randomColor: string;

  constructor(
    @Inject(DefaultsService) private defaults: DefaultsService,
    private router: Router
  ) {
    this.defaultBoardSize = defaults.boardSize;
    this.defaultInterval = defaults.interval;
    this.minBoardSize = defaults.minBoardSize;
    this.maxBoardSize = defaults.maxBoardSize;
    this.minInterval = defaults.minInterval;
    this.maxInterval = defaults.maxInterval;

    this.gameForm = new FormGroup({
      boardSize: new FormControl(this.defaultBoardSize),
      interval: new FormControl(this.defaultInterval),
    });

    this.randomColor = this.genRanHex(6);
  }

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

  toggleActiveGame() {
    console.log(this.activeGame);
    this.activeGame = this.activeGame === Game.LIFE ? Game.RPS : Game.LIFE;
    this.router.navigate([this.activeGame]);
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
