// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  const domain = process.env.DOMAIN_NAME;

  // Define allowed subdomains or ignore specific ones (e.g., www, localhost)
  //   const allowedDomains = [`api.${domain}`,`app.${domain}`, `admin.${domain}`]
  const allowedDomains: string[] = [];
  const currentHost = hostname.replace(`.${domain}`, "");

  console.log(domain);
  console.log(currentHost);

  if (allowedDomains.includes(hostname) || currentHost === "www") {
    return NextResponse.next();
  } else {
    const session = request.cookies.get("refreshToken")?.value;

    const adminSession = request.cookies.get("adminRefreshToken")?.value;

    // If trying to access protected routes without a session
    if (
      !session &&
      currentHost === "app" &&
      !request.nextUrl.pathname.startsWith("/auth")
    ) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    // If trying to access protected routes without a session
    if (
      !adminSession &&
      currentHost === "admin" &&
      !request.nextUrl.pathname.startsWith("/auth")
    ) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  // Rewrite to the subdirectory based on the subdomain
  // Example: sub.example.com/about -> /sub/about
  return NextResponse.rewrite(
    new URL(`/${currentHost}${url.pathname}${url.search}`, request.url),
  );
}

// Optionally, use a matcher to restrict when the proxy runs
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/admin/:path*",
    "/profile/:path*",
  ],
};
