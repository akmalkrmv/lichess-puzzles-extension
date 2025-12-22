import {IStorm, StormId, PuzzleId} from '../models/index.js';
import {DataManager, DateRange} from './base/index.js';

// ============================================================================
// Types
// ============================================================================

export type {DateRange};
export {type DateRangeConfig, type GroupedItems as GroupedStorms, type DailyStats} from './base/index.js';

export interface GroupStats {
  timestamp: number;
  count: number;
  totalSolved: number;
  totalUnsolved: number;
  totalReviewed: number;
  highScore: number;
  averageScore: number;
  averageAccuracy: number;
  averageMoves: number;
  averageCombo: number;
  averageTime: number;
}

export interface ExportStats {
  highScore: number;
  totalStorms: number;
  totalSolved: number;
  totalUnsolved: number;
  averageAccuracy: number;
}

// ============================================================================
// StormsManager - Storm-specific data manipulation & querying service
// ============================================================================

export class StormsManager {
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
  // - sortByTimestampDesc(storms)
  // - sortByTimestampAsc(storms)
  // - sortByScoreDesc(storms)
  // - sortByUnsolvedDesc(storms)
  // - filterByDateRange(storms, range)
  // - filterWithUnsolved(storms)
  // - filterWithReviewed(storms)
  // - filterByMinScore(storms, minScore)
  // - groupByDate(storms, stormIds)
  // - getSortedDateLabels(groupedStorms)
  // - calculateDailyStats(storms)
  // - getUnsolvedPuzzles(storms, range)
  // - getSolvedPuzzles(storms, range)
  // - getReviewedPuzzles(storms, range)
  // - findItemsContainingPuzzle(storms, puzzleId)
  // - getHighPerformers(storms, percentile)
  // - getUnderPerformers(storms, percentile)

  // ========================================================================
  // Sorting Operations
  // ========================================================================

  /**
   * Sort storms by timestamp in descending order (newest first)
   */
  static sortByTimestampDesc(storms: Record<StormId, IStorm>): StormId[] {
    return Object.keys(storms).sort((a, b) => storms[b].timestamp - storms[a].timestamp);
  }

  /**
   * Sort storms by timestamp in ascending order (oldest first)
   */
  static sortByTimestampAsc(storms: Record<StormId, IStorm>): StormId[] {
    return Object.keys(storms).sort((a, b) => storms[a].timestamp - storms[b].timestamp);
  }

  /**
   * Sort storms by score in descending order (highest first)
   */
  static sortByScoreDesc(storms: Record<StormId, IStorm>): StormId[] {
    return Object.keys(storms).sort((a, b) => storms[b].score - storms[a].score);
  }

  /**
   * Sort storms by accuracy in descending order (highest first)
   */
  static sortByAccuracyDesc(storms: Record<StormId, IStorm>): StormId[] {
    return Object.keys(storms).sort((a, b) => storms[b].accuracy - storms[a].accuracy);
  }

  /**
   * Sort storms by number of unsolved puzzles
   */
  static sortByUnsolvedDesc(storms: Record<StormId, IStorm>): StormId[] {
    return Object.keys(storms).sort((a, b) => (storms[b].unsolved?.length || 0) - (storms[a].unsolved?.length || 0));
  }

  /**
   * Sort storms by combo in descending order (highest first)
   */
  static sortByComboDesc(storms: Record<StormId, IStorm>): StormId[] {
    return Object.keys(storms).sort((a, b) => storms[b].combo - storms[a].combo);
  }

  /**
   * Sort storms by time in ascending order (shortest time first)
   */
  static sortByTimeAsc(storms: Record<StormId, IStorm>): StormId[] {
    return Object.keys(storms).sort((a, b) => storms[a].time - storms[b].time);
  }

  // ========================================================================
  // Filtering Operations
  // ========================================================================

  /**
   * Filter storms by a date range
   */
  static filterByDateRange(storms: Record<StormId, IStorm>, range: DateRange | string): Record<StormId, IStorm> {
    return DataManager.filterByDateRange(storms, range, this.DATE_RANGES);
  }

  /**
   * Filter storms that have unsolved puzzles
   */
  static filterWithUnsolved(storms: Record<StormId, IStorm>): Record<StormId, IStorm> {
    return DataManager.filterWithUnsolved(storms);
  }

  /**
   * Filter storms that have reviewed puzzles
   */
  static filterWithReviewed(storms: Record<StormId, IStorm>): Record<StormId, IStorm> {
    return DataManager.filterWithReviewed(storms);
  }

  /**
   * Filter storms by minimum score
   */
  static filterByMinScore(storms: Record<StormId, IStorm>, minScore: number): Record<StormId, IStorm> {
    return DataManager.filterByMinScore(storms, minScore);
  }

