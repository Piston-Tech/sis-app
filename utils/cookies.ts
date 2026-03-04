import { cookies } from "next/headers";

export const setCookie = async (
  key: string,
  value: string,
  age: number = 60 * 24, // Cookie expiration time (e.g., 1 day)
) => {
  return (await cookies()).set(key, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Ensure 'secure' is used in production
    maxAge: 60 * age,
    path: "/", // Cookie available across the whole application
    sameSite: "lax",
  });
};

export const getCookie = async (key: string) => {
  return (await cookies()).get(key)?.value;
};

export const deleteCookie = async (key: string) => {
  return (await cookies()).delete(key);
};
