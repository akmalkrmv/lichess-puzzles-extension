/**
 * GroupHeaderRenderer - Creates date group headers with statistics
 */

const GroupHeaderRenderer = (() => {
  // Utility function to create an element with optional classes
  function createElement(tag, classes = []) {
    const element = document.createElement(tag);
    element.classList.add(...classes);
    return element;
  }

  function runLabel(amount) {
    return amount > 1 ? 'runs' : 'run';
  }

  function createHeader(dateLabel, groupRaceIds, stats, showBadges = true) {
    // Create the outer heading container
    const heading = createElement('div', ['date-group-header']);
    const headingLeft = createElement('div', []);
    const headingRight = createElement('div', []);

    // Create and append the date label (top part)
    const labelElement = createElement('h3', ['date-group-label']);
    labelElement.innerHTML = `${dateLabel} <span>(<b>${groupRaceIds.length}</b> ${runLabel(groupRaceIds.length)})</span>`;

    // Full date
    const formattedDate = DateFormatter.getFullDate(stats.timestamp);

    // Create and append the stats container (below date)
    const statsContainer = createElement('div', ['date-group-stats-container']);
    const statsText = [
      // `<div><b>${groupRaceIds.length}</b> ${runLabel(groupRaceIds.length)}.</div>`,
      `<div class="time-stat">
        ${stats.timestamp ? `<span class="date-group-stat"><b>${formattedDate}</b></span>` : ''}
      </div>`,
      `<div>
        ${stats.highScore ? `<span class="date-group-stat">High score: <b>${stats.highScore}</b></span>` : ''}
        ${stats.averageScore ? `<span class="date-group-stat">Avg. score: <b>${stats.averageScore}</b></span>` : ''}
      </div>`,
      `<div>
        <span class="date-group-stat">Avg. solves: <b>${stats.averageSolves}</b></span>
        <span class="date-group-stat">Avg. fails: <b>${stats.averageFails}</b></span>
      </div>`,
      `<div>
        ${stats.highRank ? `<span class="date-group-stat">High rank: <b>${stats.highRank}</b></span>` : ''}
        ${stats.averageRank ? `<span class="date-group-stat">Avg. rank: <b>${stats.averageRank}</b></span>` : ''}
      </div>`,
    ]
      .filter(Boolean)
      .join(' ');
    statsContainer.innerHTML = statsText;

    // Create and append the badges container (right aligned)
    const badgesContainer = createElement('div', ['badges-container']);
    const badgeStatsText = [
      showBadges ? `<span class="badge solved-badge">${stats.totalSolved}</span>` : '',
      `<span class="badge unsolved-badge">${stats.totalUnsolved}</span>`,
      `<span class="badge reviewed-badge">${stats.totalReviewed}</span>`,
    ]
      .filter(Boolean)
      .join(' ');
    badgesContainer.innerHTML = badgeStatsText;

    // Append everything to the main heading container
    headingLeft.appendChild(labelElement);
    headingLeft.appendChild(statsContainer);
    headingRight.appendChild(badgesContainer);

    heading.appendChild(headingLeft);
    heading.appendChild(headingRight);

    const copyStatsButton = createElement('span', ['badge', 'copy-stats-badge']);
    copyStatsButton.textContent = 'copy stats';
    copyStatsButton.addEventListener('click', function () {
      const content = [...heading.querySelectorAll('.date-group-stat')].map((element) => element.textContent).join('\n');
      navigator.clipboard.writeText(content).then(() => SnackbarManager.show('Stats copied'));
    });
    const timeStat = heading.querySelector('.time-stat');
    timeStat.appendChild(copyStatsButton);

    return heading;
  }

  return {createHeader};
})();
