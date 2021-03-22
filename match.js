import isRegExp from 'lodash/isRegExp.js';
import isString from 'lodash/isString.js';
import isFunction from 'lodash/isFunction.js';
import isMap from 'lodash/isMap.js';

const is = {
  regexp(pattern, value) {
    return isString(value) && value.match(pattern)
  },
  func(pattern, value) {
    return pattern(value);
  },
  same(pattern, value) {
    return Object.is(pattern, value);
  }
}

/**
 * Convert patterns to an array with matchers
 *
 * Matcher is a condition function, which apply pattern to value
 *
 * @param  {Array|Map|Object} patterns to match
 * @return {Array<Array>} [matcher, pattern, fn] — matcher is a condition function
 *
 * @example prepareMatchers([[/test/, fn]]); // returns [[is.regexp, /test/, fn]]
 * @example prepareMatchers([[1, fn]]); // returns [[is.same, 1, fn]]
 * @example prepareMatchers([[isNumber, fn]]); // returns [[is.func, isNumber, fn]]
 */
function prepareMatchers(patterns) {
  const mapper = ([pattern, fn]) => {
    if (isRegExp(pattern)) return [is.regexp, pattern, fn];
    if (isFunction(pattern)) return [is.func, pattern, fn];
    return [is.same, pattern, fn];
  };

  if (Array.isArray(patterns)) return patterns.map(mapper);
  if (isMap(patterns)) return Array.from(patterns).map(mapper);
  return Object.entries(patterns).map(mapper);
}

/**
 * Create matching function
 * It uses for pattern matching,
 * nice replacement for switch/case, if/else or mapping patterns
 *
 * @param  {Array<Array>|Map|Object} patterns
 * @param  {Function|Mixed} onDefault — calls or returns when nothing matched
 * @return {Function} matching function
 *
 *
 * @example
 * const matching = match([
 *   ['bot/create', onBotCreate],
 *   ['bot/save', onBotSave],
 *   [/^bot/i, onOtherBotActions]
 * ], () => {
 *   throw new Error('Nothing matched')
 * });
 *
 * // ...
 *
 * const result = matching(action.type, action);
 *
 * @example
 * const matching = match({
 *   ['bot/create'](state, action) {
 *     const bot = action.payload;
 *     return {
 *       ...state,
 *       bots: {
 *         ...state.bots,
 *         [bot.id]: bot
 *       }
 *     }
 *   },
 *   ['bot/remove'](state, action) {
 *     const id = action.payload;
 *     const nextState = { ...state };
 *     delete nextState[id];
 *     return nextState
 *   }
 * }, (state) => return state);
 *
 * const reducer = (state, action) => matching(action.type, state, action);
 *
 * // ...
 *
 * const nextState = reducer(state, action);
 */
export function match(patterns, onDefault) {
  const matchers = prepareMatchers(patterns);

  return function(value, ...args) {
    for (const [matcher, pattern, fn] of matchers) {
      if (matcher(pattern, value)) {
        return isFunction(fn) ? fn(...args, value) : fn;
      }
    }

    return isFunction(onDefault)
      ? onDefault(...args, value)
      : onDefault;
  }
}
