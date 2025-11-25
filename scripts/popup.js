(async function () {
  let activeTabUrl = await getActiveTabUrl();

  async function getActiveTabUrl() {
    if (!chrome.tabs?.query) return ''; // for "Local" environment

    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    return tab?.url || '';
  }

  // Handle link clicks by "hand", because extension cannot change active tab url directly
  document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      e.preventDefault();

      // Open in new tab
      // chrome.tabs?.create({url: e.target.href});

      // Open in active tab
      chrome.tabs?.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.update(tabs[0].id, {url: e.target.href});
      });

      // Update active tab url
      activeTabUrl = e.target.href;

      // Rerender UI
      updateUI();

      // Or you can just close the popup
      // window.close();
    }
  });

  function renderRaces(data) {
    const currentBadge = (link) => (activeTabUrl === link ? '<span id="current-badge" class="badge current-badge">current</span>' : '');
    const renderLinks = (links, type) => {
      if (!links || links.length === 0) return 'None';
      return links.map((link) => `<a class="${type}" href="${link}">${link} ${currentBadge(link)}</a>`).join('');
    };

    const container = document.getElementById('list');
    const fragment = document.createDocumentFragment();

    const races = data.races || {};
    const openRaces = data.openRaces || {};

    // Sorting by date time, latest first
    const raceIds = Object.keys(races).sort((a, b) => races[b].timestamp - races[a].timestamp);

    // Handle empty races
    if (!raceIds || raceIds.length === 0) {
      container.innerHTML = '<h4>Play <a href="https://lichess.org/racer">puzzle racer</a> to begin.</h4>';
    }

    // Render each race information
    raceIds.forEach((id) => {
      const race = races[id];
      const dateTime = new Date(race.timestamp).toLocaleString();

      const details = document.createElement('details');
      details.dataset.raceId = id;

      // Restore open/closed state
      if (openRaces[id]) {
        details.open = true;
      }

      details.innerHTML = `
        <summary>
          <div class="summary-row">
            <div class="summary-row-title">
                <span>Race: <a target="_blank" href="https://lichess.org/racer/${id}">#${id}</a></span>
                <span class="summary-row-time">${dateTime}</span>
            </div>
            <span class="badges">
              <span class="badge solved-badge">${race.solved?.length || 0}</span>
              <span class="badge unsolved-badge">${race.unsolved?.length || 0}</span>
              <span class="badge reviewed-badge">${race.reviewed?.length || 0}</span>
            </span>
          </div>
        </summary>

        <div class="links">
          <div>
            <div><strong>Unsolved</strong></div>
            ${renderLinks(race.unsolved, 'unsolved')}
          </div>

          <div>
            <div><strong>Reviewed</strong></div>
            ${renderLinks(race.reviewed, 'reviewed')}
          </div>

          <div>
            <div><strong>Solved</strong></div>
            ${renderLinks(race.solved, 'solved')}
          </div>
        </div>
    `;

      // Save state on toggle
      details.addEventListener('toggle', () => {
        chrome.storage?.local.get(['openRaces'], ({openRaces = {}}) => {
          const open = {...openRaces};

          if (details.open) {
            open[id] = true;
          } else {
            delete open[id];
          }

          chrome.storage?.local.set({openRaces: open});
        });
      });

      fragment.appendChild(details);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
  }

  function updateUI() {
    // "Production" environment
    if (chrome.storage?.local) {
      chrome.storage.local.get(['races', 'openRaces'], (data) => renderRaces(data));
      return;
    }

    // Local environment
    if (testData) {
      renderRaces({races: testData, openRaces: {}});
      return;
    }
  }

  updateUI();
})();
