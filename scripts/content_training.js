// Example href link of single puzzle
// https://lichess.org/training/Iy8iI

(function () {
  const PUZZLE_FEEDBACK_SUCCESS_SELECTOR = '.puzzle__feedback .complete';
  const PUZZLE_FEEDBACK_FAIL_SELECTOR = '.puzzle__feedback .fail';
  const PUZZLE_FEEDBACK_NEXT_SELECTOR = '.puzzle__feedback .puzzle__more';

  // Extract puzzle ID (last path segment)
  const puzzleId = location.pathname.split('/').pop(); // e.g. "Iy8iI"

  // Observe dynamic DOM
  const observer = new MutationObserver(() => checkIfPuzzleSolved());
  observer.observe(document.body, {childList: true, subtree: true});

  function filterUnsolvedPuzzles(races, range) {
    const filter = DateFormatter.getDateRangeFilter(range);
    if (!filter) return [];

    const puzzles = [];
    Object.values(races).forEach((race) => {
      if (filter(race.timestamp) && race.unsolved) {
        puzzles.push(...race.unsolved);
      }
    });

    // Remove duplicates
    return [...new Set(puzzles)];
  }

  function appendNextUnsolvedLink(container, puzzleLink, count) {
    const link = document.createElement('a');
    link.href = puzzleLink;
    link.textContent = `Next Unsolved (${count})`;
    container.appendChild(link);
  }

  function checkIfPuzzleSolved() {
    const isPuzzleSolved = document.querySelector(PUZZLE_FEEDBACK_SUCCESS_SELECTOR);
    if (!isPuzzleSolved) return;

    chrome.runtime.sendMessage({type: 'puzzle_solved_single', id: puzzleId});

    // Optional: auto-close puzzle tab after solving
    // chrome.runtime.sendMessage({ type: "close_tab" });

    const nextPuzzleContainer = document.querySelector(PUZZLE_FEEDBACK_NEXT_SELECTOR);
    if (!nextPuzzleContainer) {
      return observer.disconnect();
    }

    chrome.storage.local.get(['races'], (data) => {
      const races = data.races || {};
      const unsolvedPuzzles = filterUnsolvedPuzzles(races, 'today')
        .map((link) => link.split('/').pop())
        .filter((id) => id !== puzzleId);

      if (!unsolvedPuzzles.length) return;

      const remaining = unsolvedPuzzles.length;
      const nextUnsolvedPuzzleLink = unsolvedPuzzles.pop();

      appendNextUnsolvedLink(nextPuzzleContainer, nextUnsolvedPuzzleLink, remaining);
    });

    observer.disconnect();
  }

  // Also check once on load (in case feedback appears instantly)
  checkIfPuzzleSolved();
})();
