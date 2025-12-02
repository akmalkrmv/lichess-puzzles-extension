// Example href link of single race
// https://lichess.org/racer/btUJ7

(function () {
  function collectPuzzles() {
    const score = Number(document.querySelector('.puz-side__solved__text')?.textContent || 0);
    const rankString = document.querySelector('.race__post__rank')?.textContent;

    const solved = [...document.querySelectorAll('.puz-history__round:has(good) a')].map((a) => a.href);
    const unsolved = [...document.querySelectorAll('.puz-history__round:has(bad) a')].map((a) => a.href);
    const reviewed = [];

    // Extract rank and total players using the helper function
    const {rank, totalPlayers} = extractRank(rankString);

    // Ignore probable Idle
    if (unsolved.length <= 1 && solved.length === 0) return;

    const raceId = location.pathname.split('/').pop(); // e.g. btUJ7

    chrome.runtime.sendMessage({
      type: 'puzzle_race_finished',
      raceId,
      timestamp: Date.now(),
      // puzzles
      solved,
      unsolved,
      reviewed,
      // stats
      score,
      rank,
      totalPlayers,
    });
  }

  // Function to extract rank and total players from the DOM
  function extractRank(rankString) {
    let rank = 0;
    let totalPlayers = 0;

    if (rankString) {
      const match = rankString.match(/Your rank:\s*(\d+)\/(\d+)/);
      if (match) {
        rank = Number(match[1]); // Rank number
        totalPlayers = Number(match[2]); // Total players
      }
    }

    return {rank, totalPlayers};
  }

  // The history list appears when race ends.
  // Use MutationObserver so it works reliably.

  const observer = new MutationObserver(() => {
    const history = document.querySelector('.puz-history');
    if (history) {
      collectPuzzles();
      observer.disconnect();
    }
  });

  observer.observe(document.body, {childList: true, subtree: true});
})();
