// ============================================================================
// TAB & SCROLL MANAGEMENT
// ============================================================================

async function getActiveTabUrl() {
  if (!chrome.tabs?.query) return '';
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  return tab?.url || '';
}

const ScrollManager = (() => {
  const scrollContainer = document.documentElement;
  let scrollTimeout;

  function save() {
    const scrollPosition = scrollContainer.scrollTop;
    chrome.storage?.local.set({popupScrollPosition: scrollPosition});
  }

  function restore() {
    chrome.storage?.local.get(['popupScrollPosition'], (data) => {
      if (data.popupScrollPosition !== undefined) {
        scrollContainer.scrollTop = data.popupScrollPosition;
      }
    });
  }

  function setupThrottledListener() {
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(save, 300);
    });
  }

  return {save, restore, setupThrottledListener};
})();

// ============================================================================
// LINK HANDLING
// ============================================================================

const LinkHandler = (() => {
  let activeTabUrl = '';

  function setActiveTab(url) {
    activeTabUrl = url;
  }

  function getActiveTab() {
    return activeTabUrl;
  }

  function handleClick(e) {
    if (e.target.tagName !== 'A') return;

    e.preventDefault();
    chrome.tabs?.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.update(tabs[0].id, {url: e.target.href});
    });

    setActiveTab(e.target.href);
    updateUI();
  }

  function setup() {
    document.addEventListener('click', handleClick);
  }

  return {setActiveTab, getActiveTab, setup};
})();

// ============================================================================
// DATE & TIME FORMATTING
// ============================================================================

const DateFormatter = (() => {
  function getRelativeDateLabel(timestamp) {
    const raceDate = new Date(timestamp);
    const today = new Date();

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

  function formatRaceTime(timestamp) {
    const raceDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now - raceDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
    if (diffHours < 24) return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (raceDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${raceDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      const dayName = raceDate.toLocaleDateString([], {weekday: 'long'});
      return `${dayName} at ${raceDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
    }

    return raceDate.toLocaleDateString([], {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'});
  }

  return {getRelativeDateLabel, formatRaceTime};
})();

// ============================================================================
// RACE GROUPING & STATISTICS
// ============================================================================

const RaceOrganizer = (() => {
  function groupByDate(races, raceIds) {
    const grouped = {};

    raceIds.forEach((id) => {
      const race = races[id];
      const label = DateFormatter.getRelativeDateLabel(race.timestamp);

      if (!grouped[label]) {
        grouped[label] = [];
      }
      grouped[label].push(id);
    });

    return grouped;
  }

  function calculateGroupStats(races, groupRaceIds) {
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

    return {totalSolved, totalUnsolved, totalReviewed, highScore};
  }

  function getSortedDateLabels(groupedRaces) {
    const dateLabels = ['Today', 'Yesterday'];
    const otherLabels = Object.keys(groupedRaces)
      .filter((label) => !dateLabels.includes(label))
      .sort((a, b) => {
        const aMatch = a.match(/(\d+)\s+days?\s+ago/);
        const bMatch = b.match(/(\d+)\s+days?\s+ago/);

        if (aMatch && bMatch) {
          return parseInt(aMatch[1]) - parseInt(bMatch[1]);
        }

        return a.localeCompare(b);
      });

    return [...dateLabels.filter((l) => groupedRaces[l]), ...otherLabels];
  }

  return {groupByDate, calculateGroupStats, getSortedDateLabels};
})();

// ============================================================================
// LINK RENDERING
// ============================================================================

const LinkRenderer = (() => {
  function currentBadge(link) {
    return LinkHandler.getActiveTab() === link ? '<span class="badge current-badge">current</span>' : '';
  }

  function renderLinks(links, type) {
    if (!links || links.length === 0) return 'None';
    return links.map((link) => `<a class="${type}" href="${link}">${link} ${currentBadge(link)}</a>`).join('');
  }

  return {renderLinks};
})();

// ============================================================================
// DATE GROUP HEADER RENDERING
// ============================================================================

const GroupHeaderRenderer = (() => {
  function createHeader(dateLabel, groupRaceIds, stats) {
    const heading = document.createElement('h3');
    heading.classList.add('date-group-header');

    const labelSpan = document.createElement('span');
    labelSpan.classList.add('date-group-label');
    labelSpan.textContent = `${dateLabel} (${groupRaceIds.length})`;

    const statsSpan = document.createElement('span');
    statsSpan.classList.add('date-group-stats');
    const statsText = [
      stats.highScore ? `Highest score: <b>${stats.highScore}</b>` : '',
      `<span class="badge solved-badge">${stats.totalSolved}</span>`,
      `<span class="badge unsolved-badge">${stats.totalUnsolved}</span>`,
      `<span class="badge reviewed-badge">${stats.totalReviewed}</span>`,
    ]
      .filter(Boolean)
      .join(' ');
    statsSpan.innerHTML = statsText;

    heading.appendChild(labelSpan);
    heading.appendChild(statsSpan);

    return heading;
  }

  return {createHeader};
})();

// ============================================================================
// RACE DETAIL RENDERING
// ============================================================================

const RaceDetailRenderer = (() => {
  function createRaceElement(id, race, openRaces) {
    const details = document.createElement('details');
    details.dataset.raceId = id;

    if (openRaces[id]) {
      details.open = true;
    }

    const dateTime = DateFormatter.formatRaceTime(race.timestamp);
    const scoreText = race.score !== undefined ? `Score: <b>${race.score}</b>` : '';
    const rankText = race.rank ? `Rank: <b>${race.rank}/${race.totalPlayers || '?'}</b>` : '';
    const statsText = [scoreText, rankText].filter(Boolean).join(' ');

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
          ${LinkRenderer.renderLinks(race.unsolved, 'unsolved')}
        </div>

        <div>
          <div><strong>Reviewed</strong></div>
          ${LinkRenderer.renderLinks(race.reviewed, 'reviewed')}
        </div>

        <div>
          <div><strong>Solved</strong></div>
          ${LinkRenderer.renderLinks(race.solved, 'solved')}
        </div>
      </div>
    `;

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

    return details;
  }

  return {createRaceElement};
})();

// ============================================================================
// MAIN UI RENDERER
// ============================================================================

const UIRenderer = (() => {
  function render(data) {
    const container = document.getElementById('list');
    const fragment = document.createDocumentFragment();

    const races = data.races || {};
    const openRaces = data.openRaces || {};

    const raceIds = Object.keys(races).sort((a, b) => races[b].timestamp - races[a].timestamp);

    if (!raceIds || raceIds.length === 0) {
      container.innerHTML = '<h4>Play <a href="https://lichess.org/racer">puzzle racer</a> to begin.</h4>';
      return;
    }

    const groupedRaces = RaceOrganizer.groupByDate(races, raceIds);
    const sortedLabels = RaceOrganizer.getSortedDateLabels(groupedRaces);

    sortedLabels.forEach((dateLabel) => {
      const groupRaceIds = groupedRaces[dateLabel];
      const stats = RaceOrganizer.calculateGroupStats(races, groupRaceIds);

      fragment.appendChild(GroupHeaderRenderer.createHeader(dateLabel, groupRaceIds, stats));

      groupRaceIds.forEach((id) => {
        const race = races[id];
        fragment.appendChild(RaceDetailRenderer.createRaceElement(id, race, openRaces));
      });
    });

    container.innerHTML = '';
    container.appendChild(fragment);
    ScrollManager.restore();
  }

  return {render};
})();

// ============================================================================
// APP INITIALIZATION
// ============================================================================

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

