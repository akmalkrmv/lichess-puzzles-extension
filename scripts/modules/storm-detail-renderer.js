/**
 * StormDetailRenderer - Renders individual storm details
 */

const StormDetailRenderer = (() => {
  function createStormElement(id, storm, openRaces, settings = {}) {
    const showSolvedPuzzles = settings.showSolvedPuzzles !== false;
    const showBadges = settings.showBadges !== false;

    const details = document.createElement('details');
    details.dataset.stormId = id;
    details.dataset.unsolved = storm.unsolved?.length || 0;

    if (openRaces[id]) {
      details.open = true;
    }

    console.log(storm);

    const dateTime = DateFormatter.formatRaceTime(storm.timestamp);
    const statsText = [
      storm.score !== undefined ? `Score: <b>${storm.score}</b>` : '',
      storm.moves !== undefined ? `Moves: <b>${storm.moves}</b>` : '',
      storm.accuracy !== undefined ? `Accuracy: <b>${storm.accuracy}</b>%` : '',
      storm.combo !== undefined ? `Combo: <b>${storm.combo}</b>` : '',
      storm.time !== undefined ? `Time: <b>${storm.time}</b>s` : '',
      storm.timePerMove !== undefined ? `Time per move: <b>${storm.timePerMove}</b>s` : '',
      storm.highestSolved !== undefined ? `Highest solved: <b>${storm.highestSolved}</b>` : '',
    ]
      .filter(Boolean)
      .map(stat => `<span>${stat}</span>`)
      .join(' ');

    details.innerHTML = `
      <summary>
        <div class="summary-row">
          <div class="summary-row-title">
              <span>Storm: <a target="_blank" href="https://lichess.org/stormr/${id}">#${id}</a></span>
              <span class="summary-row-time">${dateTime}</span>
              ${statsText ? `<span class="summary-row-stats">${statsText}</span>` : ''}
          </div>
          <span class="badges">
            ${showBadges ? `<span class="badge solved-badge">${storm.solved?.length || 0}</span>` : ''}
            <span class="badge unsolved-badge">${storm.unsolved?.length || 0}</span>
            <span class="badge reviewed-badge">${storm.reviewed?.length || 0}</span>
          </span>
        </div>
      </summary>

      <div class="links">
        <div>
          <div><strong>Unsolved</strong><span class="badge copy-links-badge">copy links<span></div>
          ${LinkRenderer.renderLinks(storm.unsolved, 'unsolved')}
        </div>
        <div>
          <div><strong>Reviewed</strong><span class="badge copy-links-badge">copy links<span></div>
          ${LinkRenderer.renderLinks(storm.reviewed, 'reviewed')}
        </div>
        ${
          showSolvedPuzzles
            ? `
        <div>
          <div><strong>Solved</strong><span class="badge copy-links-badge">copy links<span></div>
          ${LinkRenderer.renderLinks(storm.solved, 'solved')}
        </div>
        `
            : ''
        }
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

        console.log(content);

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

  return {createStormElement};
})();
