"use strict";
(() => {
  // src/UI/selectors.ts
  var PUZZLE_FEEDBACK_SELECTOR = ".puzzle__feedback";
  var PUZZLE_FEEDBACK_SUCCESS_SELECTOR = `${PUZZLE_FEEDBACK_SELECTOR} .complete`;
  var PUZZLE_FEEDBACK_FAIL_SELECTOR = `${PUZZLE_FEEDBACK_SELECTOR} .fail`;
  var PUZZLE_FEEDBACK_NEXT_SELECTOR = `${PUZZLE_FEEDBACK_SELECTOR} .puzzle__more`;

  // src/content/content_training.ts
  (function() {
    const PUZZLE_TRAINING = "https://lichess.org/training";
    const puzzleId = location.pathname.split("/").pop();
    const observer = new MutationObserver(() => checkIfPuzzleSolved());
    observer.observe(document.body, { childList: true, subtree: true });
    const DATE_RANGES = {
      today: { label: "Today", offset: 0 },
      yesterday: { label: "Yesterday", offset: 1 },
      week: { label: "Last 7 days", offset: 7 },
      month: { label: "Last 30 days", offset: 30 },
      all: { label: "All time", offset: Infinity }
    };
    function getDateRangeFilter(range) {
      const offset = DATE_RANGES[range]?.offset;
      if (offset === void 0) return null;
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const cutoffDate = new Date(today);
      cutoffDate.setDate(cutoffDate.getDate() - offset);
      return (timestamp) => {
        if (offset === Infinity) return true;
        const raceDate = new Date(timestamp);
        raceDate.setHours(0, 0, 0, 0);
        return raceDate >= cutoffDate;
      };
    }
    function filterUnsolvedPuzzles(races, range) {
      const filter = getDateRangeFilter(range);
      if (!filter) return [];
      const puzzles = [];
      Object.values(races).forEach((race) => {
        if (filter(race.timestamp) && race.unsolved) {
          puzzles.push(...race.unsolved);
        }
      });
      return [...new Set(puzzles)];
    }
    function prependPathIfNeeded(path, puzzleLinkOrId) {
      return puzzleLinkOrId.startsWith(path) ? puzzleLinkOrId : `${path}/${puzzleLinkOrId}`;
    }
    function appendNextUnsolvedLink(container, puzzleLink, count) {
      if (!container) return;
      if (!puzzleLink) return;
      const link = document.createElement("a");
      link.href = prependPathIfNeeded(PUZZLE_TRAINING, puzzleLink);
      link.textContent = `Next Unsolved (${count})`;
      container.appendChild(link);
    }
    function checkIfPuzzleSolved() {
      const isPuzzleSolved = document.querySelector(PUZZLE_FEEDBACK_SUCCESS_SELECTOR);
      if (!isPuzzleSolved) return;
      chrome.runtime.sendMessage({ type: "puzzle_solved_single" /* puzzle_solved_single */, id: puzzleId });
      const nextPuzzleContainer = document.querySelector(PUZZLE_FEEDBACK_NEXT_SELECTOR);
      if (!nextPuzzleContainer) {
        return;
      }
      chrome.storage.local.get(["races"], (data) => {
        const races = data.races || {};
        const unsolvedPuzzles = filterUnsolvedPuzzles(races, "today").map((link) => link.split("/").pop()).filter((id) => id !== puzzleId);
        if (!unsolvedPuzzles?.length) return;
        const remaining = unsolvedPuzzles.length;
        const nextUnsolvedPuzzleLink = unsolvedPuzzles.pop();
        appendNextUnsolvedLink(nextPuzzleContainer, nextUnsolvedPuzzleLink, remaining);
      });
      observer.disconnect();
      return;
    }
    checkIfPuzzleSolved();
  })();
})();
//# sourceMappingURL=content_training.js.map
