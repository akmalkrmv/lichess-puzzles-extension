// Example href link of single race
// https://lichess.org/racer/btUJ7

(function () {
  function collectPuzzles() {
    const solved = [...document.querySelectorAll('.puz-history__round:has(good) a')].map((a) => a.href);
    const unsolved = [...document.querySelectorAll('.puz-history__round:has(bad) a')].map((a) => a.href);
    const reviewed = [];

    if (unsolved.length === 0 && solved.length === 0) return;

    const raceId = location.pathname.split('/').pop(); // e.g. btUJ7

    chrome.runtime.sendMessage({
      type: 'puzzle_race_finished',
      raceId,
      solved,
      unsolved,
      reviewed,
      timestamp: Date.now(),
    });
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
