import { deleteCookie, getCookie, setCookie } from "@/utils/cookies";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_URL;

interface ServerRequestProps {
  url?: string;
  body?: any;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  authenticateAs?: "admin" | "user" | null;
}

interface ServerRequestError {
  message: string;
  errorCode: number;
}

interface ServerResponse {
  data: any;
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

const sendRequest = async (
  { url, method = "GET", body, authenticateAs = "user" }: ServerRequestProps,
  retried: boolean,
  accessTokenOverride?: string,
): Promise<ServerResponse> => {
  if (!backendUrl) {
    const data = { error: "Backend URL not configured", success: false };
    return { data, response: NextResponse.json(data, { status: 500 }) };
  }

  const init: ServerRequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) init.body = JSON.stringify(body);

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

  const response = await fetch(`${backendUrl}${url}`, init);

  if (
    (response.status === 401 || response.status === 403) &&
    authenticateAs &&
    !retried &&
    !NO_REFRESH_URLS.some((path) => url?.includes(path))
  ) {
    const newAccessToken = await refreshAccessToken(authenticateAs);

    if (newAccessToken) {
      return await sendRequest(
        { url, method, body, authenticateAs },
        true,
        newAccessToken,
      );
    }
  }

  const res = await (response.headers.get("Content-Type")?.includes("application/json")
    ? response.json()
    : response.blob());

  if (res.accessToken) {
    if (url?.startsWith("/admin")) {
      await setAdminAccessToken(res.accessToken);
    } else {
      await setUserAccessToken(res.accessToken);
    }
  }

  if (res.refreshToken) {
    if (url?.startsWith("/admin")) {
      await setAdminRefreshToken(res.refreshToken);
    } else {
      await setUserRefreshToken(res.refreshToken);
    }
  }

  if ((url?.includes("/auth/login") || url?.includes("/auth/me")) && res.user) {
    if (url.startsWith("/admin")) {
      await setAdminDetails(JSON.stringify(res.user));
    } else {
      await setUserDetails(JSON.stringify(res.user));
    }
  }

  return { data: res, response };
};

const apiServer: (props: ServerRequestProps) => Promise<ServerResponse> = (
  props,
) => sendRequest(props, false);

const refreshTokens = (
  url: string,
  refreshToken: string,
): Promise<RefreshResult | undefined> => {
  const key = `${url}:${refreshToken}`;
  const inFlight = refreshesInFlight.get(key);
  if (inFlight) return inFlight;

  const promise = (async () => {
    try {
      const { data, response } = await sendRequest(
        {
          url,
          method: "POST",
          body: { refreshToken },
          authenticateAs: null,
        },
        true,
      );

      if (response.ok && data?.accessToken) {
        return { accessToken: data.accessToken, refreshToken: data.refreshToken };
      }

      return response.status === 401 || response.status === 403 ? null : undefined;
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
  authenticateAs: "admin" | "user",
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

export const setUserAccessToken = async (value: any) =>
  setCookie("accessToken", value, 15);
export const getUserAccessToken = async () => getCookie("accessToken");
export const deleteUserAccessToken = async () => deleteCookie("accessToken");

export const setUserRefreshToken = async (value: any) =>
  setCookie("refreshToken", value, 60 * 24 * 7);
export const getUserRefreshToken = async () => getCookie("refreshToken");
export const deleteUserRefreshToken = async () => deleteCookie("refreshToken");

export const setUserDetails = async (value: any) =>
  setCookie("userDetails", value, 60 * 24 * 7);
export const getUserDetails: () => Promise<any> = async () =>
  JSON.parse((await getCookie("userDetails")) || "null");
export const deleteUserDetails = async () => deleteCookie("userDetails");

export const setAdminAccessToken = async (value: any) =>
  setCookie("adminAccessToken", value, 15);
export const getAdminAccessToken = async () => getCookie("adminAccessToken");
export const deleteAdminAccessToken = async () =>
  deleteCookie("adminAccessToken");

export const setAdminRefreshToken = async (value: any) =>
  setCookie("adminRefreshToken", value, 60 * 24 * 7);
export const getAdminRefreshToken = async () => getCookie("adminRefreshToken");
export const deleteAdminRefreshToken = async () =>
  deleteCookie("adminRefreshToken");

export const setAdminDetails = async (value: any) =>
  setCookie("adminDetails", value, 60 * 24 * 7);
export const getAdminDetails: () => Promise<any> = async () =>
  JSON.parse((await getCookie("adminDetails")) || "null");
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
