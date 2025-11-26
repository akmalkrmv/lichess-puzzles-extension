/**
 * ImportManager - Handles importing puzzle data
 */

const ImportManager = (() => {
  async function renderImport() {
    const container = document.getElementById('import-content');
    if (!container) return;

    container.innerHTML = `
      <div class="import-section">
        <h3>Import Data</h3>
        
        <div class="import-group">
          <label>Import from File</label>
          <p class="help-text">Select a previously exported races file to restore your data.</p>
          <input type="file" id="import-file" accept=".json" style="display: none;">
          <button class="btn btn-primary" id="select-file-btn">
            📂 Choose File
          </button>
        </div>

        <div class="import-status" id="import-status" style="display: none;">
          <p id="import-message"></p>
        </div>

        <div class="import-info">
          <h4>About Import</h4>
          <ul>
            <li>Only JSON files exported from this extension are supported</li>
            <li>Imported races will be merged with existing data</li>
            <li>Duplicate races will be skipped</li>
          </ul>
        </div>
      </div>
    `;

    setupImportListeners();
  }

  function setupImportListeners() {
    const fileInput = document.getElementById('import-file');
    const selectBtn = document.getElementById('select-file-btn');
    const statusDiv = document.getElementById('import-status');
    const messageDiv = document.getElementById('import-message');

    selectBtn?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result;
          const imported = JSON.parse(content);

          if (!imported.races || typeof imported.races !== 'object') {
            throw new Error('Invalid file format');
          }

          StorageAdapter.get(['races']).then((data) => {
            const existing = data.races || {};
            let merged = {...existing};
            let newCount = 0;

            Object.entries(imported.races).forEach(([id, race]) => {
              if (!merged[id]) {
                merged[id] = race;
                newCount++;
              }
            });

            StorageAdapter.set({races: merged}).then(() => {
              statusDiv.style.display = 'block';
              messageDiv.textContent = `✅ Successfully imported ${newCount} new race(s)!`;
              messageDiv.className = 'success';
              setTimeout(() => {
                updateUI();
              }, 1000);
            });
          });
        } catch (error) {
          statusDiv.style.display = 'block';
          messageDiv.textContent = `❌ Error: ${error.message}`;
          messageDiv.className = 'error';
        }
      };
      reader.readAsText(file);
    });
  }

  return {renderImport};
})();
