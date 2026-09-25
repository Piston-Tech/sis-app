import { getServerEnv } from "@/lib/env";
import { deleteCookie, getCookie, setCookie } from "@/utils/cookies";
import { headers } from "next/headers";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type AuthAudience = "admin" | "user";
export type JsonObject = Record<string, unknown>;

interface ServerRequestProps {
  /** Backend path including any query string, e.g. `/admin/students?page=2` */
  url: string;
  body?: unknown;
  method?: HttpMethod;
  authenticateAs?: AuthAudience | null;
}

/**
 * `data` is the parsed JSON body. For non-JSON responses (PDF/PNG downloads,
 * or an HTML error page from a proxy) `data` is `{}` and the raw body is in
 * `blob`.
 */
export interface ServerResponse<T = JsonObject> {
  data: T;
  blob?: Blob;
  response: Response;
}

interface ServerRequestInit extends RequestInit {
  headers: Record<string, string>;
}

// In-flight refresh calls keyed by the refresh token being exchanged, so
// parallel requests holding the same token share a single refresh call.
// Resolves to the rotated tokens, null if the backend rejected the refresh
// token, or undefined on a network/unexpected error.
type RefreshResult = { accessToken: string; refreshToken?: string } | null;
const refreshesInFlight = new Map<string, Promise<RefreshResult | undefined>>();

const NO_REFRESH_URLS = ["/refresh-token", "/auth/login", "/auth/logout"];

const getClientIp = async (): Promise<string | undefined> => {
  try {
    const incoming = await headers();
    const forwardedFor = incoming.get("x-forwarded-for")?.split(",")[0]?.trim();
    return forwardedFor || incoming.get("x-real-ip")?.trim() || undefined;
  } catch {
    // Called outside of a request scope
    return undefined;
  }
};

const isJsonResponse = (response: Response) =>
  !!response.headers.get("Content-Type")?.includes("application/json");

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value ? value : undefined;

const sendRequest = async <T>(
  { url, method = "GET", body, authenticateAs = "user" }: ServerRequestProps,
  retried: boolean,
  accessTokenOverride?: string,
): Promise<ServerResponse<T>> => {
  // Throws (and logs) when BACKEND_URL is missing/invalid
  const { BACKEND_URL } = getServerEnv();

  const init: ServerRequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  };

  if (body !== undefined && body !== null) init.body = JSON.stringify(body);

  const token =
    accessTokenOverride ??
    (authenticateAs === "user"
      ? await getUserAccessToken()
      : authenticateAs === "admin"
        ? await getAdminAccessToken()
        : undefined);
  if (token) init.headers.Authorization = `Bearer ${token}`;

  const clientIp = await getClientIp();
  if (clientIp) init.headers["X-Forwarded-For"] = clientIp;

  const response = await fetch(`${BACKEND_URL}${url}`, init);

  if (
    (response.status === 401 || response.status === 403) &&
    authenticateAs &&
    !retried &&
    !NO_REFRESH_URLS.some((path) => url.includes(path))
  ) {
    const newAccessToken = await refreshAccessToken(authenticateAs);

    if (newAccessToken) {
      return await sendRequest<T>(
        { url, method, body, authenticateAs },
        true,
        newAccessToken,
      );
    }
  }

  if (!isJsonResponse(response)) {
    return { data: {} as T, blob: await response.blob(), response };
  }

  const res = (await response.json().catch(() => ({}))) as JsonObject;
  const isAdminUrl = url.startsWith("/admin");

  const accessToken = asString(res.accessToken);
  if (accessToken) {
    await (isAdminUrl
      ? setAdminAccessToken(accessToken)
      : setUserAccessToken(accessToken));
  }

  const refreshToken = asString(res.refreshToken);
  if (refreshToken) {
    await (isAdminUrl
      ? setAdminRefreshToken(refreshToken)
      : setUserRefreshToken(refreshToken));
  }

  if (
    (url.includes("/auth/login") ||
      url.includes("/auth/me") ||
      url.includes("/auth/change-password")) &&
    res.user
  ) {
    await (isAdminUrl
      ? setAdminDetails(JSON.stringify(res.user))
      : setUserDetails(JSON.stringify(res.user)));
  }

  return { data: res as T, response };
};

const apiServer = <T = JsonObject>(
  props: ServerRequestProps,
): Promise<ServerResponse<T>> => sendRequest<T>(props, false);

