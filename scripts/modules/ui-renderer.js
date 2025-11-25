/**
 * UIRenderer - Main rendering orchestrator
 */

const UIRenderer = (() => {
  async function render(data) {
    const container = document.getElementById('list');
    if (!container) return;

    const fragment = document.createDocumentFragment();
    const settings = await SettingsManager.getSettings();

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

      fragment.appendChild(GroupHeaderRenderer.createHeader(dateLabel, groupRaceIds, stats, settings.showBadges));

      groupRaceIds.forEach((id) => {
        const race = races[id];
        fragment.appendChild(RaceDetailRenderer.createRaceElement(id, race, openRaces, settings));
      });
    });

    container.innerHTML = '';
    container.appendChild(fragment);
    ScrollManager.restore();
  }

  return {render};
})();
