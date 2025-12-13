// ============================================================================
// Main popup initialization - loads all modules and starts the app
// ============================================================================

async function getActiveTabUrl() {
  if (!chrome.tabs?.query) return '';
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  return tab?.url || '';
}

function setUpVersion() {
  const manifest = chrome.runtime?.getManifest() || {version: '0.0.0'};
  const versionElement = document.getElementById('version');
  if (versionElement) {
    versionElement.textContent = manifest.version;
  }
}

async function initializeApp() {
  // Initialize settings first
  const settings = await SettingsManager.getSettings();
  SettingsManager.applySettings(settings);

  // Initialize link handler and scroll manager
  LinkHandler.setActiveTab(await getActiveTabUrl());
  LinkHandler.setup();
  ScrollManager.setupThrottledListener();

  setUpVersion();

  // Initialize tab manager and wait for it to complete
  await TabManager.initialize();

  // Setup tab change listeners (must be after TabManager.initialize)
  setupTabChangeListener();

  // Render content for current tab
  await renderCurrentTab();
}

function setupTabChangeListener() {
  // Listen for tab changes and re-render
  document.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const tabName = btn.dataset.tab;
      TabManager.setCurrentTab(tabName);
      // Wait for render to complete after tab becomes visible
      await renderCurrentTab();
    });
  });
}

async function renderCurrentTab() {
  const currentTab = TabManager.getCurrentTab();

  switch (currentTab) {
    case 'history':
      await updateUI();
      break;
    case 'storms':
      await updateStormUI();
      break;
    case 'export':
      await ExportManager.renderExport();
      break;
    case 'import':
      await ImportManager.renderImport();
      break;
    case 'stats':
      const data = await StorageAdapter.get(['races']);
      const races = data.races || {};
      await StatsManager.renderStats(races);
      break;
    case 'settings':
      await SettingsManager.renderSettings();
      break;
  }
}

async function updateUI() {
  // Only update history tab if it's active
  if (TabManager.getCurrentTab() !== 'history') return;

  const data = await StorageAdapter.get(['races', 'openRaces']);
  UIRenderer.render(data);
}

async function updateStormUI() {
  // Only update history tab if it's active
  if (TabManager.getCurrentTab() !== 'storms') return;

  const data = await StorageAdapter.get(['storms', 'openRaces']);
  UIRenderer.renderStorm(data);
}

initializeApp();