  /**
   * Filter storms by minimum accuracy
   */
  static filterByMinAccuracy(storms: Record<StormId, IStorm>, minAccuracy: number): Record<StormId, IStorm> {
    return Object.entries(storms).reduce((acc, [id, storm]) => {
      if (storm.accuracy >= minAccuracy) {
        acc[id] = storm;
      }
      return acc;
    }, {} as Record<StormId, IStorm>);
  }

  /**
   * Filter storms by minimum combo
   */
  static filterByMinCombo(storms: Record<StormId, IStorm>, minCombo: number): Record<StormId, IStorm> {
    return Object.entries(storms).reduce((acc, [id, storm]) => {
      if (storm.combo >= minCombo) {
        acc[id] = storm;
      }
      return acc;
    }, {} as Record<StormId, IStorm>);
  }

  /**
   * Filter storms by maximum time
   */
  static filterByMaxTime(storms: Record<StormId, IStorm>, maxTime: number): Record<StormId, IStorm> {
    return Object.entries(storms).reduce((acc, [id, storm]) => {
      if (storm.time <= maxTime) {
        acc[id] = storm;
      }
      return acc;
    }, {} as Record<StormId, IStorm>);
  }

  // ========================================================================
  // Grouping Operations
  // ========================================================================

  /**
   * Group storms by relative date label (Today, Yesterday, etc.)
   */
  static groupByDate(storms: Record<StormId, IStorm>, stormIds: StormId[]): Record<string, StormId[]> {
    return DataManager.groupByDate(storms, stormIds) as Record<string, StormId[]>;
  }

  /**
   * Get sorted date labels for grouped storms (Today, Yesterday, etc. in order)
   */
  static getSortedDateLabels(groupedStorms: Record<string, StormId[]>): string[] {
    return DataManager.getSortedDateLabels(groupedStorms);
  }

  // ========================================================================
  // Statistics Operations
  // ========================================================================

  /**
   * Calculate aggregate statistics for a group of storms
   */
  static calculateGroupStats(storms: Record<StormId, IStorm>, stormIds: StormId[]): GroupStats {
    let totalSolved = 0;
    let totalUnsolved = 0;
    let totalReviewed = 0;
    let highScore = 0;
    let totalScore = 0;
    let totalAccuracy = 0;
    let totalMoves = 0;
    let totalCombo = 0;
    let totalTime = 0;
    let validScores = 0;

    stormIds.forEach((id) => {
      const storm = storms[id];

      totalSolved += storm.solved?.length || 0;
      totalUnsolved += storm.unsolved?.length || 0;
      totalReviewed += storm.reviewed?.length || 0;

      if (storm.score && storm.score > highScore) {
        highScore = storm.score;
      }

      if (storm.score) {
        totalScore += storm.score;
        validScores++;
      }

      totalAccuracy += storm.accuracy || 0;
      totalMoves += storm.moves || 0;
      totalCombo += storm.combo || 0;
      totalTime += storm.time || 0;
    });

    const count = stormIds.length;
    const averageScore = this.roundToTwo(validScores > 0 ? totalScore / validScores : 0);
    const averageAccuracy = this.roundToTwo(count > 0 ? totalAccuracy / count : 0);
    const averageMoves = this.roundToTwo(count > 0 ? totalMoves / count : 0);
    const averageCombo = this.roundToTwo(count > 0 ? totalCombo / count : 0);
    const averageTime = this.roundToTwo(count > 0 ? totalTime / count : 0);

    return {
      timestamp: stormIds.length > 0 ? storms[stormIds[0]].timestamp : 0,
      count,
      totalSolved,
      totalUnsolved,
      totalReviewed,
      highScore,
      averageScore,
      averageAccuracy,
      averageMoves,
      averageCombo,
      averageTime,
    };
  }

  /**
   * Calculate daily statistics from storms for charting
   */
  static calculateDailyStats(storms: Record<StormId, IStorm>) {
    return DataManager.calculateDailyStats(storms);
  }

  /**
   * Calculate statistics for export purposes
   */
  static calculateExportStats(storms: Record<StormId, IStorm>, range: DateRange | string): ExportStats {
    const filtered = this.filterByDateRange(storms, range);

    let highScore = 0;
    let totalStorms = 0;
    let totalSolved = 0;
    let totalUnsolved = 0;
    let totalAccuracy = 0;
    let validStorms = 0;

    Object.values(filtered).forEach((storm) => {
      totalStorms++;
      totalSolved += storm.solved?.length || 0;
      totalUnsolved += storm.unsolved?.length || 0;
      if (storm.score && storm.score > highScore) {
        highScore = storm.score;
      }
      if (storm.accuracy) {
        totalAccuracy += storm.accuracy;
        validStorms++;
      }
    });

    return {
      highScore,
      totalStorms,
      totalSolved,
      totalUnsolved,
      averageAccuracy: this.roundToTwo(validStorms > 0 ? totalAccuracy / validStorms : 0),
    };
  }

