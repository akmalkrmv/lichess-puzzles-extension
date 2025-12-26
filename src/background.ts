import {RuntimeMessage, PuzzleRaceFinishedMessage, PuzzleStormFinishedMessage, PuzzleSolvedMessage, DebugMessage, GetRaceRunsMessage, GetStormRunsMessage} from './messages';
import {IRace, IStorm} from './models';

type SendResponseType = (response?: unknown) => void;

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
  //   if (path === stormPage) {
  //     chrome.sidePanel.setOptions({path: racerPage});
  //   }
  // });

  chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setOptions({path: 'popup.html'});
    chrome.sidePanel.setPanelBehavior({openPanelOnActionClick: true});
  });

  chrome.runtime.onInstalled.addListener(() => {
    replacePuzzleFullPathsWithOnlyPuzzleIds();
  });

  chrome.runtime.onMessage.addListener((message: RuntimeMessage, sender: chrome.runtime.MessageSender, _sendResponse: SendResponseType) => {
    switch (message.type) {
      // Race
      case 'get_race_runs':
        getRaceRuns(message as GetRaceRunsMessage, _sendResponse);
        break;
      case 'puzzle_race_finished':
        saveRaceInformation(message as PuzzleRaceFinishedMessage);
        break;

      // Storm
      case 'get_storm_runs':
        getStormRuns(message as GetStormRunsMessage, _sendResponse);
        break;
      case 'puzzle_storm_finished':
        saveStormInformation(message as PuzzleStormFinishedMessage);
        break;

      // Training
      case 'puzzle_solved_single':
        updatePuzzleStateToReviewed(message as PuzzleSolvedMessage);
        break;

      // Other
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

  function getRaceRuns(message: GetRaceRunsMessage, _sendResponse: SendResponseType) {
    chrome.storage.local.get(['races'], (data) => {
      const races: Record<string, IRace> = (data.races as Record<string, IRace>) || {};
      _sendResponse(races);
    });
  }

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

  function getStormRuns(message: GetStormRunsMessage, _sendResponse: SendResponseType) {
    chrome.storage.local.get(['storms'], (data) => {
      const storms: Record<string, IStorm> = (data.races as Record<string, IStorm>) || {};
      _sendResponse(storms);
    });
  }

  function saveStormInformation(message: PuzzleStormFinishedMessage) {
    chrome.storage.local.get(['storms'], (data) => {
      const storms: Record<string, IStorm> = (data.storms as Record<string, IStorm>) || {};

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

    chrome.storage.local.get(['races', 'storms'], (data) => {
      const races: Record<string, IRace> = (data.races as Record<string, IRace>) || {};
      const storms: Record<string, IStorm> = (data.storms as Record<string, IStorm>) || {};

      for (const raceId in races) {
        const race = races[raceId];

        // Look for the puzzle
        const puzzleIndex = race.unsolved.findIndex((url) => url.endsWith('/' + puzzleId) || url === puzzleId);

        if (puzzleIndex !== -1) {
          const puzzleUrl = race.unsolved[puzzleIndex];

          race.unsolved.splice(puzzleIndex, 1); // remove from unsolved
          race.reviewed.push(puzzleUrl); // add to reviewed

          chrome.storage.local.set({races});

          return; // IMPORTANT — prevents overwriting
        }
      }

      for (const stormId in storms) {
        const storm = storms[stormId];

        // Look for the puzzle
        const puzzleIndex = storm.unsolved.findIndex((url) => url.endsWith('/' + puzzleId) || url === puzzleId);

        if (puzzleIndex !== -1) {
          const puzzleUrl = storm.unsolved[puzzleIndex];

          storm.unsolved.splice(puzzleIndex, 1); // remove from unsolved
          storm.reviewed.push(puzzleUrl); // add to reviewed

          chrome.storage.local.set({storms});

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

    chrome.storage.local.get(['races', 'storms'], (data) => {
      const races: Record<string, IRace> = (data.races as Record<string, IRace>) || {};
      const storms: Record<string, IStorm> = (data.storms as Record<string, IStorm>) || {};

      for (const raceId in races) {
        const race: IRace = races[raceId];
        races[raceId] = {
          ...race,
          solved: race.solved.map(extractLastSegment),
          unsolved: race.unsolved.map(extractLastSegment),
          reviewed: race.reviewed.map(extractLastSegment),
        };
      }

      for (const stormId in storms) {
        const storm: IStorm = storms[stormId];
        storms[stormId] = {
          ...storm,
          solved: storm.solved.map(extractLastSegment),
          unsolved: storm.unsolved.map(extractLastSegment),
          reviewed: storm.reviewed.map(extractLastSegment),
        };
      }

      chrome.storage.local.set({races, storms, debug_content: storms.length});
    });
  }
})();
