/**
 * RaceOrganizer - Groups races by date and calculates statistics
 */

const RaceOrganizer = (() => {
  function groupByDate(races, raceIds) {
    const grouped = {};

    raceIds.forEach((id) => {
      const race = races[id];
      const label = DateFormatter.getRelativeDateLabel(race.timestamp);

      if (!grouped[label]) {
        grouped[label] = [];
      }
      grouped[label].push(id);
    });

    return grouped;
  }

  function calculateGroupStats(races, groupRaceIds) {
    let totalSolved = 0;
    let totalUnsolved = 0;
    let totalReviewed = 0;
    let highScore = 0;
    let highRank = Infinity;
    let totalScore = 0; // For average score
    let totalRank = 0; // For average rank
    let validScores = 0; // Count of races with valid scores
    let validRanks = 0; // Count of races with valid ranks

    groupRaceIds.forEach((id) => {
      const race = races[id];

      // Total counts for solved, unsolved, and reviewed
      totalSolved += race.solved?.length || 0;
      totalUnsolved += race.unsolved?.length || 0;
      totalReviewed += race.reviewed?.length || 0;

      // Calculate high score
      if (race.score && race.score > highScore) {
        highScore = race.score;
      }

      // Calculate high rank (lower rank is better, so we check for the smallest rank)
      if (race.rank && race.rank < highRank) {
        highRank = race.rank;
      }

      // Sum for average score and rank
      if (race.score) {
        totalScore += race.score;
        validScores++;
      }

      if (race.rank) {
        totalRank += race.rank;
        validRanks++;
      }
    });

    // Calculate averages (avoid division by zero)
    const averageScore = validScores > 0 ? totalScore / validScores : 0;
    const averageRank = validRanks > 0 ? totalRank / validRanks : 0;

    // Round to 2 decimal places and remove trailing zeros
    const roundedAverageScore = parseFloat(averageScore.toFixed(2));
    const roundedAverageRank = parseFloat(averageRank.toFixed(2));

    return {
      totalSolved,
      totalUnsolved,
      totalReviewed,
      highScore,
      highRank: highRank === Infinity ? null : highRank, // Return null if no valid rank is found
      averageScore: roundedAverageScore,
      averageRank: roundedAverageRank,
    };
  }

  function getSortedDateLabels(groupedRaces) {
    const dateLabels = ['Today', 'Yesterday'];
    const otherLabels = Object.keys(groupedRaces)
      .filter((label) => !dateLabels.includes(label))
      .sort((a, b) => {
        const aMatch = a.match(/(\d+)\s+days?\s+ago/);
        const bMatch = b.match(/(\d+)\s+days?\s+ago/);

        if (aMatch && bMatch) {
          return parseInt(aMatch[1]) - parseInt(bMatch[1]);
        }

        return a.localeCompare(b);
      });

    return [...dateLabels.filter((l) => groupedRaces[l]), ...otherLabels];
  }

  return {groupByDate, calculateGroupStats, getSortedDateLabels};
})();
