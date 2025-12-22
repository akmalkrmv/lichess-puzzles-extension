import {IRace, RaceId, PuzzleId, Puzzles} from '../models/index.js';
import {DataManager, DateRange} from './base/index.js';

// ============================================================================
// Types
// ============================================================================

export type {DateRange};
export {type DateRangeConfig, type GroupedItems as GroupedRaces, type DailyStats} from './base/index.js';

export interface GroupStats {
  timestamp: number;
  count: number;
  totalSolved: number;
  totalUnsolved: number;
  totalReviewed: number;
  highScore: number;
  highRank: number | null;
  averageScore: number;
  averageRank: number;
  averageSolves: number;
  averageFails: number;
}

export interface ExportStats {
  highScore: number;
  totalRaces: number;
  totalSolved: number;
  totalUnsolved: number;
}

// ============================================================================
// RacesManager - Race-specific data manipulation & querying service
// ============================================================================

export class RacesManager {
  protected static readonly DATE_RANGES = {
    [DateRange.TODAY]: {label: 'Today', offset: 0},
    [DateRange.YESTERDAY]: {label: 'Yesterday', offset: 1},
    [DateRange.WEEK]: {label: 'Last 7 days', offset: 7},
    [DateRange.MONTH]: {label: 'Last 30 days', offset: 30},
    [DateRange.ALL]: {label: 'All time', offset: Infinity},
  };

  // ========================================================================
  // Inherited Methods from DataManager
  // ========================================================================
  // The following methods are inherited and can be used directly:
  // - sortByTimestampDesc(races)
  // - sortByTimestampAsc(races)
  // - sortByScoreDesc(races)
  // - sortByUnsolvedDesc(races)
  // - filterByDateRange(races, range)
  // - filterWithUnsolved(races)
  // - filterWithReviewed(races)
  // - filterByMinScore(races, minScore)
  // - groupByDate(races, raceIds)
  // - getSortedDateLabels(groupedRaces)
  // - calculateDailyStats(races)
  // - getUnsolvedPuzzles(races, range)
  // - getSolvedPuzzles(races, range)
  // - getReviewedPuzzles(races, range)
  // - findItemsContainingPuzzle(races, puzzleId)
  // - getHighPerformers(races, percentile)
  // - getUnderPerformers(races, percentile)

  // ========================================================================
  // Sorting Operations
  // ========================================================================

  /**
   * Sort races by timestamp in descending order (newest first)
   */
  static sortByTimestampDesc(races: Record<RaceId, IRace>): RaceId[] {
    return Object.keys(races).sort((a, b) => races[b].timestamp - races[a].timestamp);
  }

  /**
   * Sort races by timestamp in ascending order (oldest first)
   */
  static sortByTimestampAsc(races: Record<RaceId, IRace>): RaceId[] {
    return Object.keys(races).sort((a, b) => races[a].timestamp - races[b].timestamp);
  }

  /**
   * Sort races by score in descending order (highest first)
   */
  static sortByScoreDesc(races: Record<RaceId, IRace>): RaceId[] {
    return Object.keys(races).sort((a, b) => races[b].score - races[a].score);
  }

  /**
   * Sort races by rank in ascending order (best rank first)
   */
  static sortByRankAsc(races: Record<RaceId, IRace>): RaceId[] {
    return Object.keys(races).sort((a, b) => {
      const rankA = races[a].rank || Infinity;
      const rankB = races[b].rank || Infinity;
      return rankA - rankB;
    });
  }

  /**
   * Sort races by number of unsolved puzzles
   */
  static sortByUnsolvedDesc(races: Record<RaceId, IRace>): RaceId[] {
    return Object.keys(races).sort((a, b) => (races[b].unsolved?.length || 0) - (races[a].unsolved?.length || 0));
  }

  // ========================================================================
  // Filtering Operations
  // ========================================================================

  /**
   * Filter races by a date range
   */
  static filterByDateRange(races: Record<RaceId, IRace>, range: DateRange | string): Record<RaceId, IRace> {
    return DataManager.filterByDateRange(races, range, this.DATE_RANGES);
  }

  /**
   * Filter races that have unsolved puzzles
   */
  static filterWithUnsolved(races: Record<RaceId, IRace>): Record<RaceId, IRace> {
    return DataManager.filterWithUnsolved(races);
  }

  /**
   * Filter races that have reviewed puzzles
   */
  static filterWithReviewed(races: Record<RaceId, IRace>): Record<RaceId, IRace> {
    return DataManager.filterWithReviewed(races);
  }

  /**
   * Filter races by minimum score
   */
  static filterByMinScore(races: Record<RaceId, IRace>, minScore: number): Record<RaceId, IRace> {
    return DataManager.filterByMinScore(races, minScore);
  }

  /**
   * Filter races by maximum rank
   */
  static filterByMaxRank(races: Record<RaceId, IRace>, maxRank: number): Record<RaceId, IRace> {
    return Object.entries(races).reduce((acc, [id, race]) => {
      if (race.rank && race.rank <= maxRank) {
        acc[id] = race;
      }
      return acc;
    }, {} as Record<RaceId, IRace>);
  }

  // ========================================================================
  // Grouping Operations
  // ========================================================================

