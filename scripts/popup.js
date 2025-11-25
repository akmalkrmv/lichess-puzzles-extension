// ============================================================================
// Main popup initialization - loads all modules and starts the app
// ============================================================================

async function getActiveTabUrl() {
  if (!chrome.tabs?.query) return '';
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  return tab?.url || '';
}

async function initializeApp() {
  LinkHandler.setActiveTab(await getActiveTabUrl());
  LinkHandler.setup();
  ScrollManager.setupThrottledListener();
  updateUI();
}

function updateUI() {
  if (chrome.storage?.local) {
    chrome.storage.local.get(['races', 'openRaces'], (data) => UIRenderer.render(data));
    return;
  }

  if (testData) {
    UIRenderer.render({races: testData, openRaces: {}});
    return;
  }
}

initializeApp();

