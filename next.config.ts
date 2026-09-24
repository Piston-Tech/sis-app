import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Google Identity Services (@react-oauth/google) loads its script, styles and
// iframes from accounts.google.com. LinkedIn sign-in is a popup to
// www.linkedin.com that redirects back to our own origin.
const GOOGLE_ACCOUNTS = "https://accounts.google.com";
const LINKEDIN = "https://www.linkedin.com";

const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js App Router injects inline bootstrap/RSC scripts (no nonce set
  // up); dev mode additionally needs eval for React Refresh.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${GOOGLE_ACCOUNTS}/gsi/client`,
  // Tailwind/next-font/motion inline styles + the GIS button stylesheet
  `style-src 'self' 'unsafe-inline' ${GOOGLE_ACCOUNTS}/gsi/style`,
  // Certificate/badge previews are data: URLs; downloads use blob: URLs
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${GOOGLE_ACCOUNTS} ${LINKEDIN}${isDev ? " ws: wss:" : ""}`,
  `frame-src ${GOOGLE_ACCOUNTS}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self' ${LINKEDIN}`,
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // GIS popups talk back to the opener via postMessage
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains",
        },
      ]),
];

const nextConfig: NextConfig = {
  // output: "standalone"
  poweredByHeader: false,
  // No remote image hosts: every next/image src is local or a data: URL.
  images: { remotePatterns: [] },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
