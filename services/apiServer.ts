import { deleteCookie, getCookie, setCookie } from "@/utils/cookies";
import { cookies } from "next/headers";
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

const apiServer: (
  props: ServerRequestProps,
) => Promise<ServerResponse> = async ({
  url,
  method = "GET",
  body,
  authenticateAs = "user",
}: ServerRequestProps) => {
  if (!backendUrl) {
    NextResponse.json({ error: "Backend URL not configured" }, { status: 500 });
  }

  const accessToken = await getUserAccessToken();
  const adminAccessToken = await getAdminAccessToken();

  const init: ServerRequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) init.body = JSON.stringify(body);
  if (authenticateAs)
    init.headers.Authorization = `Bearer ${authenticateAs === "user" ? accessToken : adminAccessToken}`;

  let response = await fetch(`${backendUrl}${url}`, init);

  if (response.status === 403 && !url?.includes("/refresh-token")) {
    console.log("403/401 error, attempting to refresh token...");
    const refreshSuccess = await (authenticateAs === "user"
      ? reAuthenticate()
      : reAuthenticateAdmin());
    // response = await (authenticateAs === "user"
    //   ? reAuthenticate(sendRequest)
    //   : reAuthenticateAdmin(sendRequest));
    if (refreshSuccess) {
      return await apiServer({
        url,
        method,
        body,
        authenticateAs,
      });
    } else {
      console.error("Refresh token failed. User needs to re-authenticate.");
    }
  }

  const res = await response.json();

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
  // } catch (error) {
  //   console.log(error);

  //   NextResponse.json({ error: "Internal server error" }, { status: 500 });
  //   throw error;
  // }
};

export const reAuthenticate: () => Promise<boolean> = async () => {
  const refreshToken = await getUserRefreshToken();

  try {
    const {
      data: { success },
    } = await apiServer({
      url: "/auth/refresh-token",
      method: "POST",
      body: { refreshToken },
    });

    if (!success) {
      logoutUser();
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

export const reAuthenticateAdmin: () => Promise<boolean> = async () => {
  const refreshToken = await getAdminRefreshToken();

  try {
    const { data } = await apiServer({
      url: "/admin/auth/refresh-token",
      method: "POST",
      body: { refreshToken },
    });

    console.log(data);

    if (!data.success) {
      logoutAdmin();
      return false;
    }

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

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

export const logoutAdmin = async () => {
  await deleteAdminAccessToken();
  await deleteAdminRefreshToken();
  await deleteAdminDetails();
};

export const logoutUser = async () => {
  await deleteUserAccessToken();
  await deleteUserRefreshToken();
  await deleteUserDetails();
};

export default apiServer;
