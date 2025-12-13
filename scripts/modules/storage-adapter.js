/**
 * StorageAdapter - Provides a unified storage interface with fallback to localStorage
 * Falls back to localStorage when chrome.storage is not available
 */

const StorageAdapter = (() => {
  function isAvailable() {
    return !!chrome?.storage?.local;
  }

  function initializeTestData() {
    // Only initialize test data if chrome.storage is not available
    if (!isAvailable()) {
      if (localStorage.getItem('races') === null && typeof testRaceData !== 'undefined') {
        localStorage.setItem('races', JSON.stringify(testRaceData));
        localStorage.setItem('openRaces', JSON.stringify({}));
      }

      if (localStorage.getItem('storms') === null && typeof testStormData !== 'undefined') {
        localStorage.setItem('storms', JSON.stringify(testStormData));
        localStorage.setItem('openStorms', JSON.stringify({}));
      }
    }
  }

  function get(keys) {
    return new Promise((resolve) => {
      if (isAvailable()) {
        chrome.storage.local.get(keys, resolve);
      } else {
        // Fallback to localStorage - initialize test data on first access
        initializeTestData();
        const result = {};
        if (Array.isArray(keys)) {
          keys.forEach((key) => {
            const storedValue = localStorage.getItem(key);
            if (storedValue !== null) {
              result[key] = JSON.parse(storedValue);
            }
          });
        } else if (typeof keys === 'string') {
          const storedValue = localStorage.getItem(keys);
          if (storedValue !== null) {
            result[keys] = JSON.parse(storedValue);
          }
        }
        resolve(result);
      }
    });
  }

  function set(items) {
    return new Promise((resolve) => {
      if (isAvailable()) {
        chrome.storage.local.set(items, resolve);
      } else {
        // Fallback to localStorage
        Object.keys(items).forEach((key) => {
          localStorage.setItem(key, JSON.stringify(items[key]));
        });
        resolve();
      }
    });
  }

  return {get, set, isAvailable};
})();
