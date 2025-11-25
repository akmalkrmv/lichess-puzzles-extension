// Helper functions to generate random test data
function generateRaceStats() {
  const totalPlayers = Math.floor(Math.random() * 9) + 2; // 2-10 players
  const rank = Math.floor(Math.random() * (totalPlayers - 1)) + 1; // 1 to totalPlayers-1
  const score = Math.floor(Math.random() * 121); // 0-120
  return {score, rank, totalPlayers};
}

function generatePuzzleLinks(count) {
  const puzzles = [];
  for (let i = 0; i < count; i++) {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    puzzles.push(`https://lichess.org/training/${randomId}`);
  }
  return puzzles;
}

function generateRaceId() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function generateTestData() {
  const data = {};
  const now = Date.now();
  const timeOffsets = [
    0, // Today
    -1000 * 60 * 60 * 2, // Today, 2 hours ago
    -1000 * 60 * 60 * 4, // Today, 4 hours ago
    -1000 * 60 * 60 * 12, // Today, 12 hours ago
    -1000 * 60 * 60 * 24, // Yesterday
    -1000 * 60 * 60 * 24 * 2, // 2 days ago
    -1000 * 60 * 60 * 24 * 3, // 3 days ago
    -1000 * 60 * 60 * 24 * 4, // 4 days ago
    -1000 * 60 * 60 * 24 * 5, // 5 days ago
    -1000 * 60 * 60 * 24 * 6, // 6 days ago
    -1000 * 60 * 60 * 24 * 7, // 1 week ago
    -1000 * 60 * 60 * 24 * 8, // 8 days ago
    -1000 * 60 * 60 * 24 * 9, // 9 days ago
    -1000 * 60 * 60 * 24 * 10, // 10 days ago
    -1000 * 60 * 60 * 24 * 11, // 11 days ago
    -1000 * 60 * 60 * 24 * 14, // 2 weeks ago
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
