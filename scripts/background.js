(function () {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'puzzle_race_finished':
        saveRaceInformation(message);
        break;

      case 'puzzle_solved_single':
        updatePuzzleStateToReviewed(message);
        break;

      case 'close_tab':
        closeTab(sender);
        break;

      default:
        break;
    }
  });

  function closeTab(sender) {
    if (sender.tab && sender.tab.id) {
      chrome.tabs.remove(sender.tab.id);
    }
  }

  function saveRaceInformation(message) {
    chrome.storage.local.get(['races'], (data) => {
      const races = data.races || {};

      races[message.raceId] = {
        timestamp: message.timestamp,
        solved: message.solved || [],
        unsolved: message.unsolved || [],
        reviewed: message.reviewed || [],
      };

      chrome.storage.local.set({races});
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
        }
      }
    });
  }
})();
