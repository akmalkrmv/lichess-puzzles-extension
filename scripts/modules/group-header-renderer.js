/**
 * GroupHeaderRenderer - Creates date group headers with statistics
 */

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
