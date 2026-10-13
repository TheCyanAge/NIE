import { MIND_LIMITS, MIND_VERSION, SAID_KINDS, emptyMind, ensureMind, mindOf, sanitizeMind, statementText } from './state.js';
import { cleanStatement, forgetItem, forgetSaid, isFiller, rememberSaid, rememberStatements, statementsIn } from './record.js';
import { SOURCES, WEIGHTS, passagesOf } from './sources.js';
import { queryTerms, recall, recallNames } from './recall.js';
import { describeMind, mindStats } from './describe.js';
import { clearTokenMemo } from './tokens.js';

/**
 * The project's mind (see state.js for what is kept and where). Everything here is a function of the project it is given: nothing is held between calls,
 * so one project can never see another's. The writer's own words go in and come out; NIE writes none of them.
 */
export {
  MIND_LIMITS, MIND_VERSION, SAID_KINDS, emptyMind, ensureMind, mindOf, sanitizeMind, statementText,
  cleanStatement, forgetItem, forgetSaid, isFiller, rememberSaid, rememberStatements, statementsIn,
  SOURCES, WEIGHTS, passagesOf,
  queryTerms, recall, recallNames,
  describeMind, mindStats,
  clearTokenMemo,
};

export const mind = {
  emptyMind, sanitizeMind, ensureMind, rememberSaid, rememberStatements, statementsIn, forgetSaid, forgetItem, passagesOf, recall, recallNames, describeMind, mindStats,
};
export default mind;
