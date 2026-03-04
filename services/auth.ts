// import NextAuth from "next-auth";
// import { CredentialsSignin } from "next-auth";
// import Credentials from "next-auth/providers/credentials";

// export const { handlers, auth, signIn, signOut } = NextAuth({
//   providers: [
//     Credentials({
//       async authorize(credentials) {
//         // 1. Call your separate Express API
//         const res = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
//           method: "POST",
//           body: JSON.stringify(credentials),
//           headers: { "Content-Type": "application/json" },
//         });

//         const data = await res.json();

//         console.log("login api respone", data);

//         const { success, accessToken, refreshToken, user, message, error } =
//           data;

//         if (!res.ok || !success) {
//           // This string becomes the 'result.error' on the frontend
//           throw new CredentialsSignin(error || "Authentication failed");
//         }

//         // 2. If API returns a user, return it to NextAuth
//         if (res.ok && success) {
//           return { ...user, accessToken, refreshToken };
//         }
//         return null;
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user: data }) {
//       // 1. Initial Sign In: Store tokens from Express backend into the JWT

//       const { accessToken, refreshToken, ...user } = data;
//       if (data) {
//         return {
//           accessToken,
//           refreshToken,
//           accessTokenExpires: Date.now() + 15 * 60 * 1000, // converting to ms
//           user: user,
//         };
//       }

//       // 2. Return previous token if the access token has not expired yet
//       if (Date.now() < (token.accessTokenExpires as number)) {
//         return token;
//       }

//       // 3. Access token has expired, try to update it via Express Backend
//       return refreshAccessToken(token);
//     },
//     async session({ session, token }) {
//       session.accessToken = token.accessToken as string;
//       session.error = token.error as string; // Pass error to client (e.g., if refresh failed)
//       return session;
//     },
//   },
// });

// async function refreshAccessToken(token: any) {
//   try {
//     const response = await fetch(
//       `${process.env.BACKEND_URL}/auth/refresh-token`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ refreshToken: token.refreshToken }),
//       },
//     );

//     const res = await response.json();

//     if (!response.ok) throw res.error || "Failed to refresh access token";

//     const { accessToken, refreshToken } = res;

//     return {
//       ...token,
//       accessToken,
//       accessTokenExpires: Date.now() + 15 * 60 * 1000,
//       refreshToken: refreshToken ?? token.refreshToken, // Fallback to old if not provided
//     };
//   } catch (error) {
//     return { ...token, error: "RefreshAccessTokenError" };
//   }
// }
