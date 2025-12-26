/**
 * ExportManager - Handles exporting puzzle data
 */

const ExportManager = (() => {
  const PUZZLE_TRAINING = 'https://lichess.org/training';

  function filterUnsolvedPuzzles(races, range) {
    const filter = DateFormatter.getDateRangeFilter(range);
    if (!filter) return [];

    const puzzles = [];
    Object.values(races).forEach((race) => {
      if (filter(race.timestamp) && race.unsolved) {
        puzzles.push(...race.unsolved);
      }
    });

    // Remove duplicates
    return [...new Set(puzzles)];
  }

  function calculateStatistics(races, range) {
    const filter = DateFormatter.getDateRangeFilter(range);
    if (!filter) return null;

    let highScore = 0;
    let totalRaces = 0;
    let totalSolved = 0;
    let totalUnsolved = 0;

    Object.values(races).forEach((race) => {
      if (filter(race.timestamp)) {
        totalRaces++;
        totalSolved += race.solved?.length || 0;
        totalUnsolved += race.unsolved?.length || 0;
        if (race.score && race.score > highScore) {
          highScore = race.score;
        }
      }
    });

    return {highScore, totalRaces, totalSolved, totalUnsolved};
  }

  function prependPathIfNeeded(path, puzzleLinkOrId) {
    return puzzleLinkOrId.startsWith(path) ? puzzleLinkOrId : `${path}/${puzzleLinkOrId}`;
  }

  function buildExportContent(puzzles, stats, includeStats) {
    let content = '';

    if (includeStats && stats) {
      content += `=== STATISTICS ===\n`;
      content += `Total Races: ${stats.totalRaces}\n`;
      content += `High Score: ${stats.highScore}\n`;
      content += `Solved: ${stats.totalSolved}\n`;
      content += `Unsolved: ${stats.totalUnsolved}\n`;
      content += `\n=== UNSOLVED PUZZLES ===\n\n`;
    }

    content += puzzles.map((puzzle) => prependPathIfNeeded(PUZZLE_TRAINING, puzzle)).join('\n');

    return content;
  }

  function downloadAsFile(content, filename) {
    // const blob = new Blob([content], {type: 'text/plain'});
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = filename;
    // document.body.appendChild(a);
    // a.click();
    // document.body.removeChild(a);
    // URL.revokeObjectURL(url);

    chrome.downloads.download({
      url: URL.createObjectURL(new Blob([content], {type: 'text/plain'})),
      filename,
      saveAs: true,
    });
  }

  async function renderExport() {
    const container = document.getElementById('export-content');
    if (!container) return;

    const dateFilterButtons = Object.entries(DateFormatter.DATE_RANGES)
      .map(([key, {label}]) => `<button class="btn btn-sm" data-range="${key}">${label}</button>`)
      .join('');

    container.innerHTML = `
      <div class="export-section">
        <h3>Export Unsolved Puzzles</h3>
        
        <div class="export-group">
          <label>Select Date Range</label>
          <div class="button-group">
            ${dateFilterButtons}
          </div>
        </div>

        <div class="export-group">
          <label class="checkbox-label">
            <input type="checkbox" id="include-stats" checked>
            <span>Include statistics</span>
          </label>
        </div>

        <div class="export-actions">
          ${`<button class="btn btn-primary" id="export-btn">📥 Export to File</button>`}
          <button class="btn" id="copy-btn">📋 Copy to Clipboard</button>
        </div>

        <div class="export-preview">
          <h4>Preview</h4>
          <div id="export-preview-content" class="preview-box"></div>
        </div>
      </div>
    `;

    setupExportListeners();
  }

  function setupExportListeners() {
    let selectedRange = 'today';
    let cachedPuzzles = [];
    let cachedStats = null;

    const updatePreview = () => {
      StorageAdapter.get(['races']).then((data) => {
        const races = data.races || {};
        cachedPuzzles = filterUnsolvedPuzzles(races, selectedRange);
        cachedStats = calculateStatistics(races, selectedRange);

        const includeStats = document.getElementById('include-stats')?.checked;
        const content = buildExportContent(cachedPuzzles, cachedStats, includeStats);
        const preview = document.getElementById('export-preview-content');
        if (preview) {
          preview.textContent = content.substring(0, 500) + (content.length > 500 ? '\n...' : '');
        }
      });
    };

    // Range selection
    document.querySelectorAll('[data-range]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-range]').forEach((b) => b.classList.remove('active'));
        e.target.classList.add('active');
        selectedRange = e.target.dataset.range;
        updatePreview();
      });
    });

    // Set first button as active
    document.querySelector('[data-range="today"]')?.classList.add('active');

    // Stats checkbox
    document.getElementById('include-stats')?.addEventListener('change', updatePreview);

    // Export button
    document.getElementById('export-btn')?.addEventListener('click', () => {
      StorageAdapter.get(['races']).then((data) => {
        const races = data.races || {};
        const puzzles = filterUnsolvedPuzzles(races, selectedRange);
        const stats = calculateStatistics(races, selectedRange);
        const includeStats = document.getElementById('include-stats')?.checked;
        const content = buildExportContent(puzzles, stats, includeStats);
        const timestamp = new Date().toISOString().split('T')[0];
        downloadAsFile(content, `unsolved-puzzles-${selectedRange}-${timestamp}.txt`);
      });
    });

    // Copy button
    document.getElementById('copy-btn')?.addEventListener('click', () => {
      StorageAdapter.get(['races']).then((data) => {
        const races = data.races || {};
        const puzzles = filterUnsolvedPuzzles(races, selectedRange);
        const stats = calculateStatistics(races, selectedRange);
        const includeStats = document.getElementById('include-stats')?.checked;
        const content = buildExportContent(puzzles, stats, includeStats);
        navigator.clipboard.writeText(content).then(() => SnackbarManager.show('Copied to Clipboard'));
      });
    });

    updatePreview();
  }

  return {renderExport};
})();
