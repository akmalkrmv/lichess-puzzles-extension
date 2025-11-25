/**
 * DateFormatter - Formats timestamps into user-friendly strings
 */

const DateFormatter = (() => {
  function getRelativeDateLabel(timestamp) {
    const raceDate = new Date(timestamp);
    const today = new Date();

    raceDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today - raceDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${Math.floor(diffDays)} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return raceDate.toLocaleDateString();
  }

  function formatRaceTime(timestamp) {
    const raceDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now - raceDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
    if (diffHours < 24) return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (raceDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${raceDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      const dayName = raceDate.toLocaleDateString([], {weekday: 'long'});
      return `${dayName} at ${raceDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
    }

    return raceDate.toLocaleDateString([], {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'});
  }

  return {getRelativeDateLabel, formatRaceTime};
})();
