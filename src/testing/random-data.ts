import {IRace, IStorm, Puzzles, Race, RaceStats, Storm, StormStats} from '../models';

export const testRaceData: Record<string, IRace> = generateRaceData();
export const testStormData: Record<string, IStorm> = generateStormData();

// Helper functions to generate random test data
function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 7);
}

function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * max) + min;
}

function generateRaceStats(): RaceStats {
  const totalPlayers: number = generateRandomNumber(2, 9); // 2-10 players
  const rank: number = generateRandomNumber(1, totalPlayers - 1); // 1 to totalPlayers-1
  const score: number = generateRandomNumber(0, 121); // 0-120

  return {score, rank, totalPlayers};
}

function generateStormStats(): StormStats {
  return {
    score: generateRandomNumber(0, 1000), // Assuming score ranges from 0 to 1000
    moves: generateRandomNumber(60, 73),
    accuracy: generateRandomNumber(85, 89),
    combo: generateRandomNumber(17, 25),
    time: generateRandomNumber(115, 142),
    timePerMove: generateRandomNumber(1.72, 2.05),
    highestSolved: generateRandomNumber(1457, 1558),
  };
}

function generatePuzzleLinks(count: number): string[] {
  const puzzles: string[] = [];
  for (let i = 0; i < count; i++) {
    puzzles.push(generateRandomId());
  }
  return puzzles;
}

function createTestTimestamps(): number[] {
  const now: number = Date.now();
  const hour: number = 1000 * 60 * 60;
  const timeOffsets: number[] = [
    0, // Today
    -hour * 2, // Today, 2 hours ago
    -hour * 4, // Today, 4 hours ago
    -hour * 12, // Today, 12 hours ago
    -hour * 24, // Yesterday
    -hour * 24 * 2, // 2 days ago
    -hour * 24 * 3, // 3 days ago
    -hour * 24 * 4, // 4 days ago
    -hour * 24 * 5, // 5 days ago
    -hour * 24 * 6, // 6 days ago
    -hour * 24 * 7, // 1 week ago
    -hour * 24 * 8, // 8 days ago
    -hour * 24 * 9, // 9 days ago
    -hour * 24 * 10, // 10 days ago
    -hour * 24 * 11, // 11 days ago
    -hour * 24 * 14, // 2 weeks ago
  ];
  return timeOffsets.map((offset) => now + offset);
}

function generatePuzzleData(): Puzzles {
  return {
    solved: generatePuzzleLinks(generateRandomNumber(5, 20)),
    unsolved: generatePuzzleLinks(generateRandomNumber(0, 10)),
    reviewed: generatePuzzleLinks(generateRandomNumber(0, 5)),
  };
}

function generateRaceData(): Record<string, IRace> {
  const data: Record<string, IRace> = {};
  const timestamps: number[] = createTestTimestamps();

  timestamps.forEach((timestamp) => {
    const randomId: string = generateRandomId();
    const race = new Race(randomId);
    race.timestamp = timestamp;
    race.setStats(generateRaceStats());
    race.setPuzzles(generatePuzzleData());
    data[randomId] = race;
  });

  return data;
}

function generateStormData(): Record<string, IStorm> {
  const data: Record<string, IStorm> = {};
  const timestamps: number[] = createTestTimestamps();

  timestamps.forEach((timestamp) => {
    const randomId: string = generateRandomId();
    const storm = new Storm(generateRandomId());
    storm.timestamp = timestamp;
    storm.setStats(generateStormStats());
    storm.setPuzzles(generatePuzzleData());
    data[randomId] = storm;
  });

  return data;
}
