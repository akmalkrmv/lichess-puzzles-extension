"use strict";
(() => {
  // src/models/race.model.ts
  var Race = class {
    constructor(raceId) {
      this.raceId = raceId;
      this.timestamp = Date.now();
      // stats
      this.score = 0;
      this.rank = 0;
      this.totalPlayers = 0;
      // puzzles
      this.solved = [];
      this.unsolved = [];
      this.reviewed = [];
    }
    setStats({ score, rank, totalPlayers }) {
      this.score = score || 0;
      this.rank = rank || 0;
      this.totalPlayers = totalPlayers || 0;
      return this;
    }
    setPuzzles({ solved, unsolved, reviewed }) {
      this.solved = solved || [];
      this.unsolved = unsolved || [];
      this.reviewed = reviewed || [];
      return this;
    }
  };

  // src/content/content_racer.ts
  (function() {
    const SELECTORS = {
      history: ".puz-history",
      score: ".puz-side__solved__text",
      rank: ".race__post__rank",
      solvedRounds: ".puz-history__round:has(good) a",
      unsolvedRounds: ".puz-history__round:has(bad) a"
    };
    const getText = (selector) => document.querySelector(selector)?.textContent || void 0;
    const getLinks = (selector) => [...document.querySelectorAll(selector)].map((a) => a.href);
    const extractLastSegment = (href) => href.split("/").pop();
    function collectPuzzles() {
      const score = Number(getText(SELECTORS.score) ?? 0);
      const rankString = getText(SELECTORS.score);
      const solved = getLinks(SELECTORS.solvedRounds).map(extractLastSegment);
      const unsolved = getLinks(SELECTORS.unsolvedRounds).map(extractLastSegment);
      const reviewed = [];
      const { rank, totalPlayers } = extractRank(rankString);
      if (unsolved.length <= 1 && solved.length === 0) return;
      const raceId = extractLastSegment(location.pathname);
      if (!raceId) return;
      const newRace = new Race(raceId);
      newRace.setStats({ score, rank, totalPlayers });
      newRace.setPuzzles({ solved, unsolved, reviewed });
      chrome.runtime.sendMessage({
        type: "puzzle_race_finished" /* puzzle_race_finished */,
        ...newRace
      });
    }
    function extractRank(rankString) {
      let rank = 0;
      let totalPlayers = 0;
      if (rankString) {
        const match = rankString.match(/Your rank:\s*(\d+)\/(\d+)/);
        if (match) {
          rank = Number(match[1]);
          totalPlayers = Number(match[2]);
        }
      }
      return { rank, totalPlayers };
    }
    const observer = new MutationObserver(() => {
      const history = document.querySelector(SELECTORS.history);
      if (history) {
        observer.disconnect();
        collectPuzzles();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  })();
})();
//# sourceMappingURL=content_racer.js.map
