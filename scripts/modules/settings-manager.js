/**
 * SettingsManager - Manages user preferences and settings
 */

const SettingsManager = (() => {
  const defaults = {
    theme: 'auto', // 'light', 'dark', 'auto'
    showSolvedPuzzles: true,
    showBadges: true,
  };

  function getSettings() {
    return StorageAdapter.get(['settings']).then((data) => {
      return data.settings || defaults;
    });
  }

  function saveSetting(key, value) {
    return StorageAdapter.get(['settings']).then((data) => {
      const settings = data.settings || defaults;
      settings[key] = value;
      return StorageAdapter.set({settings}).then(() => {
        applySettings(settings);
        return settings;
      });
    });
  }

  function applySettings(settings) {
    // Apply theme
    const html = document.documentElement;
    
    // Set colorScheme property
    if (settings.theme === 'light') {
      html.style.colorScheme = 'light';
    } else if (settings.theme === 'dark') {
      html.style.colorScheme = 'dark';
    } else {
      html.style.colorScheme = '';
    }
    
    // Also set data attribute for CSS selectors
    html.dataset.theme = settings.theme;

    // Apply visibility settings
    document.documentElement.dataset.showSolvedPuzzles = settings.showSolvedPuzzles;
    document.documentElement.dataset.showBadges = settings.showBadges;
  }

  async function renderSettings() {
    const container = document.getElementById('settings-content');
    if (!container) return;

    const settings = await getSettings();

    container.innerHTML = `
      <div class="settings-section">
        <h3>Appearance</h3>
        
        <div class="settings-group">
          <label>Theme</label>
          <div class="theme-options">
            <label class="radio-label">
              <input type="radio" name="theme" value="auto" ${settings.theme === 'auto' ? 'checked' : ''}>
              <span>Auto (System)</span>
            </label>
            <label class="radio-label">
              <input type="radio" name="theme" value="light" ${settings.theme === 'light' ? 'checked' : ''}>
              <span>Light</span>
            </label>
            <label class="radio-label">
              <input type="radio" name="theme" value="dark" ${settings.theme === 'dark' ? 'checked' : ''}>
              <span>Dark</span>
            </label>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3>Display</h3>
        
        <div class="settings-group">
          <label class="checkbox-label">
            <input type="checkbox" id="show-solved" ${settings.showSolvedPuzzles ? 'checked' : ''}>
            <span>Show solved puzzles</span>
          </label>
        </div>

        <div class="settings-group">
          <label class="checkbox-label">
            <input type="checkbox" id="show-badges" ${settings.showBadges ? 'checked' : ''}>
            <span>Show puzzle count badges</span>
          </label>
        </div>
      </div>

      <div class="settings-section">
        <h3>Data</h3>
        <p class="help-text">Manage your puzzle data</p>
        <button class="btn btn-danger" id="clear-all-data">Clear All Data</button>
      </div>
    `;

    setupSettingsListeners(settings);
  }

  function setupSettingsListeners(settings) {
    // Theme radio buttons
    document.querySelectorAll('input[name="theme"]').forEach((radio) => {
      radio.addEventListener('change', (e) => {
        // Apply theme immediately for instant visual feedback
        const newSettings = {...settings, theme: e.target.value};
        applySettings(newSettings);
        // Then save to storage
        saveSetting('theme', e.target.value);
      });
    });

    // Show solved checkbox
    const showSolvedCheckbox = document.getElementById('show-solved');
    if (showSolvedCheckbox) {
      showSolvedCheckbox.addEventListener('change', (e) => {
        saveSetting('showSolvedPuzzles', e.target.checked);
        updateUI();
      });
    }

    // Show badges checkbox
    const showBadgesCheckbox = document.getElementById('show-badges');
    if (showBadgesCheckbox) {
      showBadgesCheckbox.addEventListener('change', (e) => {
        saveSetting('showBadges', e.target.checked);
        updateUI();
      });
    }

    // Clear data button
    const clearButton = document.getElementById('clear-all-data');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        if (confirm('Are you sure? This will delete all puzzle data.')) {
          StorageAdapter.set({races: {}, openRaces: {}}).then(() => {
            alert('All data cleared!');
            updateUI();
          });
        }
      });
    }
  }

  return {getSettings, saveSetting, applySettings, renderSettings};
})();
