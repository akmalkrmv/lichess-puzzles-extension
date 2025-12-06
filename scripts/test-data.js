// Helper functions to generate random test data

function generateRaceId() {
  return Math.random().toString(36).substring(2, 7);
}

function generateRaceStats() {
  const totalPlayers = Math.floor(Math.random() * 9) + 2; // 2-10 players
  const rank = Math.floor(Math.random() * (totalPlayers - 1)) + 1; // 1 to totalPlayers-1
  const score = Math.floor(Math.random() * 121); // 0-120
  return {score, rank, totalPlayers};
}

function generatePuzzleLinks(count) {
  const puzzles = [];
  for (let i = 0; i < count; i++) {
    puzzles.push(generateRaceId());
  }
  return puzzles;
}

function generateTestData() {
  const data = {};
  const now = Date.now();
  const hour = 1000 * 60 * 60;
  const timeOffsets = [
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

  timeOffsets.forEach((offset) => {
    const raceId = generateRaceId();
    const solvedCount = Math.floor(Math.random() * 20) + 5;
    const unsolvedCount = Math.floor(Math.random() * 10);
    const reviewedCount = Math.floor(Math.random() * 5);

    data[raceId] = {
      reviewed: generatePuzzleLinks(reviewedCount),
      solved: generatePuzzleLinks(solvedCount),
      unsolved: generatePuzzleLinks(unsolvedCount),
      timestamp: now + offset,
      ...generateRaceStats(),
    };
  });

  return data;
}

const testData = generateTestData();
