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

    // Create and append the stats container (below date)
    const statsContainer = createElement('div', ['date-group-stats-container']);
    const statsText = [
      // `<div><b>${groupRaceIds.length}</b> ${runLabel(groupRaceIds.length)}.</div>`,
      `<div>
        ${stats.highScore ? `<span class="date-group-stat">High score: <b>${stats.highScore}</b></span>` : ''}
        ${stats.averageScore ? `<span class="date-group-stat">Avg. score: <b>${stats.averageScore}</b></span>` : ''}
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

    return heading;
  }

  return {createHeader};
})();
