"use strict";
(() => {
  // src/models/storm.model.ts
  var Storm = class {
    constructor(stormId) {
      this.stormId = stormId;
      this.timestamp = Date.now();
      // stats
      this.score = 0;
      this.moves = 0;
      this.accuracy = 0;
      this.combo = 0;
      this.time = 0;
      this.timePerMove = 0;
      this.highestSolved = 0;
      // puzzles
      this.solved = [];
      this.unsolved = [];
      this.reviewed = [];
    }
    setStats({ score, moves, accuracy, combo, time, timePerMove, highestSolved }) {
      this.score = score || 0;
      this.moves = moves || 0;
      this.accuracy = accuracy || 0;
      this.combo = combo || 0;
      this.time = time || 0;
      this.timePerMove = timePerMove || 0;
      this.highestSolved = highestSolved || 0;
      return this;
    }
    setPuzzles({ solved, unsolved, reviewed }) {
      this.solved = solved || [];
      this.unsolved = unsolved || [];
      this.reviewed = reviewed || [];
      return this;
    }
  };

  // src/utils/random.util.ts
  function generateRandomUIDString() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters[randomIndex];
    }
    return randomString;
  }

  // src/content/content_storm.ts
  (function() {
    const SELECTORS = {
      history: ".puz-history",
      score: ".storm--end__score__number",
      stats: ".slist td number",
      solvedRounds: ".puz-history__round:has(good) a",
      unsolvedRounds: ".puz-history__round:has(bad) a"
    };
    const getText = (selector) => document.querySelector(selector)?.textContent || void 0;
    const getLinks = (selector) => [...document.querySelectorAll(selector)].map((a) => a.href);
    const extractStats = () => [...document.querySelectorAll(SELECTORS.stats)].map((el) => Number(el.textContent || 0));
    const extractLastSegment = (href) => href.split("/").pop();
    function collectPuzzles() {
      const score = Number(getText(SELECTORS.score) ?? 0);
      const solved = getLinks(SELECTORS.solvedRounds).map(extractLastSegment);
      const unsolved = getLinks(SELECTORS.unsolvedRounds).map(extractLastSegment);
      const reviewed = [];
      const [moves, accuracy, combo, time, timePerMove, highestSolved] = extractStats();
      if (unsolved.length <= 1 && solved.length === 0) return;
      const newStorm = new Storm(generateRandomUIDString());
      newStorm.setStats({ score, moves, accuracy, combo, time, timePerMove, highestSolved });
      newStorm.setPuzzles({ solved, unsolved, reviewed });
      chrome.runtime.sendMessage({
        type: "puzzle_storm_finished" /* puzzle_storm_finished */,
        ...newStorm
      });
    }
    const observer = new MutationObserver(() => {
      const history = document.querySelector(SELECTORS.history);
      if (history) {
        collectPuzzles();
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  })();
})();
//# sourceMappingURL=content_storm.js.map
