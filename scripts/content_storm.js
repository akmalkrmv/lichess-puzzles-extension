// Example href link of single race
// https://lichess.org/racer/btUJ7

(function () {
  function collectPuzzles() {
    const score = Number(document.querySelector('.storm--end__score__number')?.textContent || 0);
    const solved = [...document.querySelectorAll('.puz-history__round:has(good) a')].map((a) => a.href);
    const unsolved = [...document.querySelectorAll('.puz-history__round:has(bad) a')].map((a) => a.href);
    const reviewed = [];

    // Extract rank and total players using the helper function
    const [moves, accuracy, combo, time, timePerMove, highestSolved] = [...document.querySelectorAll('.slist td number')].map((element) => Number(element.textContent));

    if (unsolved.length === 0 && solved.length === 0) return;

    const stormId = generateRandomUIDString(); // e.g. btUJ7

    chrome.runtime.sendMessage({
      type: 'puzzle_storm_finished',
      stormId,
      timestamp: Date.now(),
      // puzzles
      solved,
      unsolved,
      reviewed,
      // stats
      score,
      moves,
      accuracy,
      combo,
      time,
      timePerMove,
      highestSolved,
    });
  }

  function generateRandomUIDString() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters[randomIndex];
    }

    return randomString;
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
