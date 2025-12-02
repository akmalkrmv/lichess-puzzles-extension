/**
 * RaceDetailRenderer - Renders individual race details
 */

const RaceDetailRenderer = (() => {
  function createRaceElement(id, race, openRaces, settings = {}) {
    const showSolvedPuzzles = settings.showSolvedPuzzles !== false;
    const showBadges = settings.showBadges !== false;

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
            ${showBadges ? `<span class="badge solved-badge">${race.solved?.length || 0}</span>` : ''}
            <span class="badge unsolved-badge">${race.unsolved?.length || 0}</span>
            <span class="badge reviewed-badge">${race.reviewed?.length || 0}</span>
          </span>
        </div>
      </summary>

      <div class="links">
        <div>
          <div><strong>Unsolved</strong><span class="badge copy-links-badge">copy links<span></div>
          ${LinkRenderer.renderLinks(race.unsolved, 'unsolved')}
        </div>
        <div>
          <div><strong>Reviewed</strong><span class="badge copy-links-badge">copy links<span></div>
          ${LinkRenderer.renderLinks(race.reviewed, 'reviewed')}
        </div>
        ${showSolvedPuzzles ? `
        <div>
          <div><strong>Solved</strong><span class="badge copy-links-badge">copy links<span></div>
          ${LinkRenderer.renderLinks(race.solved, 'solved')}
        </div>
        ` : ''}
      </div>
    `;

    details.addEventListener('click', (event) => {
      if (event.target.classList.contains('copy-links-badge')) {
        // Find the parent div of the clicked "copy" badge
        const parentDiv = event.target.parentElement.parentElement;

        // Find all anchor tags (links) in the same section
        const anchorElements = parentDiv.querySelectorAll('a');

        // Extract the text content from each anchor element and join them with new line
        const content = Array.from(anchorElements)
          .map((anchor) => anchor.textContent.trim()) // Get text inside each anchor
          .filter((text) => text.length > 0) // Filter out any empty text
          .join('\n'); // Join them with new line for separation

          console.log(content)

        // Copy the content to clipboard
        navigator.clipboard
          .writeText(content)
          .then(() => SnackbarManager.show('Links copied'))
          .catch((err) => console.error('Error copying links: ', err));
      }
    });

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
