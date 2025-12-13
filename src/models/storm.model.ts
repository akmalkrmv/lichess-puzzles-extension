import {PuzzleId} from './common.js';

export type StormId = string;
export type StormPuzzles = Pick<IStorm, 'solved' | 'unsolved' | 'reviewed'>;
export type StormStats = Pick<IStorm, 'score' | 'moves' | 'accuracy' | 'combo' | 'time' | 'timePerMove' | 'highestSolved'>;

export interface IStorm {
  stormId: StormId;
  timestamp: number;

  // puzzles
  solved: PuzzleId[];
  unsolved: PuzzleId[];
  reviewed: PuzzleId[];

  // stats
  score: number;
  moves: number;
  accuracy: number;
  combo: number;
  time: number;
  timePerMove: number;
  highestSolved: number;
}

export class Storm implements IStorm {
  public timestamp: number = Date.now();

  // stats
  public score: number = 0;
  public moves: number = 0;
  public accuracy: number = 0;
  public combo: number = 0;
  public time: number = 0;
  public timePerMove: number = 0;
  public highestSolved: number = 0;

  // puzzles
  public solved: PuzzleId[] = [];
  public unsolved: PuzzleId[] = [];
  public reviewed: PuzzleId[] = [];

  constructor(public stormId: StormId) {}

  public setStats({score, moves, accuracy, combo, time, timePerMove, highestSolved}: StormStats): Storm {
    this.score = score || 0;
    this.moves = moves || 0;
    this.accuracy = accuracy || 0;
    this.combo = combo || 0;
    this.time = time || 0;
    this.timePerMove = timePerMove || 0;
    this.highestSolved = highestSolved || 0;
    return this;
  }

  public setPuzzles({solved, unsolved, reviewed}: StormPuzzles): Storm {
    this.solved = solved || [];
    this.unsolved = unsolved || [];
    this.reviewed = reviewed || [];
    return this;
  }
}
