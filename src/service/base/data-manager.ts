import {PuzzleId} from '../../models/index.js';

// ============================================================================
// Types
// ============================================================================

export enum DateRange {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  WEEK = 'week',
  MONTH = 'month',
  ALL = 'all',
}

export interface DateRangeConfig {
  label: string;
  offset: number;
}

export interface GroupedItems {
  [dateLabel: string]: string[];
}

export interface DailyStats {
  date: string;
  timestamp: number;
  averageScore: number;
  totalItems: number;
  totalSolved: number;
  totalUnsolved: number;
}

// ============================================================================
// Generic Base Class for Data Management
// ============================================================================

/**
 * Generic data manager for handling session types (races, storms, etc.)
 * Provides common operations like sorting, filtering, grouping, and statistics
 */
export class DataManager {
  protected static readonly DATE_RANGES: Record<DateRange, DateRangeConfig> = {
    [DateRange.TODAY]: {label: 'Today', offset: 0},
    [DateRange.YESTERDAY]: {label: 'Yesterday', offset: 1},
    [DateRange.WEEK]: {label: 'Last 7 days', offset: 7},
    [DateRange.MONTH]: {label: 'Last 30 days', offset: 30},
    [DateRange.ALL]: {label: 'All time', offset: Infinity},
  };

  // ========================================================================
  // Sorting Operations
  // ========================================================================

  /**
   * Sort items by timestamp in descending order (newest first)
   */
  static sortByTimestampDesc<T extends {timestamp: number}>(items: Record<string, T>): string[] {
    return Object.keys(items).sort((a, b) => items[b].timestamp - items[a].timestamp);
  }

  /**
   * Sort items by timestamp in ascending order (oldest first)
   */
  static sortByTimestampAsc<T extends {timestamp: number}>(items: Record<string, T>): string[] {
    return Object.keys(items).sort((a, b) => items[a].timestamp - items[b].timestamp);
  }

  /**
   * Sort items by score in descending order (highest first)
   */
  static sortByScoreDesc<T extends {score: number}>(items: Record<string, T>): string[] {
    return Object.keys(items).sort((a, b) => items[b].score - items[a].score);
  }

  /**
   * Sort items by number of unsolved puzzles (highest first)
   */
  static sortByUnsolvedDesc<T extends {unsolved?: PuzzleId[]}>(items: Record<string, T>): string[] {
    return Object.keys(items).sort((a, b) => ((items[b]?.unsolved?.length || 0) - (items[a]?.unsolved?.length || 0)));
  }

  // ========================================================================
  // Filtering Operations
  // ========================================================================

  /**
   * Filter items by a date range
   */
  static filterByDateRange<T extends {timestamp: number}>(
    items: Record<string, T>,
    range: DateRange | string,
    dateRanges: Record<DateRange, DateRangeConfig>
  ): Record<string, T> {
    const rangeConfig = dateRanges[range as DateRange];
    if (!rangeConfig) return items;

    const filter = this.getDateRangeFilter(rangeConfig.offset);
    return Object.entries(items).reduce((acc, [id, item]) => {
      if (filter(item.timestamp)) {
        acc[id] = item;
      }
      return acc;
    }, {} as Record<string, T>);
  }

  /**
   * Filter items that have unsolved puzzles
   */
  static filterWithUnsolved<T extends {unsolved?: PuzzleId[]}>(items: Record<string, T>): Record<string, T> {
    return Object.entries(items).reduce((acc, [id, item]) => {
      if (item.unsolved && item.unsolved.length > 0) {
        acc[id] = item;
      }
      return acc;
    }, {} as Record<string, T>);
  }

  /**
   * Filter items that have reviewed puzzles
   */
  static filterWithReviewed<T extends {reviewed?: PuzzleId[]}>(items: Record<string, T>): Record<string, T> {
    return Object.entries(items).reduce((acc, [id, item]) => {
      if (item.reviewed && item.reviewed.length > 0) {
        acc[id] = item;
      }
      return acc;
    }, {} as Record<string, T>);
  }

