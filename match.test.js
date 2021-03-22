/* global describe test expect */
import { jest } from '@jest/globals';

import isString from 'lodash/isString.js';
import isNumber from 'lodash/isNumber.js';

import { match } from './match.js';

describe('match function for matching', () => {
  test('returns function', () => {
    expect(match([])).toBeInstanceOf(Function);
  });

  test('throws without patterns array', () => {
    expect(() => match()).toThrow();
  });

  test('matches string patterns from object', () => {
    const create = jest.fn();
    const save = jest.fn();
    const drop = jest.fn();

    const matching = match({
      'bot/create': create,
      'bot/save': save,
      'client/drop': drop
    });

    matching('bot/create');
    matching('bot/create');
    matching('bot/save');

    expect(create).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenCalledTimes(1);
    expect(drop).toHaveBeenCalledTimes(0);
  });

  test('matches regexp patterns from array', () => {
    const bot = jest.fn(() => true);
    const client = jest.fn(() => false);

    const matching = match([
      [/^bot/, bot],
      [/^client/i, client],
      [/client$/i, client]
    ]);

    expect(matching('bot/create')).toBe(true);
    expect(matching('bot/save')).toBe(true);
    expect(matching('client/drop')).toBe(false);
    expect(matching('bump/client')).toBe(false);
    expect(matching('something weird')).not.toBeDefined();

    expect(bot).toHaveBeenCalledTimes(2);
    expect(client).toHaveBeenCalledTimes(2);
  });

  test('matches function patterns from array', () => {
    const whenString = jest.fn();
    const whenNumber = jest.fn();

    const matching = match([
      [isString, whenString],
      [isNumber, whenNumber]
    ]);

    matching('string');
    matching(0);

    expect(whenString).toHaveBeenCalledTimes(1);
    expect(whenNumber).toHaveBeenCalledTimes(1);
  });

  test('matches mixed patterns from array and default', () => {
    const create = jest.fn();
    const auth = jest.fn();
    const whenEqual = jest.fn();
    const whenNumber = jest.fn();
    const whenDefault = jest.fn();

    const matching = match([
      ['bot/create', create],
      [/^auth/i, auth],
      [0, whenEqual],
      [1, whenEqual],
      [isNumber, whenNumber]
    ], whenDefault);

    matching('bot/create');
    matching('auth');
    matching('Auth user');
    matching(0);
    matching(1);
    matching(2);
    matching(3);
    matching(false);
    matching(undefined);
    matching({});

    expect(create).toHaveBeenCalledTimes(1);
    expect(auth).toHaveBeenCalledTimes(2);
    expect(whenEqual).toHaveBeenCalledTimes(2);
    expect(whenNumber).toHaveBeenCalledTimes(2);
    expect(whenDefault).toHaveBeenCalledTimes(3);
  });

  test('returns values', () => {
    const create = jest.fn(() => ({ screens: [], components: [] }));
    const auth = jest.fn(() => true);
    const def = jest.fn(() => 'weird');

    const matching = match({ create, auth }, def);

    expect(matching('create')).toEqual({ screens: [], components: [] });
    expect(matching('auth')).toBe(true);
    expect(matching('something weird')).toBe('weird');
  });

  test('returns plain values', () => {
    const create = { screens: [], components: [] };
    const auth = true;
    const def = 'weird';

    const matching = match({ create, auth }, def);

    expect(matching('create')).toEqual({ screens: [], components: [] });
    expect(matching('auth')).toBe(true);
    expect(matching('something weird')).toBe(def);
  });

  test('takes Map of patterns', () => {
    const create = jest.fn();
    const auth = jest.fn();

    const patterns = new Map([[/create$/i, create]]);
    patterns.set(/auth$/, auth);

    const matching = match(patterns);

    matching('bot/create');
    matching('user/auth');

    expect(create).toHaveBeenCalled();
    expect(auth).toHaveBeenCalled();
  });
});
