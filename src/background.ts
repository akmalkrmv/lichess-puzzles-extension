import {RuntimeMessage, PuzzleRaceFinishedMessage, PuzzleStormFinishedMessage, PuzzleSolvedMessage, DebugMessage} from './messages';
import {IRace, Race, Storm} from './models';

(function () {
  // Experimenting with extension panels
  // const racerPage = 'popup.html';
  // const stormPage = 'popup.html';
  // chrome.runtime.onInstalled.addListener(() => {
  //   chrome.sidePanel.setOptions({path: racerPage});
  //   chrome.sidePanel.setPanelBehavior({openPanelOnActionClick: true});
  // });
  // chrome.tabs.onActivated.addListener(async ({tabId}) => {
  //   const {path} = await chrome.sidePanel.getOptions({tabId});
  //   // if (path === stormPage) {
  //   //   chrome.sidePanel.setOptions({path: racerPage});
  //   // }
  // });

  chrome.runtime.onInstalled.addListener(() => {
    replacePuzzleFullPathsWithOnlyPuzzleIds();
  });

  chrome.runtime.onMessage.addListener((message: RuntimeMessage, sender: chrome.runtime.MessageSender, _sendResponse: (response?: unknown) => void) => {
    switch (message.type) {
      case 'puzzle_race_finished':
        saveRaceInformation(message as PuzzleRaceFinishedMessage);
        break;

      case 'puzzle_storm_finished':
        saveStormInformation(message as PuzzleStormFinishedMessage);
        break;

      case 'puzzle_solved_single':
        updatePuzzleStateToReviewed(message as PuzzleSolvedMessage);
        break;

      case 'debug_script':
        debug_script(message as DebugMessage);
        break;

      case 'close_tab':
        closeTab(sender);
        break;

      default:
        break;
    }
  });

  function saveRaceInformation(message: PuzzleRaceFinishedMessage) {
    chrome.storage.local.get(['races'], (data) => {
      const races: Record<string, IRace> = (data.races as Record<string, IRace>) || {};

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

  function saveStormInformation(message: PuzzleStormFinishedMessage) {
    chrome.storage.local.get(['storms'], (data) => {
      const storms: Record<string, Storm> = (data.storms as Record<string, Storm>) || {};

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

  function updatePuzzleStateToReviewed(message: PuzzleSolvedMessage) {
    const puzzleId = message.id;

    chrome.storage.local.get(['races'], (data) => {
      const races: Record<string, Race> = (data.races as Record<string, Race>) || {};

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

  function debug_script(message: {text: string}) {
    chrome.storage.local.set({debug_content: message.text});
    return;
  }

  function closeTab(sender: chrome.runtime.MessageSender) {
    if (sender.tab && sender.tab.id) {
      chrome.tabs.remove(sender.tab.id);
    }
  }

  function replacePuzzleFullPathsWithOnlyPuzzleIds() {
    const extractLastSegment = (href: string) => href.split('/').pop()!;

    chrome.storage.local.get(['races'], (data) => {
      const races: Record<string, IRace> = (data.races as Record<string, IRace>) || {};

      for (const raceId in races) {
        const race: IRace = races[raceId];
        races[raceId] = {
          ...race,
          solved: race.solved.map(extractLastSegment),
          unsolved: race.unsolved.map(extractLastSegment),
          reviewed: race.reviewed.map(extractLastSegment),
        };
      }

      chrome.storage.local.set({races});
    });
  }
})();
