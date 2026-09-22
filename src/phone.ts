// The contact identity key, shared by the POS bridge and the Flash Chat
// engine. Specified in POS docs/18-contact-contract.md §2 — read that before
// changing anything here, because both sides of a customer record are joined
// on what these functions return.
//
// The engine's canonical key is DIGITS ONLY: `phone.replace(/\D/g, '')`
// stored in `contacts.phone_normalized`, unique per account. It is not E.164
// and it never adds a country code of its own. So the rule is that a caller
// always hands over a fully-qualified international number, and these
// functions are how one is produced from whatever a cashier typed.

/** A country's international dialling code, digits only, no '+'. */
export type CountryCode = string;

/**
 * The markets the contract has been verified against.
 *
 * Adding a third means re-checking the claim in `normalizeForEngine` that no
 * national number begins with its own country code — see the note there.
 */
export const MARKET_COUNTRY_CODE = {
  /** Saudi Arabia. Mobiles start 5, landlines 1–4/6/7 — never 9. */
  sa: '966',
  /** Bangladesh. Mobiles start 1 — never 8. */
  bd: '880',
} as const;

export type Market = keyof typeof MARKET_COUNTRY_CODE;

/**
 * E.164 without the '+': 7–15 digits, never a leading zero. The same shape
 * the engine's own `isValidE164` enforces on `POST /v1/contacts`, so a value
 * that fails here would be refused there anyway.
 */
const ENGINE_KEY = /^[1-9]\d{6,14}$/;

/** True when `value` is already a usable engine key. */
export function isEngineKey(value: unknown): value is string {
  return typeof value === 'string' && ENGINE_KEY.test(value);
}

/**
 * Turn whatever was typed at the till into the engine's key, or null when it
 * cannot be one (empty, or the wrong shape — the caller then keeps a
 * POS-only customer and sends nothing).
 *
 * `tenantCC` is the shop's own country (docs/17 market config), used only
 * when the number was typed without one. A customer standing at the till
 * carries a local SIM, which is why the shop's country is the right default
 * and there is no per-customer country.
 */
export function normalizeForEngine(
  raw: unknown,
  tenantCC: CountryCode,
): string | null {
  if (typeof raw !== 'string') return null;
  if (!/^[1-9]\d{0,3}$/.test(tenantCC)) return null;

  const trimmed = raw.trim();
  // Read before the digits are stripped: a leading '+' means the caller has
  // already said which country, even when it is not ours.
  const typedPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return null;

  let key: string;
  if (typedPlus) {
    key = digits; // typed in full — trust it, foreign numbers included
  } else if (digits.startsWith('00')) {
    key = digits.slice(2); // 00 is the international prefix
  } else if (digits.startsWith('0')) {
    key = tenantCC + digits.slice(1); // trunk 0 — a local number
  } else if (digits.startsWith(tenantCC)) {
    // Already international. Safe to assume because no national number
    // begins with its own country code: Saudi mobiles start 5 and landlines
    // 1–4/6/7 (never 9), Bangladeshi mobiles start 1 (never 8). RE-CHECK
    // THIS CLAIM before adding a market whose numbers could collide.
    key = digits;
  } else {
    key = tenantCC + digits; // a bare national number
  }

  return isEngineKey(key) ? key : null;
}

/**
 * Whether two keys are the same number — EXACT equality, deliberately.
 *
 * Contact lookup often forgives a trunk-prefix difference by comparing only
 * the last digits of a number. That tolerance is right for a conversation —
 * a shared inbox should not split one person into two threads — and wrong for
 * a ledger, because it can return a record for a number that is not the one
 * you asked about, and a wrong link puts one person's spending against
 * another's name.
 *
 * So verify a match with this and never with a suffix comparison. On false,
 * do not store the link; send the pair to reconciliation.
 */
export function sameEngineKey(a: unknown, b: unknown): boolean {
  return isEngineKey(a) && isEngineKey(b) && a === b;
}
