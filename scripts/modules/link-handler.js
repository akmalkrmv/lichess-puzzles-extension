/**
 * LinkHandler - Manages active tab URL and link clicks
 */

const LinkHandler = (() => {
  let activeTabUrl = '';

  function setActiveTab(url) {
    activeTabUrl = url;
  }

  function getActiveTab() {
    return activeTabUrl;
  }

  function handleClick(e) {
    if (e.target.tagName !== 'A') return;

    e.preventDefault();
    chrome.tabs?.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.update(tabs[0].id, {url: e.target.href});
    });

    setActiveTab(e.target.href);
    updateUI();
  }

  function setup() {
    document.addEventListener('click', handleClick);
  }

  return {setActiveTab, getActiveTab, setup};
})();
