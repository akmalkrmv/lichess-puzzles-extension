/**
 * TabManager - Handles navigation between different views
 */

const TabManager = (() => {
  let currentTab = 'history';
  const tabs = {
    history: 'History',
    storms: 'Storms',
    export: 'Export',
    import: 'Import',
    stats: 'Statistics',
    settings: 'Settings',
  };

  function getCurrentTab() {
    return currentTab;
  }

  function setCurrentTab(tabName) {
    if (!tabs[tabName]) return;
    currentTab = tabName;
    StorageAdapter.set({currentTab: tabName});
    updateTabUI();
  }

  function getTabs() {
    return tabs;
  }

  function updateTabUI() {
    // Update tab buttons
    Object.keys(tabs).forEach((tab) => {
      const btn = document.querySelector(`[data-tab="${tab}"]`);
      if (btn) {
        btn.classList.toggle('active', tab === currentTab);
      }
    });

    // Update content visibility
    document.querySelectorAll('[data-tab-content]').forEach((content) => {
      content.style.display = content.dataset.tabContent === currentTab ? 'block' : 'none';
    });
  }

  function setupTabListeners() {
    // Tab listeners are now set up in popup.js to properly handle async rendering
  }

  function initialize() {
    return new Promise((resolve) => {
      StorageAdapter.get(['currentTab']).then((data) => {
        if (data.currentTab && tabs[data.currentTab]) {
          currentTab = data.currentTab;
        }
        updateTabUI();
        resolve();
      });
    });
  }

  return {getCurrentTab, setCurrentTab, getTabs, initialize};
})();
