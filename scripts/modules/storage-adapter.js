/**
 * StorageAdapter - Provides a unified storage interface with fallback to memory
 * Falls back to in-memory storage when chrome.storage is not available
 */

const StorageAdapter = (() => {
  // In-memory fallback storage
  const memoryStorage = {};

  function isAvailable() {
    return !!(chrome?.storage?.local);
  }

  function initializeTestData() {
    // Only initialize test data if chrome.storage is not available
    if (!isAvailable() && Object.keys(memoryStorage).length === 0 && typeof testData !== 'undefined') {
      // Wrap testData in the 'races' key since that's how it's stored
      Object.assign(memoryStorage, {races: testData, openRaces: {}});
    }
  }

  function get(keys) {
    return new Promise((resolve) => {
      if (isAvailable()) {
        chrome.storage.local.get(keys, resolve);
      } else {
        // Fallback to memory storage - initialize test data on first access
        initializeTestData();
        const result = {};
        if (Array.isArray(keys)) {
          keys.forEach((key) => {
            if (memoryStorage[key] !== undefined) {
              result[key] = memoryStorage[key];
            }
          });
        } else if (typeof keys === 'string') {
          if (memoryStorage[keys] !== undefined) {
            result[keys] = memoryStorage[keys];
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
        // Fallback to memory storage
        Object.assign(memoryStorage, items);
        resolve();
      }
    });
  }

  return {get, set, isAvailable};
})();
