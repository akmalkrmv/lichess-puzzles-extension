/**
 * LinkRenderer - Renders puzzle links with proper styling
 */

const LinkRenderer = (() => {
  const PUZZLE_TRAINING = 'https://lichess.org/training';

  function currentBadge(link) {
    return LinkHandler.getActiveTab() === link ? '<span class="badge current-badge">current</span>' : '';
  }

  function prependPathIfNeeded(path, puzzleLinkOrId) {
    return puzzleLinkOrId.startsWith(path) ? puzzleLinkOrId : `${path}/${puzzleLinkOrId}`;
  }

  function renderLinks(puzzles, type) {
    if (!puzzles || puzzles.length === 0) return 'None';
    return puzzles
      .map((linkOrId) => prependPathIfNeeded(PUZZLE_TRAINING, linkOrId))
      .map((link) => `<a class="${type}" href="${link}">${link} ${currentBadge(link)}</a>`)
      .join('');
  }

  return {renderLinks};
})();
