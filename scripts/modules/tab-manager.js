/**
 * TabManager - Handles navigation between different views
 */

const TabManager = (() => {
  let currentTab = 'history';
  const tabs = {
    history: 'History',
    export: 'Export',
    import: 'Import',
    settings: 'Settings',
  };

  function getCurrentTab() {
    return currentTab;
  }

  function setCurrentTab(tabName) {
    if (!tabs[tabName]) return;
    currentTab = tabName;
    chrome.storage?.local.set({currentTab: tabName});
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
    document.querySelectorAll('[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        setCurrentTab(tab);
      });
    });
  }

  function initialize() {
    chrome.storage?.local.get(['currentTab'], (data) => {
      if (data.currentTab && tabs[data.currentTab]) {
        currentTab = data.currentTab;
      }
      setupTabListeners();
      updateTabUI();
    });
  }

  return {getCurrentTab, setCurrentTab, getTabs, initialize};
})();
