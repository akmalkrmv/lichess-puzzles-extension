// Example href link of single puzzle
// https://lichess.org/training/Iy8iI

(function () {
  const PUZZLE_FEEDBACK_SUCCESS_SELECTOR = '.puzzle__feedback .complete';
  const PUZZLE_FEEDBACK_FAIL_SELECTOR = '.puzzle__feedback .fail';

  // Extract puzzle ID (last path segment)
  const puzzleId = location.pathname.split('/').pop(); // e.g. "Iy8iI"

  // Observe dynamic DOM
  const observer = new MutationObserver(checkIfPuzzleSolved);
  observer.observe(document.body, {childList: true, subtree: true});

  function checkIfPuzzleSolved() {
    const isPuzzleSolved = !!document.querySelector(PUZZLE_FEEDBACK_SUCCESS_SELECTOR);
    if (isPuzzleSolved) {
      chrome.runtime.sendMessage({
        type: 'puzzle_solved_single',
        id: puzzleId,
      });

      // Optional: auto-close puzzle tab after solving
      // chrome.runtime.sendMessage({ type: "close_tab" });

      observer.disconnect();
    }
  }

  // Also check once on load (in case feedback appears instantly)
  checkIfPuzzleSolved();
})();
