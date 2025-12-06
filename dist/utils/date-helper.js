export const DATE_RANGES = {
    today: { label: 'Today', offset: 0 },
    yesterday: { label: 'Yesterday', offset: 1 },
    week: { label: 'Last 7 days', offset: 7 },
    month: { label: 'Last 30 days', offset: 30 },
    all: { label: 'All time', offset: Infinity },
};
export function getDateRangeFilter(range) {
    const offset = DATE_RANGES[range]?.offset;
    if (offset === undefined)
        return null;
    // Create today at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Calculate cutoff date at midnight
    const cutoffDate = new Date(today);
    cutoffDate.setDate(cutoffDate.getDate() - offset);
    return (timestamp) => {
        if (offset === Infinity)
            return true;
        const raceDate = new Date(timestamp);
        raceDate.setHours(0, 0, 0, 0);
        return raceDate >= cutoffDate;
    };
}
export function filterUnsolvedPuzzles(races, range) {
    const filter = getDateRangeFilter(range);
    if (!filter)
        return [];
    const puzzles = [];
    Object.values(races).forEach((race) => {
        if (filter(race.timestamp) && race.unsolved) {
            puzzles.push(...race.unsolved);
        }
    });
    // Remove duplicates
    return [...new Set(puzzles)];
}
