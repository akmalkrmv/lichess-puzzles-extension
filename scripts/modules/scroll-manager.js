/**
 * ScrollManager - Handles scroll position persistence for the popup
 */

const ScrollManager = (() => {
  const scrollContainer = document.querySelector('.tabs-content');
  let scrollTimeout;

  function save() {
    const scrollPosition = scrollContainer.scrollTop;
    chrome.storage?.local.set({popupScrollPosition: scrollPosition});
  }

  function restore() {
    chrome.storage?.local.get(['popupScrollPosition'], (data) => {
      if (data.popupScrollPosition !== undefined) {
        scrollContainer.scrollTop = data.popupScrollPosition;
      }
    });
  }

  function setupThrottledListener() {
    scrollContainer.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(save, 200);
    });
  }

  return {save, restore, setupThrottledListener};
})();
