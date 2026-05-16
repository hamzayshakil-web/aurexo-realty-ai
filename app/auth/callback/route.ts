import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles the OAuth and magic-link callback from Supabase.
 *
 * Supabase redirects here with a `code` after:
 *  - Google / social OAuth sign-in
 *  - Email confirmation clicks
 *  - Password-reset links
 *
 * We exchange the code for a session, then redirect the user to their
 * intended destination (defaulting to /dashboard).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  // `next` is set by our login page when triggering OAuth
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to the intended page after successful auth
      return NextResponse.redirect(new URL(next, origin));
    }

    // Exchange failed — redirect to login with an error hint
    return NextResponse.redirect(
      new URL("/login?error=auth_callback_failed", origin)
    );
  }

  // No code present — someone navigated here directly
  return NextResponse.redirect(new URL("/login", origin));
}
