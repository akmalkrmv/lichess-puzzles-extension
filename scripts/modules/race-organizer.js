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

    groupRaceIds.forEach((id) => {
      const race = races[id];
      totalSolved += race.solved?.length || 0;
      totalUnsolved += race.unsolved?.length || 0;
      totalReviewed += race.reviewed?.length || 0;
      if (race.score && race.score > highScore) {
        highScore = race.score;
      }
    });

    return {totalSolved, totalUnsolved, totalReviewed, highScore};
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
