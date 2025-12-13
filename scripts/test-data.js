// Helper functions to generate random test data

function generateRandomId() {
  return Math.random().toString(36).substring(2, 7);
}

function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * max) + min;
}

function generateRaceStats() {
  const totalPlayers = generateRandomNumber(2, 9); // 2-10 players
  const rank = generateRandomNumber(1, totalPlayers - 1); // 1 to totalPlayers-1
  const score = generateRandomNumber(0, 121); // 0-120
  return {score, rank, totalPlayers};
}

function generateStormStats() {
  const score = generateRandomNumber(0, 1000); // Assuming score ranges from 0 to 1000
  const moves = generateRandomNumber(60, 73);
  const accuracy = generateRandomNumber(85, 89);
  const combo = generateRandomNumber(17, 25);
  const time = generateRandomNumber(115, 142);
  const timePerMove = generateRandomNumber(1.72, 2.05);
  const highestSolved = generateRandomNumber(1457, 1558);

  return {
    score,
    moves,
    accuracy,
    combo,
    time,
    timePerMove,
    highestSolved,
  };
}

function generatePuzzleLinks(count) {
  const puzzles = [];
  for (let i = 0; i < count; i++) {
    puzzles.push(generateRandomId());
  }
  return puzzles;
}

function generateTestData(generateStats) {
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
    const randomId = generateRandomId();
    const solvedCount = generateRandomNumber(5, 20);
    const unsolvedCount = generateRandomNumber(0, 10);
    const reviewedCount = generateRandomNumber(0, 5);

    data[randomId] = {
      reviewed: generatePuzzleLinks(reviewedCount),
      solved: generatePuzzleLinks(solvedCount),
      unsolved: generatePuzzleLinks(unsolvedCount),
      timestamp: now + offset,
      ...generateStats(),
    };
  });

  return data;
}

const testRaceData = generateTestData(generateRaceStats);
const testStormData = generateTestData(generateStormStats);
