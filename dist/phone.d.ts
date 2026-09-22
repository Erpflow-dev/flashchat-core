/** A country's international dialling code, digits only, no '+'. */
export type CountryCode = string;
/**
 * The markets the contract has been verified against.
 *
 * Adding a third means re-checking the claim in `normalizeForEngine` that no
 * national number begins with its own country code — see the note there.
 */
export declare const MARKET_COUNTRY_CODE: {
    /** Saudi Arabia. Mobiles start 5, landlines 1–4/6/7 — never 9. */
    readonly sa: "966";
    /** Bangladesh. Mobiles start 1 — never 8. */
    readonly bd: "880";
};
export type Market = keyof typeof MARKET_COUNTRY_CODE;
/** True when `value` is already a usable engine key. */
export declare function isEngineKey(value: unknown): value is string;
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
export declare function normalizeForEngine(raw: unknown, tenantCC: CountryCode): string | null;
/**
 * Whether two engine keys are the same number — EXACT equality, deliberately.
 *
 * The engine's own `phonesMatch` compares the last 8 digits so that a shared
 * inbox can forgive a trunk prefix, and `findExistingContact` uses it. That
 * tolerance is right for a conversation and wrong for a ledger: it can return
 * a contact whose number is not the one we sent, and a wrong link puts one
 * person's spending against another's name.
 *
 * So after upserting, verify with this — never with a suffix match. On false,
 * do not store the link; send the pair to reconciliation (docs/18 §2, §8).
 */
export declare function sameEngineKey(a: unknown, b: unknown): boolean;
