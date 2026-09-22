"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sameEngineKey = exports.normalizeForEngine = exports.MARKET_COUNTRY_CODE = exports.isEngineKey = void 0;
// flashchat-core — pure logic shared by the Flash Chat engine and the POS.
//
// Phase 1 of POS docs/17-shared-platform.md. The rule for what belongs here:
// no I/O, no database, no framework. A function lives here when BOTH products
// must agree on its answer, and the cost of them disagreeing is a wrong
// record rather than a cosmetic difference.
//
// Everything is versioned by git tag and consumed as a pinned dependency, so
// neither product can be changed from under the other.
var phone_1 = require("./phone");
Object.defineProperty(exports, "isEngineKey", { enumerable: true, get: function () { return phone_1.isEngineKey; } });
Object.defineProperty(exports, "MARKET_COUNTRY_CODE", { enumerable: true, get: function () { return phone_1.MARKET_COUNTRY_CODE; } });
Object.defineProperty(exports, "normalizeForEngine", { enumerable: true, get: function () { return phone_1.normalizeForEngine; } });
Object.defineProperty(exports, "sameEngineKey", { enumerable: true, get: function () { return phone_1.sameEngineKey; } });
