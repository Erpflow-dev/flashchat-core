// flashchat-core — pure logic shared by the Flash Chat engine and the POS.
//
// Phase 1 of POS docs/17-shared-platform.md. The rule for what belongs here:
// no I/O, no database, no framework. A function lives here when BOTH products
// must agree on its answer, and the cost of them disagreeing is a wrong
// record rather than a cosmetic difference.
//
// Everything is versioned by git tag and consumed as a pinned dependency, so
// neither product can be changed from under the other.
export {
  isEngineKey,
  MARKET_COUNTRY_CODE,
  normalizeForEngine,
  sameEngineKey,
  type CountryCode,
  type Market,
} from './phone';
