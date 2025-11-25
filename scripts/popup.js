(async function () {
  const scrollContainer = document.documentElement;

  let scrollTimeout;
  let activeTabUrl = await getActiveTabUrl();

  async function getActiveTabUrl() {
    if (!chrome.tabs?.query) return ''; // for "Local" environment

    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    return tab?.url || '';
  }

  // Save scroll position when user scrolls
  function saveScrollPosition() {
    const scrollPosition = scrollContainer.scrollTop;
    chrome.storage?.local.set({popupScrollPosition: scrollPosition});
  }

  // Restore scroll position after rendering
  function restoreScrollPosition() {
    chrome.storage?.local.get(['popupScrollPosition'], (data) => {
      if (data.popupScrollPosition !== undefined) {
        scrollContainer.scrollTop = data.popupScrollPosition;
      }
    });
  }

  // Throttle scroll events to avoid excessive storage writes
  document.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(saveScrollPosition, 300);
  });

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

  function getRelativeDateLabel(timestamp) {
    const raceDate = new Date(timestamp);
    const today = new Date();
    
    // Reset times to compare only dates
    raceDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today - raceDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${Math.floor(diffDays)} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return raceDate.toLocaleDateString();
  }

  function groupRacesByDate(races, raceIds) {
    const grouped = {};
    
    raceIds.forEach((id) => {
      const race = races[id];
      const label = getRelativeDateLabel(race.timestamp);
      
      if (!grouped[label]) {
        grouped[label] = [];
      }
      grouped[label].push(id);
    });
    
    return grouped;
  }

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
      return;
    }

    // Group races by date
    const groupedRaces = groupRacesByDate(races, raceIds);
    const dateLabels = ['Today', 'Yesterday'];
    const otherLabels = Object.keys(groupedRaces)
      .filter(label => !dateLabels.includes(label))
      .sort((a, b) => {
        // Try to parse as numeric days/weeks
        const aMatch = a.match(/(\d+)\s+days?\s+ago/);
        const bMatch = b.match(/(\d+)\s+days?\s+ago/);
        
        if (aMatch && bMatch) {
          return parseInt(aMatch[1]) - parseInt(bMatch[1]);
        }
        
        // Fallback to string comparison
        return a.localeCompare(b);
      });
    
    const sortedLabels = [...dateLabels.filter(l => groupedRaces[l]), ...otherLabels];

    // Render each date group
    sortedLabels.forEach((dateLabel) => {
      const groupRaceIds = groupedRaces[dateLabel];
      
      // Calculate group statistics
      let totalSolved = 0;
      let totalUnsolved = 0;
      let totalReviewed = 0;
      let highScore = 0;
      
      groupRaceIds.forEach((id) => {
        const race = races[id];
        totalSolved += race.solved?.length || 0;
        totalUnsolved += race.unsolved?.length || 0;
        totalReviewed += race.reviewed?.length || 0;
        if (race.score && race.score > highScore) {
          highScore = race.score;
        }
      });
      
      // Create date group heading with statistics
      const dateHeading = document.createElement('h3');
      dateHeading.classList.add('date-group-header');
      
      const labelSpan = document.createElement('span');
      labelSpan.classList.add('date-group-label');
      labelSpan.textContent = `${dateLabel} (${groupRaceIds.length} races)`;
      
      const statsSpan = document.createElement('span');
      statsSpan.classList.add('date-group-stats');
      const statsText = [
        `${totalSolved} solved`,
        `${totalUnsolved} unsolved`,
        `${totalReviewed} reviewed`,
        highScore ? `High: ${highScore}` : ''
      ].filter(Boolean).join(' • ');
      statsSpan.textContent = statsText;
      
      dateHeading.appendChild(labelSpan);
      dateHeading.appendChild(statsSpan);
      fragment.appendChild(dateHeading);

      // Render races for this date
      groupRaceIds.forEach((id) => {
        const race = races[id];
        const dateTime = new Date(race.timestamp).toLocaleString();

        const details = document.createElement('details');
        details.dataset.raceId = id;

        // Restore open/closed state
        if (openRaces[id]) {
          details.open = true;
        }

        const scoreText = race.score !== undefined ? `Score: ${race.score}` : '';
        const rankText = race.rank ? `Rank: ${race.rank}/${race.totalPlayers || '?'}` : '';
        const statsText = [scoreText, rankText].filter(Boolean).join(' • ');

        details.innerHTML = `
          <summary>
            <div class="summary-row">
              <div class="summary-row-title">
                  <span>Race: <a target="_blank" href="https://lichess.org/racer/${id}">#${id}</a></span>
                  <span class="summary-row-time">${dateTime}</span>
                  ${statsText ? `<span class="summary-row-stats">${statsText}</span>` : ''}
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
    });

    container.innerHTML = '';
    container.appendChild(fragment);

    // Restore scroll position after rendering
    restoreScrollPosition();
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