  /**
   * Filter items by minimum score
   */
  static filterByMinScore<T extends {score: number}>(items: Record<string, T>, minScore: number): Record<string, T> {
    return Object.entries(items).reduce((acc, [id, item]) => {
      if (item.score >= minScore) {
        acc[id] = item;
      }
      return acc;
    }, {} as Record<string, T>);
  }

  // ========================================================================
  // Grouping Operations
  // ========================================================================

  /**
   * Group items by relative date label (Today, Yesterday, etc.)
   */
  static groupByDate<T extends {timestamp: number}>(items: Record<string, T>, itemIds: string[]): GroupedItems {
    return itemIds.reduce((acc, id) => {
      const item = items[id];
      const label = this.getRelativeDateLabel(item.timestamp);

      if (!acc[label]) {
        acc[label] = [];
      }
      acc[label].push(id);

      return acc;
    }, {} as GroupedItems);
  }

  /**
   * Get sorted date labels for grouped items (Today, Yesterday, etc. in order)
   */
  static getSortedDateLabels(groupedItems: GroupedItems): string[] {
    const dateLabels = ['Today', 'Yesterday'];
    const otherLabels = Object.keys(groupedItems)
      .filter((label) => !dateLabels.includes(label))
      .sort((a, b) => {
        const aMatch = a.match(/(\d+)\s+days?\s+ago/);
        const bMatch = b.match(/(\d+)\s+days?\s+ago/);

        if (aMatch && bMatch) {
          return parseInt(aMatch[1]) - parseInt(bMatch[1]);
        }

        return new Date(a).getTime() - new Date(b).getTime();
      });

    return [...dateLabels.filter((label) => label in groupedItems), ...otherLabels];
  }

  // ========================================================================
  // Statistics Operations - These should be overridden by subclasses
  // ========================================================================

