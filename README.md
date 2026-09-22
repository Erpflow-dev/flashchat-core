# flashchat-core

Pure logic shared by the **Flash Chat engine** (`wacrm`) and the **POS**
(`Erpflow-dev/POS`). Phase 1 of the POS's `docs/17-shared-platform.md`.

## What belongs in here

No I/O. No database. No framework. A function earns a place here when **both
products must agree on its answer and the cost of disagreeing is a wrong
record**, not a cosmetic difference.

Everything else stays where it is. A shared package that grows by
convenience becomes a second place to look for every bug.

## What is in it today

`normalizeForEngine`, `isEngineKey`, `sameEngineKey` — the contact identity
key, specified in the POS repo's `docs/18-contact-contract.md` §2.

The POS and the engine join a customer record on this value, so the two must
compute it identically. `test/phone.test.js` is that document's worked table
made executable; if a row changes, the document changes with it.

One rule is worth repeating outside the code: **`sameEngineKey` is exact and
must stay exact.** The engine's own `findExistingContact` forgives a
last-8-digit difference, which is right for a shared inbox and wrong for a
ledger — it can return a contact whose number is not the one you sent, and a
wrong link puts one person's spending against another's name.

## Using it

Both consumers pin a tag, so neither product can be changed from under the
other:

```
npm i github:Erpflow-dev/flashchat-core#v0.1.0
```

`dist/` is **committed**, deliberately. npm 12 blocks install scripts by
default (`allowScripts`), so a build-on-install `prepare` silently produces a
package with no `dist/` at all — and npm 10 would run it while npm 12 would
not, which is worse than either. Shipping the built output makes what
installs byte-identical to what was tested, under every npm.

The price is that `dist/` can drift from `src/`. `npm run verify` rebuilds
and fails if the tree is dirty; run it before tagging.

## Working on it

```
npm install
npm test        # builds, then runs the contract table
```

Releasing is a tag. Bump the version, tag it, push the tag, then move each
consumer's pin deliberately — never with a range.
