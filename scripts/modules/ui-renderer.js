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

      const raceContainer = document.createElement('div');
      raceContainer.classList.add('race-run-card');
      raceContainer.appendChild(GroupHeaderRenderer.createHeader(dateLabel, groupRaceIds, stats, settings.showBadges));

      groupRaceIds.forEach((id) => {
        const race = races[id];
        raceContainer.appendChild(RaceDetailRenderer.createRaceElement(id, race, openRaces, settings));
      });

      fragment.appendChild(raceContainer);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
    ScrollManager.restore();
  }

  async function renderStorm(data) {
    const container = document.getElementById('storm-list');
    if (!container) return;

    const fragment = document.createDocumentFragment();
    const settings = await SettingsManager.getSettings();

    const storms = data.storms || {};
    const openRaces = data.openRaces || {};

    const stormIds = Object.keys(storms).sort((a, b) => storms[b].timestamp - storms[a].timestamp);

    if (!stormIds || stormIds.length === 0) {
      container.innerHTML = '<h4>Play <a href="https://lichess.org/storm">puzzle storm</a> to begin.</h4>';
      return;
    }

    const groupedStorms = RaceOrganizer.groupByDate(storms, stormIds);
    const sortedLabels = RaceOrganizer.getSortedDateLabels(groupedStorms);

    sortedLabels.forEach((dateLabel) => {
      const groupRaceIds = groupedStorms[dateLabel];
      const stats = RaceOrganizer.calculateGroupStats(storms, groupRaceIds);

      const raceContainer = document.createElement('div');
      raceContainer.classList.add('race-run-card');
      raceContainer.appendChild(GroupHeaderRenderer.createHeader(dateLabel, groupRaceIds, stats, settings.showBadges));

      groupRaceIds.forEach((id) => {
        const storm = storms[id];
        raceContainer.appendChild(StormDetailRenderer.createStormElement(id, storm, openRaces, settings));
      });

      fragment.appendChild(raceContainer);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
    ScrollManager.restore();
  }

  return {render, renderStorm};
})();