  /**
   * Calculate daily statistics from items for charting
   */
  static calculateDailyStats<T extends {timestamp: number; score: number; solved?: PuzzleId[]; unsolved?: PuzzleId[]}>(
    items: Record<string, T>
  ): DailyStats[] {
    const dailyData: Record<
      string,
      {
        date: string;
        timestamp: number;
        scores: number[];
        totalSolved: number;
        totalUnsolved: number;
        items: number;
      }
    > = {};

    Object.values(items).forEach((item) => {
      if (!item.timestamp || typeof item.score !== 'number') {
        return;
      }

      const date = new Date(item.timestamp);
      const dateKey = date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          timestamp: item.timestamp,
          scores: [],
          totalSolved: 0,
          totalUnsolved: 0,
          items: 0,
        };
      }

      dailyData[dateKey].scores.push(item.score);
      dailyData[dateKey].totalSolved += item.solved?.length || 0;
      dailyData[dateKey].totalUnsolved += item.unsolved?.length || 0;
      dailyData[dateKey].items++;
    });

    return Object.values(dailyData)
      .map((day) => ({
        date: day.date,
        timestamp: day.timestamp,
        averageScore: Math.round(day.scores.reduce((a, b) => a + b, 0) / day.scores.length),
        totalItems: day.items,
        totalSolved: day.totalSolved,
        totalUnsolved: day.totalUnsolved,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  // ========================================================================
  // Puzzle Operations
  // ========================================================================

  /**
   * Get all unsolved puzzles from items
   */
  static getUnsolvedPuzzles<T extends {timestamp: number; unsolved?: PuzzleId[]}>(
    items: Record<string, T>,
    range?: DateRange | string,
    dateRanges?: Record<DateRange, DateRangeConfig>
  ): PuzzleId[] {
    const filtered = range && dateRanges ? this.filterByDateRange(items, range, dateRanges) : items;

    const puzzles: PuzzleId[] = [];
    Object.values(filtered).forEach((item) => {
      if (item.unsolved) {
        puzzles.push(...item.unsolved);
      }
    });

    return [...new Set(puzzles)];
  }

  /**
   * Get all solved puzzles from items
   */
  static getSolvedPuzzles<T extends {timestamp: number; solved?: PuzzleId[]}>(
    items: Record<string, T>,
    range?: DateRange | string,
    dateRanges?: Record<DateRange, DateRangeConfig>
  ): PuzzleId[] {
    const filtered = range && dateRanges ? this.filterByDateRange(items, range, dateRanges) : items;

    const puzzles: PuzzleId[] = [];
    Object.values(filtered).forEach((item) => {
      if (item.solved) {
        puzzles.push(...item.solved);
      }
    });

    return [...new Set(puzzles)];
  }

  /**
   * Get all reviewed puzzles from items
   */
  static getReviewedPuzzles<T extends {timestamp: number; reviewed?: PuzzleId[]}>(
    items: Record<string, T>,
    range?: DateRange | string,
    dateRanges?: Record<DateRange, DateRangeConfig>
  ): PuzzleId[] {
    const filtered = range && dateRanges ? this.filterByDateRange(items, range, dateRanges) : items;

    const puzzles: PuzzleId[] = [];
    Object.values(filtered).forEach((item) => {
      if (item.reviewed) {
        puzzles.push(...item.reviewed);
      }
    });

    return [...new Set(puzzles)];
  }

  /**
   * Find which items contain a specific puzzle
   */
  static findItemsContainingPuzzle<T extends {solved?: PuzzleId[]; unsolved?: PuzzleId[]; reviewed?: PuzzleId[]}>(
    items: Record<string, T>,
    puzzleId: PuzzleId
  ): Record<'solved' | 'unsolved' | 'reviewed', string[]> {
    const result: Record<'solved' | 'unsolved' | 'reviewed', string[]> = {solved: [], unsolved: [], reviewed: []};

    Object.entries(items).forEach(([id, item]) => {
      if (item.solved?.includes(puzzleId)) {
        result.solved.push(id);
      }
      if (item.unsolved?.includes(puzzleId)) {
        result.unsolved.push(id);
      }
      if (item.reviewed?.includes(puzzleId)) {
        result.reviewed.push(id);
      }
    });

    return result;
  }

  /**
   * Get high performers (items above a certain percentile)
   */
  static getHighPerformers<T extends {score: number}>(items: Record<string, T>, percentile: number = 75): string[] {
    const itemArray = Object.entries(items).map(([id, item]) => ({id, ...item}));
    if (itemArray.length === 0) return [];

    const scores = itemArray.map((i) => i.score).sort((a, b) => a - b);
    const threshold = scores[Math.floor((scores.length * percentile) / 100)];

    return itemArray.filter((i) => i.score >= threshold).map((i) => i.id);
  }

  /**
   * Get under-performing items (items below a certain percentile)
   */
  static getUnderPerformers<T extends {score: number}>(items: Record<string, T>, percentile: number = 25): string[] {
    const itemArray = Object.entries(items).map(([id, item]) => ({id, ...item}));
    if (itemArray.length === 0) return [];

    const scores = itemArray.map((i) => i.score).sort((a, b) => a - b);
    const threshold = scores[Math.floor((scores.length * percentile) / 100)];

    return itemArray.filter((i) => i.score <= threshold).map((i) => i.id);
  }

  // ========================================================================
  // Helper Methods (Protected/Private)
  // ========================================================================

  /**
   * Get relative date label for a timestamp (Today, Yesterday, 2 days ago, etc.)
   */
  protected static getRelativeDateLabel(timestamp: number): string {
    const date = new Date(timestamp);
    const today = new Date();

    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - date.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${Math.floor(diffDays)} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString();
  }

  /**
   * Create a filter function for a date range offset
   */
  protected static getDateRangeFilter(offset: number): (timestamp: number) => boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cutoffDate = new Date(today);
    cutoffDate.setDate(cutoffDate.getDate() - offset);

    return (timestamp: number) => {
      const date = new Date(timestamp);
      date.setHours(0, 0, 0, 0);
      return date.getTime() >= cutoffDate.getTime();
    };
  }

  /**
   * Round a number to 2 decimal places
   */
  protected static roundToTwo(num: number): number {
    return Math.round(num * 100) / 100;
  }
}
