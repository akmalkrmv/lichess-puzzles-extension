import {PuzzleId} from './common.js';

export type StormId = string;

export class Storm {
  public stormId!: StormId;
  public timestamp!: number;

  // puzzles
  public solved: PuzzleId[] = [];
  public unsolved: PuzzleId[] = [];
  public reviewed: PuzzleId[] = [];

  // stats
  public score: number = 0;
  public moves: number = 0;
  public accuracy: number = 0;
  public combo: number = 0;
  public time: number = 0;
  public timePerMove: number = 0;
  public highestSolved: number = 0;

  constructor() {
    this.timestamp = Date.now();
  }
}
