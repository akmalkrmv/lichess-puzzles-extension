// Example href link of single race
// https://lichess.org/racer/btUJ7

import {Race} from '../models';
import {MessageTypes} from '../messages';

(function () {
  const SELECTORS = {
    history: '.puz-history',
    score: '.puz-side__solved__text',
    rank: '.race__post__rank',
    solvedRounds: '.puz-history__round:has(good) a',
    unsolvedRounds: '.puz-history__round:has(bad) a',
  } as const;

  const getText = (selector: string) => document.querySelector(selector)?.textContent || undefined;
  const getLinks = (selector: string) => [...document.querySelectorAll(selector)].map((a: Element) => (a as HTMLAnchorElement).href);
  const extractLastSegment = (href: string) => href.split('/').pop()!;

  function collectPuzzles() {
    const score: number = Number(getText(SELECTORS.score) ?? 0);
    const rankString: string | undefined = getText(SELECTORS.score);

    const solved: string[] = getLinks(SELECTORS.solvedRounds).map(extractLastSegment);
    const unsolved: string[] = getLinks(SELECTORS.unsolvedRounds).map(extractLastSegment);
    const reviewed: string[] = [];

    // Extract rank and total players using the helper function
    const {rank, totalPlayers} = extractRank(rankString);

    // Ignore probable Idle
    if (unsolved.length <= 1 && solved.length === 0) return;

    // Extract puzzle ID (last path segment): e.g. https://lichess.org/racer/btUJ7
    const raceId: string | undefined = extractLastSegment(location.pathname); // e.g. btUJ7
    if (!raceId) return;

    const newRace: Race = new Race(raceId);
    newRace.setStats({score, rank, totalPlayers});
    newRace.setPuzzles({solved, unsolved, reviewed});

    chrome.runtime.sendMessage({
      type: MessageTypes.puzzle_race_finished,
      ...newRace,
    });
  }

  // Function to extract rank and total players from the DOM
  function extractRank(rankString: string | undefined): {rank: number; totalPlayers: number} {
    let rank: number = 0;
    let totalPlayers: number = 0;

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
    const history: Element | null = document.querySelector(SELECTORS.history);
    if (history) {
      observer.disconnect();
      collectPuzzles();
    }
  });

  observer.observe(document.body, {childList: true, subtree: true});
})();
