/**
 * Public links used by the student portal and the www landing page.
 *
 * Portal / foundation links are relative on purpose: on www the proxy
 * redirects `/app/*` to the app subdomain (keeping the current protocol) and
 * serves `/foundation` directly.
 */
export const PORTAL_SIGN_IN_PATH = "/app/auth";
export const FOUNDATION_PATH = "/foundation";

/** The academy's public website (programme catalogue). */
export const PROGRAMS_URL = "https://pistonandfusion.org/programs";
export const CONTACT_URL = "https://pistonandfusion.org/contact-us";

export const programLink = (title: string, link?: string | null) =>
  link || `${PROGRAMS_URL}?search=${encodeURIComponent(title)}`;

/** Optional support e-mail. Anything that depends on it is hidden when unset. */
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "";

/** Bank transfer details. The bank-transfer section is hidden unless all are set. */
export const BANK_DETAILS = {
  bankName: process.env.NEXT_PUBLIC_BANK_NAME || "",
  accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "",
  accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "",
};

export const hasBankDetails = Boolean(
  BANK_DETAILS.bankName && BANK_DETAILS.accountName && BANK_DETAILS.accountNumber,
);
