// Example href link of single puzzle
// https://lichess.org/training/Iy8iI

import {MessageTypes} from '../messages';
import {Race, PuzzleId} from '../models';
import {PUZZLE_FEEDBACK_SUCCESS_SELECTOR, PUZZLE_FEEDBACK_NEXT_SELECTOR} from '../UI/selectors';

type RacesRecord = Record<string, Race>;
type PuzzleLink = string | undefined;

(function () {
  const PUZZLE_TRAINING = 'https://lichess.org/training';

  // Extract puzzle ID (last path segment)
  const puzzleId: PuzzleId | undefined = location.pathname.split('/').pop(); // e.g. "Iy8iI"

  // Observe dynamic DOM
  const observer = new MutationObserver(() => checkIfPuzzleSolved());
  observer.observe(document.body, {childList: true, subtree: true});

  const DATE_RANGES = {
    today: {label: 'Today', offset: 0},
    yesterday: {label: 'Yesterday', offset: 1},
    week: {label: 'Last 7 days', offset: 7},
    month: {label: 'Last 30 days', offset: 30},
    all: {label: 'All time', offset: Infinity},
  } as const;

  type DateRange = keyof typeof DATE_RANGES;

  function getDateRangeFilter(range: DateRange) {
    const offset = DATE_RANGES[range]?.offset;
    if (offset === undefined) return null;

    // Create today at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate cutoff date at midnight
    const cutoffDate = new Date(today);
    cutoffDate.setDate(cutoffDate.getDate() - offset);

    return (timestamp: number) => {
      if (offset === Infinity) return true;
      const raceDate = new Date(timestamp);
      raceDate.setHours(0, 0, 0, 0);
      return raceDate >= cutoffDate;
    };
  }

  function filterUnsolvedPuzzles(races: RacesRecord, range: DateRange) {
    const filter = getDateRangeFilter(range);
    if (!filter) return [];

    const puzzles: string[] = [];
    Object.values(races).forEach((race) => {
      if (filter(race.timestamp) && race.unsolved) {
        puzzles.push(...race.unsolved);
      }
    });

    // Remove duplicates
    return [...new Set(puzzles)];
  }

  function prependPathIfNeeded(path: string, puzzleLinkOrId: string) {
    return puzzleLinkOrId.startsWith(path) ? puzzleLinkOrId : `${path}/${puzzleLinkOrId}`;
  }

  function appendNextUnsolvedLink(container: Element, puzzleLink: PuzzleLink, count: number) {
    if (!container) return;
    if (!puzzleLink) return;

    const link: HTMLAnchorElement = document.createElement('a');
    link.href = prependPathIfNeeded(PUZZLE_TRAINING, puzzleLink);
    link.textContent = `Next Unsolved (${count})`;
    container.appendChild(link);
  }

  function checkIfPuzzleSolved() {
    const isPuzzleSolved = document.querySelector(PUZZLE_FEEDBACK_SUCCESS_SELECTOR);
    if (!isPuzzleSolved) return;

    chrome.runtime.sendMessage({type: MessageTypes.puzzle_solved_single, id: puzzleId});

    // Optional: auto-close puzzle tab after solving
    // chrome.runtime.sendMessage({ type: "close_tab" });

    const nextPuzzleContainer = document.querySelector(PUZZLE_FEEDBACK_NEXT_SELECTOR);
    if (!nextPuzzleContainer) {
      return;
    }

    // TODO: Use repository to get unsolved puzzles
    chrome.storage.local.get(['races'], (data) => {
      const races: RacesRecord = (data.races as RacesRecord) || {};
      const unsolvedPuzzles: PuzzleLink[] = filterUnsolvedPuzzles(races, 'today')
        .map((link: string) => link.split('/').pop())
        .filter((id: PuzzleLink) => id !== puzzleId);

      if (!unsolvedPuzzles?.length) return;

      const remaining: number = unsolvedPuzzles.length;
      const nextUnsolvedPuzzleLink: PuzzleLink = unsolvedPuzzles.pop();

      appendNextUnsolvedLink(nextPuzzleContainer, nextUnsolvedPuzzleLink, remaining);
    });

    observer.disconnect();

    return;
  }

  // Also check once on load (in case feedback appears instantly)
  checkIfPuzzleSolved();
})();
