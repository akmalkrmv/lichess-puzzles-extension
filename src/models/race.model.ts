import {PuzzleId} from './common.js';

export type RaceId = string;
export type Puzzles = Pick<IRace, 'solved' | 'unsolved' | 'reviewed'>;
export type RaceStats = Pick<IRace, 'score' | 'rank' | 'totalPlayers'>;

export interface IRace {
  raceId: RaceId;
  timestamp: number;

  // stats
  score: number;
  rank: number;
  totalPlayers: number;

  // puzzles
  solved: PuzzleId[];
  unsolved: PuzzleId[];
  reviewed: PuzzleId[];
}

export class Race implements IRace {
  public timestamp: number = Date.now();

  // stats
  public score: number = 0;
  public rank: number = 0;
  public totalPlayers: number = 0;

  // puzzles
  public solved: PuzzleId[] = [];
  public unsolved: PuzzleId[] = [];
  public reviewed: PuzzleId[] = [];

  constructor(public raceId: RaceId) {}

  public setStats({score, rank, totalPlayers}: RaceStats): Race {
    this.score = score || 0;
    this.rank = rank || 0;
    this.totalPlayers = totalPlayers || 0;
    return this;
  }
  
  public setPuzzles({solved, unsolved, reviewed}: Puzzles): Race {
    this.solved = solved || [];
    this.unsolved = unsolved || [];
    this.reviewed = reviewed || [];
    return this;
  }
}
