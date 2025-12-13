// Example href link of storm run
// https://lichess.org/storm

import {Storm} from '../models';
import {MessageTypes} from '../messages';
import {generateRandomUIDString} from '../utils/random.util';

(function () {
  const SELECTORS = {
    history: '.puz-history',
    score: '.storm--end__score__number',
    stats: '.slist td number',
    solvedRounds: '.puz-history__round:has(good) a',
    unsolvedRounds: '.puz-history__round:has(bad) a',
  } as const;

  const getText = (selector: string) => document.querySelector(selector)?.textContent || undefined;
  const getLinks = (selector: string) => [...document.querySelectorAll(selector)].map((a: Element) => (a as HTMLAnchorElement).href);
  const extractStats = (): number[] => [...document.querySelectorAll(SELECTORS.stats)].map((el: Element) => Number(el.textContent || 0));
  const extractLastSegment = (href: string) => href.split('/').pop()!;

  function collectPuzzles() {
    const score: number = Number(getText(SELECTORS.score) ?? 0);
    const solved: string[] = getLinks(SELECTORS.solvedRounds).map(extractLastSegment);
    const unsolved: string[] = getLinks(SELECTORS.unsolvedRounds).map(extractLastSegment);
    const reviewed: string[] = [];
    const [moves, accuracy, combo, time, timePerMove, highestSolved] = extractStats();

    // Ignore probable Idle
    if (unsolved.length <= 1 && solved.length === 0) return;

    const newStorm: Storm = new Storm(generateRandomUIDString());
    newStorm.setStats({score, moves, accuracy, combo, time, timePerMove, highestSolved});
    newStorm.setPuzzles({solved, unsolved, reviewed});

    chrome.runtime.sendMessage({
      type: MessageTypes.puzzle_storm_finished,
      ...newStorm,
    });
  }

  // The history list appears when race ends.
  // Use MutationObserver so it works reliably.

  const observer = new MutationObserver(() => {
    const history: Element | null = document.querySelector(SELECTORS.history);
    if (history) {
      collectPuzzles();
      observer.disconnect();
    }
  });

  observer.observe(document.body, {childList: true, subtree: true});
})();
