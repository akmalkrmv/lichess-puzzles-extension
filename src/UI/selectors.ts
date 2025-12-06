export const PUZZLE_FEEDBACK_SELECTOR = '.puzzle__feedback';

export const PUZZLE_FEEDBACK_SUCCESS_SELECTOR = `${PUZZLE_FEEDBACK_SELECTOR} .complete`;
export const PUZZLE_FEEDBACK_FAIL_SELECTOR = `${PUZZLE_FEEDBACK_SELECTOR} .fail`;
export const PUZZLE_FEEDBACK_NEXT_SELECTOR = `${PUZZLE_FEEDBACK_SELECTOR} .puzzle__more`;

export const SELECTORS = {
  RACER_PAGE: {
    score: '.puz-side__solved__text',
    rank: '.race__post__rank',
    solvedRounds: '.puz-history__round:has(good) a',
    unsolvedRounds: '.puz-history__round:has(bad) a',
  },
  STORM_PAGE: {
    score: '.storm--end__score__number',
    solvedRounds: '.puz-history__round:has(good) a',
    unsolvedRounds: '.puz-history__round:has(bad) a',
    stats: '.slist td number',
  },
};
