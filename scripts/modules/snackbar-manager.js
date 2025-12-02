/**
 * SnackbarManager - shows snackbar information
 */

const SnackbarManager = (() => {
  const snackbarContainerElement = document.querySelector('.snackbar-container');
  const snackbarElement = document.querySelector('.snackbar');
  const snackbarDuration = 3000;
  let snackbarTimeout;

  function show(message) {
    snackbarElement.textContent = message;
    snackbarContainerElement.style.opacity = 1;
    snackbarContainerElement.style.visibility = 'visible';

    clearTimeout(snackbarTimeout);
    snackbarTimeout = setTimeout(hide, snackbarDuration);
  }

  function hide() {
    snackbarContainerElement.style.opacity = 0;
    snackbarContainerElement.style.visibility = 'hidden';
  }

  return {show, hide};
})();