  /**
   * Group races by relative date label (Today, Yesterday, etc.)
   */
  static groupByDate(races: Record<RaceId, IRace>, raceIds: RaceId[]): Record<string, RaceId[]> {
    return DataManager.groupByDate(races, raceIds) as Record<string, RaceId[]>;
  }

  /**
   * Get sorted date labels for grouped races (Today, Yesterday, etc. in order)
   */
  static getSortedDateLabels(groupedRaces: Record<string, RaceId[]>): string[] {
    return DataManager.getSortedDateLabels(groupedRaces);
  }

  // ========================================================================
  // Statistics Operations
  // ========================================================================

  /**
   * Calculate aggregate statistics for a group of races
   */
  static calculateGroupStats(races: Record<RaceId, IRace>, raceIds: RaceId[]): GroupStats {
    let totalSolved = 0;
    let totalUnsolved = 0;
    let totalReviewed = 0;
    let highScore = 0;
    let highRank = Infinity;
    let totalScore = 0;
    let totalRank = 0;
    let validScores = 0;
    let validRanks = 0;
    let timestamp = 0;

    raceIds.forEach((id) => {
      const race = races[id];

      timestamp = race.timestamp;

      totalSolved += race.solved?.length || 0;
      totalUnsolved += race.unsolved?.length || 0;
      totalReviewed += race.reviewed?.length || 0;

      if (race.score && race.score > highScore) {
        highScore = race.score;
      }

      if (race.rank && race.rank < highRank) {
        highRank = race.rank;
      }

      if (race.score) {
        totalScore += race.score;
        validScores++;
      }

      if (race.rank) {
        totalRank += race.rank;
        validRanks++;
      }
    });

    const averageScore = this.roundToTwo(validScores > 0 ? totalScore / validScores : 0);
    const averageRank = this.roundToTwo(validRanks > 0 ? totalRank / validRanks : 0);
    const averageSolves = this.roundToTwo(raceIds.length > 0 ? totalSolved / raceIds.length : 0);
    const averageFails = this.roundToTwo(raceIds.length > 0 ? (totalUnsolved + totalReviewed) / raceIds.length : 0);

    return {
      timestamp,
      count: raceIds.length,
      totalSolved,
      totalUnsolved,
      totalReviewed,
      highScore,
      highRank: highRank === Infinity ? null : highRank,
      averageScore,
      averageRank,
      averageSolves,
      averageFails,
    };
  }

  /**
   * Calculate daily statistics from races for charting
   */
  static calculateDailyStats(races: Record<RaceId, IRace>) {
    return DataManager.calculateDailyStats(races);
  }

  /**
   * Calculate statistics for export purposes
   */
  static calculateExportStats(races: Record<RaceId, IRace>, range: DateRange | string): ExportStats {
    const filtered = this.filterByDateRange(races, range);

    let highScore = 0;
    let totalRaces = 0;
    let totalSolved = 0;
    let totalUnsolved = 0;

    Object.values(filtered).forEach((race) => {
      totalRaces++;
      totalSolved += race.solved?.length || 0;
      totalUnsolved += race.unsolved?.length || 0;
      if (race.score && race.score > highScore) {
        highScore = race.score;
      }
    });

    return {highScore, totalRaces, totalSolved, totalUnsolved};
  }

  // ========================================================================
  // Puzzle Operations
  // ========================================================================

  /**
   * Get all unsolved puzzles from races
   */
  static getUnsolvedPuzzles(races: Record<RaceId, IRace>, range?: DateRange | string): PuzzleId[] {
    return DataManager.getUnsolvedPuzzles(races, range, this.DATE_RANGES);
  }

  /**
   * Get all solved puzzles from races
   */
  static getSolvedPuzzles(races: Record<RaceId, IRace>, range?: DateRange | string): PuzzleId[] {
    return DataManager.getSolvedPuzzles(races, range, this.DATE_RANGES);
  }

  /**
   * Get all reviewed puzzles from races
   */
  static getReviewedPuzzles(races: Record<RaceId, IRace>, range?: DateRange | string): PuzzleId[] {
    return DataManager.getReviewedPuzzles(races, range, this.DATE_RANGES);
  }

  /**
   * Find which races contain a specific puzzle
   */
  static findRacesContainingPuzzle(races: Record<RaceId, IRace>, puzzleId: PuzzleId): Record<'solved' | 'unsolved' | 'reviewed', RaceId[]> {
    return DataManager.findItemsContainingPuzzle(races, puzzleId) as Record<'solved' | 'unsolved' | 'reviewed', RaceId[]>;
  }

  // ========================================================================
  // Aggregation Operations
  // ========================================================================

  /**
   * Get high performers (races above a certain percentile)
   */
  static getHighPerformers(races: Record<RaceId, IRace>, percentile: number = 75): RaceId[] {
    return DataManager.getHighPerformers(races, percentile) as RaceId[];
  }

  /**
   * Get under-performing races (races below a certain percentile)
   */
  static getUnderPerformers(races: Record<RaceId, IRace>, percentile: number = 25): RaceId[] {
    return DataManager.getUnderPerformers(races, percentile) as RaceId[];
  }

  // ========================================================================
  // Helper Methods (Private)
  // ========================================================================

  /**
   * Round a number to 2 decimal places
   */
  private static roundToTwo(num: number): number {
    return Math.round(num * 100) / 100;
  }
}
