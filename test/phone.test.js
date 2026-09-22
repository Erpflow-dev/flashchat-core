// The worked table in POS docs/18-contact-contract.md §2, executable.
// If a row here changes, that document changes with it — they are the same
// decision written twice, once for people and once for the machine.
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isEngineKey,
  MARKET_COUNTRY_CODE,
  normalizeForEngine,
  sameEngineKey,
} = require('../dist/index.js');

const SA = MARKET_COUNTRY_CODE.sa; // 966
const BD = MARKET_COUNTRY_CODE.bd; // 880

test('the contract table, Saudi tenant', () => {
  const rows = [
    ['0501234567', '966501234567'],
    ['501234567', '966501234567'],
    ['966501234567', '966501234567'],
    ['+966 50 123 4567', '966501234567'],
    ['00966501234567', '966501234567'],
    ['+973 3312 3456', '97333123456'], // foreign, kept as typed
  ];
  for (const [typed, expected] of rows) {
    assert.equal(normalizeForEngine(typed, SA), expected, typed);
  }
});

test('the contract table, Bangladesh tenant', () => {
  const rows = [
    ['01712345678', '8801712345678'],
    ['1712345678', '8801712345678'],
    ['+8801712345678', '8801712345678'],
    ['008801712345678', '8801712345678'],
  ];
  for (const [typed, expected] of rows) {
    assert.equal(normalizeForEngine(typed, BD), expected, typed);
  }
});

test('separators a cashier might type are ignored', () => {
  for (const typed of ['(050) 123-4567', '050 123 4567', '050.123.4567']) {
    assert.equal(normalizeForEngine(typed, SA), '966501234567', typed);
  }
});

test('nothing usable gives null, so the customer stays POS-only', () => {
  for (const typed of ['', '   ', 'walk-in', '-', null, undefined, 42, {}]) {
    assert.equal(normalizeForEngine(typed, SA), null, String(typed));
  }
});

test('a result that is not E.164-shaped is refused, not guessed at', () => {
  assert.equal(normalizeForEngine('123', SA), null, 'too short');
  assert.equal(normalizeForEngine('+0501234567', SA), null, 'leading zero');
  // A group JID digitises to something far too long: docs/18 §7 keeps groups
  // out of linking, and the shape gate catches them anyway.
  assert.equal(
    normalizeForEngine('8801712345678-1234567890', BD),
    null,
    'group jid',
  );
});

test('a bad tenant country code is refused rather than prefixed', () => {
  for (const cc of ['', '0', 'sa', '+966', '12345']) {
    assert.equal(normalizeForEngine('501234567', cc), null, cc);
  }
});

test('isEngineKey accepts only the engine shape', () => {
  assert.equal(isEngineKey('966501234567'), true);
  assert.equal(isEngineKey('0501234567'), false, 'leading zero');
  assert.equal(isEngineKey('+966501234567'), false, 'plus');
  assert.equal(isEngineKey('123456'), false, 'six digits');
  assert.equal(isEngineKey('1234567890123456'), false, 'sixteen digits');
  assert.equal(isEngineKey(966501234567), false, 'not a string');
});

// The one that matters most. The engine's own findExistingContact matches on
// the last 8 digits; linking a ledger that way would put one person's
// spending against another's name, so sameEngineKey must never forgive it.
test('sameEngineKey is exact and does NOT forgive a last-8 match', () => {
  assert.equal(sameEngineKey('966501234567', '966501234567'), true);
  assert.equal(
    sameEngineKey('966501234567', '966511234567'),
    false,
    'same last 8, different subscriber',
  );
  assert.equal(
    sameEngineKey('8801712345678', '9661712345678'),
    false,
    'same last 8, different country',
  );
  assert.equal(sameEngineKey('966501234567', ''), false);
  assert.equal(sameEngineKey(null, null), false, 'two nulls are not a match');
});
