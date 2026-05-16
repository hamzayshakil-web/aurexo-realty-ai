import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Routes that require an authenticated session.
 * Any sub-path (e.g. /leads/add, /leads/123) is also protected.
 */
const PROTECTED_PATHS = [
  "/dashboard",
  "/leads",
  "/properties",
  "/appointments",
  "/automation",
  "/settings",
];

/**
 * Routes that authenticated users should NOT see.
 * Visiting /login while logged in redirects to /dashboard.
 */
const AUTH_PATHS = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  // Start with a plain pass-through response.
  // We may replace this with a redirect below, or return it with refreshed cookies.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mirror cookies onto the request for this proxy pass
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Rebuild the response so the refreshed session cookies reach the browser
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() validates the JWT with Supabase servers and refreshes the
  // session if needed. Do NOT use getSession() here — it only reads the
  // cookie without verifying, which is insecure in proxy/middleware.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isAuthRoute = AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // ── Authenticated user on auth pages → send to dashboard ─────────────────
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── Unauthenticated user on protected pages → send to login ──────────────
  if (!user && isProtected) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the intended destination so we can redirect back after login
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Pass through (with refreshed session cookies if any) ─────────────────
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static  (Next.js static files)
     * - _next/image   (Next.js image optimization)
     * - favicon.ico
     * - Image/font extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
