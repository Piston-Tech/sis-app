// CSRF protection for the same-origin /api route handlers.
//
// The session lives in httpOnly SameSite=Lax cookies, which browsers still
// attach to top-level cross-site POST navigations on some paths and to
// same-site (sibling subdomain) requests. So every mutating request must:
//   1. come from our own origin (Origin header, or Sec-Fetch-Site when a
//      browser omits Origin), and
//   2. carry a JSON body (Content-Type: application/json), which a plain
//      HTML form cannot send without a CORS preflight.

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Route prefixes that accept multipart uploads. None today; add a prefix
// here (e.g. "/api/admin/uploads") when a route really takes files.
export const MULTIPART_ROUTES: readonly string[] = [];

export type CsrfResult =
  { ok: true } | { ok: false; status: 403 | 415; error: string };

interface HeaderSource {
  get(name: string): string | null;
}

const hostsOf = (headers: HeaderSource): string[] =>
  [headers.get("host"), headers.get("x-forwarded-host")]
    .flatMap((value) => (value ? value.split(",") : []))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

const originHost = (origin: string): string | null => {
  try {
    const url = new URL(origin);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.host.toLowerCase()
      : null;
  } catch {
    return null;
  }
};

const hasBody = (headers: HeaderSource) => {
  const length = headers.get("content-length");
  if (length !== null) return length.trim() !== "0";
  return headers.get("transfer-encoding") !== null;
};

export const checkCsrf = ({
  method,
  pathname,
  headers,
}: {
  method: string;
  pathname: string;
  headers: HeaderSource;
}): CsrfResult => {
  if (SAFE_METHODS.has(method.toUpperCase())) return { ok: true };

  const forbidden = {
    ok: false,
    status: 403,
    error: "Cross-origin request blocked",
  } as const;

  const origin = headers.get("origin");
  if (origin) {
    // Browsers set Origin on every cross-origin and same-origin POST/PUT/
    // PATCH/DELETE; "null" (sandboxed iframes, file://) never matches.
    const host = originHost(origin);
    if (!host || !hostsOf(headers).includes(host)) return forbidden;
  } else if (headers.get("sec-fetch-site") !== "same-origin") {
    return forbidden;
  }

  if (hasBody(headers)) {
    const contentType = (headers.get("content-type") || "").toLowerCase();
    const isJson = /^application\/json\s*(;|$)/.test(contentType);
    const isMultipart =
      contentType.startsWith("multipart/form-data") &&
      MULTIPART_ROUTES.some(
        (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
      );

    if (!isJson && !isMultipart) {
      return {
        ok: false,
        status: 415,
        error: "Content-Type must be application/json",
      };
    }
  }

  return { ok: true };
};
