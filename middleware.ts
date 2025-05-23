import { betterFetch } from "@better-fetch/fetch";
import type { auth as authConfigType } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Session = typeof authConfigType.$Infer.Session;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const urlClone = request.nextUrl.clone();

  // --- [1] Authentication for /dashboard paths ---
  if (pathname.startsWith("/dashboard")) {
    const { data: session } = await betterFetch<Session>(
      "/api/auth/get-session",
      {
        baseURL: request.nextUrl.origin,
        headers: { cookie: request.headers.get("cookie") || "" },
      }
    );

    if (!session) {
      // Redirect to /sign-in, preserving original request's host and protocol.
      // The /sign-in path itself is excluded from the matcher's broad rule to help avoid loops.
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    // If authenticated for /dashboard, allow request to proceed.
    // This assumes /dashboard is a global path not subject to subdomain site rewrite.
    return NextResponse.next();
  }

  // --- [2] Subdomain Rewriting Logic ---
  // This block executes for paths not starting with /dashboard, or if /dashboard auth passed
  // and NextResponse.next() was called (though the above block returns, effectively making this for non-/dashboard paths).

  const hostname = request.headers.get("host") || "";
  // Adjust sitemint.tech to your actual production root domain if different.
  const isRootDomain =
    hostname === "sitemint.tech" || hostname.startsWith("localhost");

  if (!isRootDomain) {
    const parts = hostname.split(".");
    // Expects subdomain.domain.tld (length 3+) or subdomain.localhost (length 2 for subdomain.localhost)
    const minPartsForSubdomain = hostname.includes("localhost")
      ? 2
      : (hostname.match(/\./g) || []).length >= 2
      ? 3
      : 2; // Heuristic for domain.tld vs domain.co.tld

    if (parts.length >= minPartsForSubdomain && parts[0] !== "www") {
      const subdomain = parts[0];

      // Ensure it's a valid subdomain and not already rewritten to /sites/
      if (subdomain && !pathname.startsWith("/sites/")) {
        // Exclude common static assets, API routes, etc., from subdomain rewrite.
        // The main `matcher` config already filters many of these.
        const excludedExtensions =
          /\.(js|css|ico|png|jpg|jpeg|svg|txt|json|map|webmanifest)$/i;
        const excludedPathPrefixes = [
          "/api/",
          "/_next/",
          "/static/",
          "/assets/",
        ];
        const rootFilesToExclude = ["/robots.txt", "/sitemap.xml"]; // Add any other root-specific files

        const isExcludedPath =
          excludedExtensions.test(pathname) ||
          excludedPathPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
          rootFilesToExclude.includes(pathname);

        if (!isExcludedPath) {
          urlClone.pathname = `/sites/${subdomain}${pathname}`;
          return NextResponse.rewrite(urlClone);
        }
      }
    }
  }

  // If not a dashboard path needing auth, and not a subdomain path needing rewrite, proceed.
  return NextResponse.next();
}

export const config = {
  matcher: [
    // This broad matcher allows the middleware to inspect most requests.
    // Exclude:
    // - The auth session API endpoint itself (to prevent fetch loops).
    // - Next.js internal static/image paths.
    // - Common static asset folders/files.
    // - The /sign-in page (to simplify auth redirect logic and prevent rewrite loops).
    "/((?!api/auth/get-session|_next/static|_next/image|assets|favicon.ico|sw.js|manifest.json|sign-in).*)",
  ],
};