  // ========================================================================
  // Puzzle Operations
  // ========================================================================

  /**
   * Get all unsolved puzzles from storms
   */
  static getUnsolvedPuzzles(storms: Record<StormId, IStorm>, range?: DateRange | string): PuzzleId[] {
    return DataManager.getUnsolvedPuzzles(storms, range, this.DATE_RANGES);
  }

  /**
   * Get all solved puzzles from storms
   */
  static getSolvedPuzzles(storms: Record<StormId, IStorm>, range?: DateRange | string): PuzzleId[] {
    return DataManager.getSolvedPuzzles(storms, range, this.DATE_RANGES);
  }

  /**
   * Get all reviewed puzzles from storms
   */
  static getReviewedPuzzles(storms: Record<StormId, IStorm>, range?: DateRange | string): PuzzleId[] {
    return DataManager.getReviewedPuzzles(storms, range, this.DATE_RANGES);
  }

  /**
   * Find which storms contain a specific puzzle
   */
  static findStormsContainingPuzzle(storms: Record<StormId, IStorm>, puzzleId: PuzzleId): Record<'solved' | 'unsolved' | 'reviewed', StormId[]> {
    return DataManager.findItemsContainingPuzzle(storms, puzzleId) as Record<'solved' | 'unsolved' | 'reviewed', StormId[]>;
  }

  // ========================================================================
  // Aggregation Operations
  // ========================================================================

  /**
   * Get summary statistics across all storms
   */
  static getSummaryStats(storms: Record<StormId, IStorm>) {
    const allStorms = Object.values(storms);
    if (allStorms.length === 0) {
      return {
        totalStorms: 0,
        totalSolved: 0,
        totalUnsolved: 0,
        totalReviewed: 0,
        averageScore: 0,
        bestScore: 0,
        averageAccuracy: 0,
        bestAccuracy: 0,
        totalMoves: 0,
        averageCombo: 0,
      };
    }

    let totalSolved = 0;
    let totalUnsolved = 0;
    let totalReviewed = 0;
    let bestScore = 0;
    let totalScore = 0;
    let totalAccuracy = 0;
    let bestAccuracy = 0;
    let totalMoves = 0;
    let totalCombo = 0;

    allStorms.forEach((storm) => {
      totalSolved += storm.solved?.length || 0;
      totalUnsolved += storm.unsolved?.length || 0;
      totalReviewed += storm.reviewed?.length || 0;
      bestScore = Math.max(bestScore, storm.score || 0);
      totalScore += storm.score || 0;
      totalAccuracy += storm.accuracy || 0;
      bestAccuracy = Math.max(bestAccuracy, storm.accuracy || 0);
      totalMoves += storm.moves || 0;
      totalCombo += storm.combo || 0;
    });

    return {
      totalStorms: allStorms.length,
      totalSolved,
      totalUnsolved,
      totalReviewed,
      averageScore: this.roundToTwo(totalScore / allStorms.length),
      bestScore,
      averageAccuracy: this.roundToTwo(totalAccuracy / allStorms.length),
      bestAccuracy,
      totalMoves,
      averageCombo: this.roundToTwo(totalCombo / allStorms.length),
    };
  }

  /**
   * Get high performers (storms above a certain percentile)
   */
  static getHighPerformers(storms: Record<StormId, IStorm>, percentile: number = 75): StormId[] {
    return DataManager.getHighPerformers(storms, percentile) as StormId[];
  }

  /**
   * Get under-performing storms (storms below a certain percentile)
   */
  static getUnderPerformers(storms: Record<StormId, IStorm>, percentile: number = 25): StormId[] {
    return DataManager.getUnderPerformers(storms, percentile) as StormId[];
  }

  /**
   * Get storms with best accuracy
   */
  static getHighestAccuracy(storms: Record<StormId, IStorm>, count: number = 5): StormId[] {
    return Object.entries(storms)
      .sort((a, b) => b[1].accuracy - a[1].accuracy)
      .slice(0, count)
      .map(([id]) => id);
  }

  /**
   * Get storms with best combo
   */
  static getHighestCombo(storms: Record<StormId, IStorm>, count: number = 5): StormId[] {
    return Object.entries(storms)
      .sort((a, b) => b[1].combo - a[1].combo)
      .slice(0, count)
      .map(([id]) => id);
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
