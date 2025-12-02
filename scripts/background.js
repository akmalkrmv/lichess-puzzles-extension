(function () {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'puzzle_race_finished':
        saveRaceInformation(message);
        break;

      case 'puzzle_storm_finished':
        saveStormInformation(message);
        break;

      case 'puzzle_solved_single':
        updatePuzzleStateToReviewed(message);
        break;

      case 'close_tab':
        closeTab(sender);
        break;

      case 'debug_script':
        debug_script(message);
        break;

      default:
        break;
    }
  });

  function debug_script(message) {
    chrome.storage.local.set({debug_content: message.text});
    return;
  }

  function closeTab(sender) {
    if (sender.tab && sender.tab.id) {
      chrome.tabs.remove(sender.tab.id);
    }
  }

  function saveRaceInformation(message) {
    chrome.storage.local.get(['races'], (data) => {
      const races = data.races || {};

      races[message.raceId] = {
        raceId: message.raceId,
        timestamp: message.timestamp,
        // puzzles
        solved: message.solved || [],
        unsolved: message.unsolved || [],
        reviewed: message.reviewed || [],
        // stats
        score: message.score || 0,
        rank: message.rank || 0,
        totalPlayers: message.totalPlayers || 0,
      };

      chrome.storage.local.set({races});
    });
  }

  function saveStormInformation(message) {
    chrome.storage.local.get(['storms'], (data) => {
      const storms = data.storms || {};

      storms[message.stormId] = {
        stormId: message.stormId,
        timestamp: message.timestamp,

        // puzzles
        solved: message.solved || [],
        unsolved: message.unsolved || [],
        reviewed: message.reviewed || [],

        // stats
        score: message.score || 0,
        moves: message.moves || 0,
        accuracy: message.accuracy || 0,
        combo: message.combo || 0,
        time: message.time || 0,
        timePerMove: message.timePerMove || 0,
        highestSolved: message.highestSolved || 0,
      };

      chrome.storage.local.set({storms});
    });
  }

  function updatePuzzleStateToReviewed(message) {
    const puzzleId = message.id;

    chrome.storage.local.get(['races'], (data) => {
      const races = data.races || {};

      for (const raceId in races) {
        const race = races[raceId];

        // Look for the puzzle
        const puzzleIndex = race.unsolved.findIndex((url) => url.endsWith('/' + puzzleId));

        if (puzzleIndex !== -1) {
          const puzzleUrl = race.unsolved[puzzleIndex];

          race.unsolved.splice(puzzleIndex, 1); // remove from unsolved
          race.reviewed.push(puzzleUrl); // add to reviewed

          chrome.storage.local.set({races});

          return; // IMPORTANT — prevents overwriting
        }
      }
    });
  }
})();
