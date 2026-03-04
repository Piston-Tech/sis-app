import NextAuth, { DefaultSession } from "next-auth";
import Student from "./Student";

declare module "next-auth" {
  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `authorize` callback.
   */
  interface User {
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    user: Omit<Student, "passwordHash">;
    // persona?: string
    // membershipTier?: string
  }

  /**
   * The `session` object returned by `auth()`, `useSession()`, etc.
   */
  interface Session {
    accessToken?: string;
    error?: string;
    user: DefaultSession["user"] & Omit<Student, "passwordHash">;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    // accessTokenExpires?: number
    persona?: string;
    membershipTier?: string;
    error?: string;
  }
}