const refreshTokens = (
  url: string,
  refreshToken: string,
): Promise<RefreshResult | undefined> => {
  const key = `${url}:${refreshToken}`;
  const inFlight = refreshesInFlight.get(key);
  if (inFlight) return inFlight;

  const promise = (async () => {
    try {
      const { data, response } = await sendRequest<JsonObject>(
        {
          url,
          method: "POST",
          body: { refreshToken },
          authenticateAs: null,
        },
        true,
      );

      const accessToken = asString(data.accessToken);
      if (response.ok && accessToken) {
        return { accessToken, refreshToken: asString(data.refreshToken) };
      }

      return response.status === 401 || response.status === 403
        ? null
        : undefined;
    } catch {
      return undefined;
    }
  })().finally(() => refreshesInFlight.delete(key));

  refreshesInFlight.set(key, promise);
  return promise;
};

// Exchanges the stored refresh token for new tokens and stores them in this
// request's cookies (the shared refresh may have run in a different request).
// Returns the new access token, or undefined if the refresh failed.
const refreshAccessToken = async (
  authenticateAs: AuthAudience,
): Promise<string | undefined> => {
  const isAdmin = authenticateAs === "admin";
  const refreshToken = await (isAdmin
    ? getAdminRefreshToken()
    : getUserRefreshToken());
  if (!refreshToken) return undefined;

  const tokens = await refreshTokens(
    isAdmin ? "/admin/auth/refresh-token" : "/auth/refresh-token",
    refreshToken,
  );

  if (tokens === null) {
    await (isAdmin ? logoutAdmin() : logoutUser());
    return undefined;
  }
  if (!tokens) return undefined;

  if (isAdmin) {
    await setAdminAccessToken(tokens.accessToken);
    if (tokens.refreshToken) await setAdminRefreshToken(tokens.refreshToken);
  } else {
    await setUserAccessToken(tokens.accessToken);
    if (tokens.refreshToken) await setUserRefreshToken(tokens.refreshToken);
  }

  return tokens.accessToken;
};

export const reAuthenticate: () => Promise<boolean> = async () =>
  !!(await refreshAccessToken("user"));

export const reAuthenticateAdmin: () => Promise<boolean> = async () =>
  !!(await refreshAccessToken("admin"));

const parseJsonCookie = <T>(value: string | undefined): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const setUserAccessToken = async (value: string) =>
  setCookie("accessToken", value, 15);
export const getUserAccessToken = async () => getCookie("accessToken");
export const deleteUserAccessToken = async () => deleteCookie("accessToken");

export const setUserRefreshToken = async (value: string) =>
  setCookie("refreshToken", value, 60 * 24 * 7);
export const getUserRefreshToken = async () => getCookie("refreshToken");
export const deleteUserRefreshToken = async () => deleteCookie("refreshToken");

export const setUserDetails = async (value: string) =>
  setCookie("userDetails", value, 60 * 24 * 7);
export const getUserDetails = async <T = JsonObject>(): Promise<T | null> =>
  parseJsonCookie<T>(await getCookie("userDetails"));
export const deleteUserDetails = async () => deleteCookie("userDetails");

export const setAdminAccessToken = async (value: string) =>
  setCookie("adminAccessToken", value, 15);
export const getAdminAccessToken = async () => getCookie("adminAccessToken");
export const deleteAdminAccessToken = async () =>
  deleteCookie("adminAccessToken");

export const setAdminRefreshToken = async (value: string) =>
  setCookie("adminRefreshToken", value, 60 * 24 * 7);
export const getAdminRefreshToken = async () => getCookie("adminRefreshToken");
export const deleteAdminRefreshToken = async () =>
  deleteCookie("adminRefreshToken");

export const setAdminDetails = async (value: string) =>
  setCookie("adminDetails", value, 60 * 24 * 7);
export const getAdminDetails = async <T = JsonObject>(): Promise<T | null> =>
  parseJsonCookie<T>(await getCookie("adminDetails"));
export const deleteAdminDetails = async () => deleteCookie("adminDetails");

const revokeRefreshToken = async (url: string, refreshToken?: string) => {
  if (!refreshToken) return;
  try {
    await apiServer({
      url,
      method: "POST",
      body: { refreshToken },
      authenticateAs: null,
    });
  } catch {
    // Best-effort: local cookies are cleared regardless
  }
};

export const logoutAdmin = async () => {
  await revokeRefreshToken("/admin/auth/logout", await getAdminRefreshToken());
  await deleteAdminAccessToken();
  await deleteAdminRefreshToken();
  await deleteAdminDetails();
};

export const logoutUser = async () => {
  await revokeRefreshToken("/auth/logout", await getUserRefreshToken());
  await deleteUserAccessToken();
  await deleteUserRefreshToken();
  await deleteUserDetails();
};

export default apiServer;
