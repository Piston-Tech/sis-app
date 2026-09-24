import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./globals.css";
import { GlobalProvider } from "./GlobalProvider";
import { QueryProvider } from "./QueryProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Academy Membership | Piston & Fusion Business Academy",
  description: "Premium Professional Training & Career Growth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Browser extensions (e.g. Grammarly) add attributes to <body> before
          React hydrates; don't report those as hydration errors */}
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}
        >
          <QueryProvider>
            <GlobalProvider>{children}</GlobalProvider>
          </QueryProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
