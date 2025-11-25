/**
 * LinkRenderer - Renders puzzle links with proper styling
 */

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
