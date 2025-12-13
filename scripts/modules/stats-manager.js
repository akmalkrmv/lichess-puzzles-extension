/**
 * StatsManager - Chart visualization for race statistics
 */

const StatsManager = (() => {
  const create = (tag, classes = []) => {
    const el = document.createElement(tag);
    if (classes.length) el.classList.add(...classes);
    return el;
  };

  // Group races by date and calculate daily averages
  function processRaceData(races) {
    const dailyData = {};

    Object.values(races).forEach((race) => {
      // Skip invalid entries
      if (!race.timestamp || typeof race.score !== 'number') {
        console.warn('Skipping invalid race data:', race);
        return;
      }

      const date = new Date(race.timestamp);
      const dateKey = date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          timestamp: race.timestamp, // Keep for sorting
          scores: [],
          totalSolved: 0,
          totalUnsolved: 0,
          races: 0,
        };
      }

      dailyData[dateKey].scores.push(race.score);
      dailyData[dateKey].totalSolved += race.solved?.length || 0;
      dailyData[dateKey].totalUnsolved += race.unsolved?.length || 0;
      dailyData[dateKey].races++;
    });

    // Convert to array and calculate averages
    const result = Object.values(dailyData)
      .map((day) => ({
        date: day.date,
        timestamp: day.timestamp,
        score: Math.round(day.scores.reduce((a, b) => a + b, 0) / day.scores.length),
        races: day.races,
        avgSolved: Math.round(day.totalSolved / day.races),
        avgUnsolved: Math.round(day.totalUnsolved / day.races),
      }))
      .sort((a, b) => a.timestamp - b.timestamp); // Sort by actual timestamp

    console.log('Processed race data:', result);
    return result;
  }

  function calculateNiceMax(dataMax, desiredTicks = 5) {
    // Handle edge cases
    if (!dataMax || dataMax <= 0) {
      return {niceMax: 100, step: 20};
    }

    const rawStep = dataMax / desiredTicks;
    const pow10 = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const candidates = [1, 2, 5].map((f) => f * pow10);

    const step = candidates.reduce((best, c) => (Math.abs(c - rawStep) < Math.abs(best - rawStep) ? c : best));

    let niceMax = step * desiredTicks;

    // If data max exceeds our nice max, bump up one step
    if (dataMax > niceMax) {
      niceMax = step * (desiredTicks + 1);
    }

    return {niceMax, step};
  }

  function buildClipPath(data, yMax) {
    const points = data.map((d, i) => {
      const xPct = (i / (data.length - 1)) * 100;
      const yPct = 100 - (d.score / yMax) * 100;
      return `${xPct}% ${yPct}%`;
    });

    points.push(`100% 100%`, `0% 100%`);
    return `polygon(${points.join(', ')})`;
  }

  function buildXAxis(data) {
    const axis = create('div', ['axis-x']);
    data.forEach((d) => {
      const label = create('span');
      label.textContent = d.date;
      axis.appendChild(label);
    });
    return axis;
  }

  function buildYAxis(niceMax, step, desiredTicks = 5) {
    const axis = create('div', ['axis-y']);

    for (let i = desiredTicks; i >= 0; i--) {
      const value = step * i;
      const label = create('span');
      label.textContent = Math.round(value);
      axis.appendChild(label);
    }

    return axis;
  }

  function generateChart(data) {
    if (!data || data.length === 0) {
      const empty = create('div', ['chart-empty']);
      empty.textContent = 'No race data available';
      return empty;
    }

    const fragment = document.createDocumentFragment();
    const segment = create('div', ['chart-segment']);
    const chart = create('div', ['chart']);

    const dataMax = Math.max(...data.map((d) => d.score));
    const {niceMax, step} = calculateNiceMax(dataMax, 5);

    chart.style.clipPath = buildClipPath(data, niceMax);

    data.forEach((p, i) => {
      const dot = create('div', ['point']);
      const xPct = (i / (data.length - 1)) * 100;
      const yPct = 100 - (p.score / niceMax) * 100;

      dot.style.left = `${xPct}%`;
      dot.style.top = `${yPct}%`;
      dot.title = `${p.date}\nAvg Score: ${p.score}\nRaces: ${p.races}\nAvg Solved: ${p.avgSolved}`;

      segment.appendChild(dot);
    });

    segment.appendChild(chart);
    fragment.appendChild(buildXAxis(data));
    fragment.appendChild(buildYAxis(niceMax, step, 5));
    fragment.appendChild(segment);

    return fragment;
  }

  // Main render function - accepts race data from chrome.storage.local
  function renderStats(races = null) {
    const container = document.getElementById('stats-content');
    if (!container) return;

    container.innerHTML = '';

    const wrapper = create('div', ['stats-card']);
    const header = create('h3');
    header.textContent = 'Puzzle Racer Statistics';

    const chartWrapper = create('div', ['chart-container']);

    if (races) {
      const processedData = processRaceData(races);
      chartWrapper.appendChild(generateChart(processedData));
    } else {
      // If no data passed, try to load from chrome.storage
      chrome.storage.local.get(null, (items) => {
        // Filter out non-race items if needed
        const raceData = Object.fromEntries(Object.entries(items).filter(([key, val]) => val.timestamp && val.score !== undefined));
        const processedData = processRaceData(raceData);
        chartWrapper.appendChild(generateChart(processedData));
      });
    }

    wrapper.appendChild(header);
    wrapper.appendChild(chartWrapper);
    container.appendChild(wrapper);
  }

  return {renderStats, processRaceData};
})();
