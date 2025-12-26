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
        chrome.sidePanel.setOptions({ path: 'popup.html' });
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    });
    chrome.runtime.onInstalled.addListener(() => {
        replacePuzzleFullPathsWithOnlyPuzzleIds();
    });
    chrome.runtime.onMessage.addListener((message, sender, _sendResponse) => {
        switch (message.type) {
            // Race
            case 'get_race_runs':
                getRaceRuns(message, _sendResponse);
                break;
            case 'puzzle_race_finished':
                saveRaceInformation(message);
                break;
            // Storm
            case 'get_storm_runs':
                getStormRuns(message, _sendResponse);
                break;
            case 'puzzle_storm_finished':
                saveStormInformation(message);
                break;
            // Training
            case 'puzzle_solved_single':
                updatePuzzleStateToReviewed(message);
                break;
            // Other
            case 'debug_script':
                debug_script(message);
                break;
            case 'close_tab':
                closeTab(sender);
                break;
            default:
                break;
        }
    });
    function getRaceRuns(message, _sendResponse) {
        chrome.storage.local.get(['races'], (data) => {
            const races = data.races || {};
            _sendResponse(races);
        });
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
            chrome.storage.local.set({ races });
        });
    }
    function getStormRuns(message, _sendResponse) {
        chrome.storage.local.get(['storms'], (data) => {
            const storms = data.races || {};
            _sendResponse(storms);
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
            chrome.storage.local.set({ storms });
        });
    }
    function updatePuzzleStateToReviewed(message) {
        const puzzleId = message.id;
        chrome.storage.local.get(['races', 'storms'], (data) => {
            const races = data.races || {};
            const storms = data.storms || {};
            for (const raceId in races) {
                const race = races[raceId];
                // Look for the puzzle
                const puzzleIndex = race.unsolved.findIndex((url) => url.endsWith('/' + puzzleId) || url === puzzleId);
                if (puzzleIndex !== -1) {
                    const puzzleUrl = race.unsolved[puzzleIndex];
                    race.unsolved.splice(puzzleIndex, 1); // remove from unsolved
                    race.reviewed.push(puzzleUrl); // add to reviewed
                    chrome.storage.local.set({ races });
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
                    chrome.storage.local.set({ storms });
                    return; // IMPORTANT — prevents overwriting
                }
            }
        });
    }
    function debug_script(message) {
        chrome.storage.local.set({ debug_content: message.text });
        return;
    }
    function closeTab(sender) {
        if (sender.tab && sender.tab.id) {
            chrome.tabs.remove(sender.tab.id);
        }
    }
    function replacePuzzleFullPathsWithOnlyPuzzleIds() {
        const extractLastSegment = (href) => href.split('/').pop();
        chrome.storage.local.get(['races', 'storms'], (data) => {
            const races = data.races || {};
            const storms = data.storms || {};
            for (const raceId in races) {
                const race = races[raceId];
                races[raceId] = {
                    ...race,
                    solved: race.solved.map(extractLastSegment),
                    unsolved: race.unsolved.map(extractLastSegment),
                    reviewed: race.reviewed.map(extractLastSegment),
                };
            }
            for (const stormId in storms) {
                const storm = storms[stormId];
                storms[stormId] = {
                    ...storm,
                    solved: storm.solved.map(extractLastSegment),
                    unsolved: storm.unsolved.map(extractLastSegment),
                    reviewed: storm.reviewed.map(extractLastSegment),
                };
            }
            chrome.storage.local.set({ races, storms, debug_content: storms.length });
        });
    }
})();
export {};
