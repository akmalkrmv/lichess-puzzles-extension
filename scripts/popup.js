// ============================================================================
// Main popup initialization - loads all modules and starts the app
// ============================================================================

async function getActiveTabUrl() {
  if (!chrome.tabs?.query) return '';
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  return tab?.url || '';
}

async function initializeApp() {
  // Initialize settings first
  const settings = await SettingsManager.getSettings();
  SettingsManager.applySettings(settings);

  // Initialize link handler and scroll manager
  LinkHandler.setActiveTab(await getActiveTabUrl());
  LinkHandler.setup();
  ScrollManager.setupThrottledListener();

  // Initialize tab manager
  TabManager.initialize();

  // Render content for current tab and set up tab change listeners
  renderCurrentTab();
  setupTabChangeListener();

  updateUI();
}

function setupTabChangeListener() {
  // Listen for tab changes and re-render
  const origSetCurrentTab = TabManager.setCurrentTab;
  TabManager.setCurrentTab = function (tabName) {
    origSetCurrentTab.call(this, tabName);
    renderCurrentTab();
  };
}

function renderCurrentTab() {
  const currentTab = TabManager.getCurrentTab();

  switch (currentTab) {
    case 'history':
      updateUI();
      break;
    case 'export':
      ExportManager.renderExport();
      break;
    case 'import':
      ImportManager.renderImport();
      break;
    case 'settings':
      SettingsManager.renderSettings();
      break;
  }
}

function updateUI() {
  // Only update history tab if it's active
  if (TabManager.getCurrentTab() !== 'history') return;

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

