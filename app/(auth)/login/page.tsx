"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

// ─── Login form (needs useSearchParams → must be inside Suspense) ─────────────

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Where to redirect after a successful login
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  // Error from the OAuth callback (e.g. ?error=auth_callback_failed)
  const callbackError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(callbackError ? "Authentication failed. Please try again." : "");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    // Refresh router cache so server components re-read the new session
    router.refresh();
    router.push(redirectTo);
  }

  async function handleGoogleSignIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Supabase redirects here after Google auth; we then redirect to `next`
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    });
  }

  return (
    <div className="w-full max-w-sm">
      {/* Mobile logo */}
      <div className="flex items-center gap-2.5 mb-10 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-sm tracking-tight">Aurexo Realty AI</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          Sign in to your account to continue
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 px-4 py-3 mb-5">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="h-10"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <a
              href="#"
              className="text-xs text-amber-600 hover:text-amber-700 font-medium"
            >
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="h-10"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white h-10 font-medium"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Signing in…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Sign In
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground tracking-wider">
            Or
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full h-10 text-sm font-medium"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        type="button"
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </Button>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-amber-600 hover:text-amber-700 font-medium"
        >
          Sign up free
        </Link>
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-500 to-orange-500 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,0,0,0.2),_transparent_70%)]" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight">Aurexo</span>
            <span className="block text-white/70 text-[11px] tracking-widest uppercase leading-none">
              Realty AI
            </span>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-3xl font-bold text-white leading-snug mb-4">
            Your entire real estate pipeline, automated.
          </h2>
          <p className="text-amber-100 text-base leading-relaxed mb-8">
            Welcome back. Let&apos;s close some deals today.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "248", label: "Active Leads" },
              { value: "AED 4.7M", label: "Monthly Revenue" },
              { value: "18", label: "Appointments This Week" },
              { value: "827", label: "Automations Run" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-4"
              >
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-amber-100 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-amber-200/60 text-xs">
          © 2026 Aurexo Realty AI. All rights reserved.
        </p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        {/* Suspense required because LoginForm uses useSearchParams() */}
        <Suspense
          fallback={
            <div className="w-full max-w-sm space-y-4 animate-pulse">
              <div className="h-8 bg-muted rounded w-40" />
              <div className="h-4 bg-muted rounded w-60" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
