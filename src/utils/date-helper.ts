import {Race} from '../models';

type RacesRecord = Record<string, Race>;
type PuzzleLink = string | undefined;

export const DATE_RANGES = {
  today: {label: 'Today', offset: 0},
  yesterday: {label: 'Yesterday', offset: 1},
  week: {label: 'Last 7 days', offset: 7},
  month: {label: 'Last 30 days', offset: 30},
  all: {label: 'All time', offset: Infinity},
} as const;

export type DateRange = keyof typeof DATE_RANGES;

export function getDateRangeFilter(range: DateRange) {
  const offset = DATE_RANGES[range]?.offset;
  if (offset === undefined) return null;

  // Create today at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate cutoff date at midnight
  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() - offset);

  return (timestamp: number) => {
    if (offset === Infinity) return true;
    const raceDate = new Date(timestamp);
    raceDate.setHours(0, 0, 0, 0);
    return raceDate >= cutoffDate;
  };
}

export function filterUnsolvedPuzzles(races: RacesRecord, range: DateRange): string[] {
  const filter = getDateRangeFilter(range);
  if (!filter) return [];

  const puzzles: string[] = [];
  Object.values(races).forEach((race) => {
    if (filter(race.timestamp) && race.unsolved) {
      puzzles.push(...race.unsolved);
    }
  });

  // Remove duplicates
  return [...new Set(puzzles)];
}
