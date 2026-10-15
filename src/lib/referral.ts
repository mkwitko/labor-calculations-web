// Attribution for the referral program. A code picked up from a /r/:code link
// has to survive the trip to the signup form — the visitor may read the landing
// page, close the tab and come back days later.

const COOKIE_NAME = "jp_ref";
const TTL_DAYS = 90;

/**
 * Stores a referral code, first-touch: an existing code is never overwritten,
 * so the person who actually brought the visitor in keeps the credit even if a
 * second link is clicked later.
 */
export function storeReferralCode(code: string): void {
  const normalized = code.trim().toUpperCase();

  if (!normalized || readReferralCode()) return;

  const expires = new Date(
    Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toUTCString();

  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(normalized)};expires=${expires};path=/;SameSite=Lax`;
}

export function readReferralCode(): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`),
  );

  if (!match) return null;

  const value = decodeURIComponent(match[1]).trim().toUpperCase();

  return value || null;
}

export function clearReferralCode(): void {
  document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}
