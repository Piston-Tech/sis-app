// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  const domain = process.env.NEXT_PUBLIC_DOMAIN_NAME;

  // Define allowed subdomains or ignore specific ones (e.g., www, localhost)
  //   const allowedDomains = [`api.${domain}`,`app.${domain}`, `admin.${domain}`]
  const allowedDomains: string[] = [];
  const currentHost = hostname.replace(`.${domain}`, "");

  if (
    allowedDomains.includes(hostname) ||
    currentHost === "www" ||
    hostname === domain
  ) {
    // The subdomain folders must never be served directly on www / the bare
    // domain (that would skip the session checks below): send them to their
    // own subdomain instead.
    const [first = "", ...rest] = url.pathname.split("/").filter(Boolean);
    let section: string;
    try {
      section = decodeURIComponent(first).toLowerCase();
    } catch {
      return new NextResponse(null, { status: 404 });
    }
    if (section === "admin" || section === "app") {
      if (!domain) return new NextResponse(null, { status: 404 });

      const protocol =
        request.headers.get("x-forwarded-proto")?.split(",")[0] ||
        url.protocol.replace(":", "");
      return NextResponse.redirect(
        `${protocol}://${section}.${domain}/${rest.join("/")}${url.search}`,
      );
    }

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
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/admin/:path*",
    "/app/:path*",
    "/profile/:path*",
  ],
};
