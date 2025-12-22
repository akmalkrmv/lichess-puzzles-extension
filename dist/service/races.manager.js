import { DataManager, DateRange } from './base/index.js';
// ============================================================================
// RacesManager - Race-specific data manipulation & querying service
// ============================================================================
export class RacesManager {
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
    static sortByTimestampDesc(races) {
        return Object.keys(races).sort((a, b) => races[b].timestamp - races[a].timestamp);
    }
    /**
     * Sort races by timestamp in ascending order (oldest first)
     */
    static sortByTimestampAsc(races) {
        return Object.keys(races).sort((a, b) => races[a].timestamp - races[b].timestamp);
    }
    /**
     * Sort races by score in descending order (highest first)
     */
    static sortByScoreDesc(races) {
        return Object.keys(races).sort((a, b) => races[b].score - races[a].score);
    }
    /**
     * Sort races by rank in ascending order (best rank first)
     */
    static sortByRankAsc(races) {
        return Object.keys(races).sort((a, b) => {
            const rankA = races[a].rank || Infinity;
            const rankB = races[b].rank || Infinity;
            return rankA - rankB;
        });
    }
    /**
     * Sort races by number of unsolved puzzles
     */
    static sortByUnsolvedDesc(races) {
        return Object.keys(races).sort((a, b) => (races[b].unsolved?.length || 0) - (races[a].unsolved?.length || 0));
    }
    // ========================================================================
    // Filtering Operations
    // ========================================================================
    /**
     * Filter races by a date range
     */
    static filterByDateRange(races, range) {
        return DataManager.filterByDateRange(races, range, this.DATE_RANGES);
    }
    /**
     * Filter races that have unsolved puzzles
     */
    static filterWithUnsolved(races) {
        return DataManager.filterWithUnsolved(races);
    }
    /**
     * Filter races that have reviewed puzzles
     */
    static filterWithReviewed(races) {
        return DataManager.filterWithReviewed(races);
    }
    /**
     * Filter races by minimum score
     */
    static filterByMinScore(races, minScore) {
        return DataManager.filterByMinScore(races, minScore);
    }
    /**
     * Filter races by maximum rank
     */
    static filterByMaxRank(races, maxRank) {
        return Object.entries(races).reduce((acc, [id, race]) => {
            if (race.rank && race.rank <= maxRank) {
                acc[id] = race;
            }
            return acc;
        }, {});
    }
    // ========================================================================
    // Grouping Operations
    // ========================================================================
    /**
     * Group races by relative date label (Today, Yesterday, etc.)
     */
    static groupByDate(races, raceIds) {
        return DataManager.groupByDate(races, raceIds);
    }
    /**
     * Get sorted date labels for grouped races (Today, Yesterday, etc. in order)
     */
    static getSortedDateLabels(groupedRaces) {
        return DataManager.getSortedDateLabels(groupedRaces);
    }
    // ========================================================================
    // Statistics Operations
    // ========================================================================
    /**
     * Calculate aggregate statistics for a group of races
     */
    static calculateGroupStats(races, raceIds) {
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
    static calculateDailyStats(races) {
        return DataManager.calculateDailyStats(races);
    }
    /**
     * Calculate statistics for export purposes
     */
    static calculateExportStats(races, range) {
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
        return { highScore, totalRaces, totalSolved, totalUnsolved };
    }
    // ========================================================================
    // Puzzle Operations
    // ========================================================================
    /**
     * Get all unsolved puzzles from races
     */
    static getUnsolvedPuzzles(races, range) {
        return DataManager.getUnsolvedPuzzles(races, range, this.DATE_RANGES);
    }
    /**
     * Get all solved puzzles from races
     */
    static getSolvedPuzzles(races, range) {
        return DataManager.getSolvedPuzzles(races, range, this.DATE_RANGES);
    }
    /**
     * Get all reviewed puzzles from races
     */
    static getReviewedPuzzles(races, range) {
        return DataManager.getReviewedPuzzles(races, range, this.DATE_RANGES);
    }
    /**
     * Find which races contain a specific puzzle
     */
    static findRacesContainingPuzzle(races, puzzleId) {
        return DataManager.findItemsContainingPuzzle(races, puzzleId);
    }
    // ========================================================================
    // Aggregation Operations
    // ========================================================================
    /**
     * Get high performers (races above a certain percentile)
     */
    static getHighPerformers(races, percentile = 75) {
        return DataManager.getHighPerformers(races, percentile);
    }
    /**
     * Get under-performing races (races below a certain percentile)
     */
    static getUnderPerformers(races, percentile = 25) {
        return DataManager.getUnderPerformers(races, percentile);
    }
    // ========================================================================
    // Helper Methods (Private)
    // ========================================================================
    /**
     * Round a number to 2 decimal places
     */
    static roundToTwo(num) {
        return Math.round(num * 100) / 100;
    }
}
RacesManager.DATE_RANGES = {
    [DateRange.TODAY]: { label: 'Today', offset: 0 },
    [DateRange.YESTERDAY]: { label: 'Yesterday', offset: 1 },
    [DateRange.WEEK]: { label: 'Last 7 days', offset: 7 },
    [DateRange.MONTH]: { label: 'Last 30 days', offset: 30 },
    [DateRange.ALL]: { label: 'All time', offset: Infinity },
};
