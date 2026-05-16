"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, CheckCircle2, AlertCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const BENEFITS = [
  "Manage unlimited leads & properties",
  "Connect n8n automation workflows",
  "Multi-agent team support",
  "Real-time pipeline analytics",
];

// ─── States the form can be in ────────────────────────────────────────────────
type FormState = "idle" | "loading" | "success";

export default function SignupPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFormState("loading");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setFormState("idle");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Store name + company in user_metadata (readable anywhere in the app)
        data: {
          full_name: `${firstName.trim()} ${lastName.trim()}`,
          company: company.trim(),
        },
        // After email confirmation, redirect to the OAuth callback handler
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setFormState("idle");
      return;
    }

    // If email confirmation is DISABLED in Supabase settings, the user is
    // immediately signed in. We redirect to dashboard.
    // If confirmation is ENABLED, we show the "check your email" screen below.
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      router.refresh();
      router.push("/dashboard");
    } else {
      setFormState("success");
    }
  }

  async function handleGoogleSignIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  // ── Email confirmation pending ─────────────────────────────────────────────
  if (formState === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-sm w-full text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/40 mx-auto mb-5">
            <Mail className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Check your email</h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            We&apos;ve sent a confirmation link to{" "}
            <span className="font-semibold text-foreground">{email}</span>.
            Click the link to activate your account.
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Didn&apos;t receive the email? Check your spam folder, or{" "}
            <button
              className="text-amber-600 hover:text-amber-700 font-medium underline"
              onClick={() => setFormState("idle")}
            >
              try again
            </button>
            .
          </p>
          <Link href="/login">
            <Button variant="outline" size="sm" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-foreground via-foreground to-neutral-800 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(245,158,11,0.15),_transparent_60%)]" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight">Aurexo</span>
            <span className="block text-white/50 text-[11px] tracking-widest uppercase leading-none">
              Realty AI
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="inline-block bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 text-amber-400 text-xs font-medium mb-5">
            14-day free trial — no credit card required
          </div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-4">
            Start closing more deals today.
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-8">
            Set up your AI-powered real estate CRM in minutes.
          </p>
          <ul className="space-y-3">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-white/80 text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-xl bg-white/5 border border-white/10 p-5">
          <p className="text-white/80 text-sm leading-relaxed mb-3">
            &ldquo;Aurexo cut our lead response time from 4 hours to under 5 minutes.
            Our conversion rate doubled.&rdquo;
          </p>
          <p className="text-white text-sm font-semibold">Sarah Mitchell</p>
          <p className="text-white/40 text-xs">Principal Broker, Aurexo Dubai</p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">Aurexo Realty AI</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              Get started with a 14-day free trial
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 px-4 py-3 mb-5">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="first-name" className="text-sm font-medium">
                  First name
                </Label>
                <Input
                  id="first-name"
                  placeholder="Sarah"
                  className="h-10"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={formState === "loading"}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last-name" className="text-sm font-medium">
                  Last name
                </Label>
                <Input
                  id="last-name"
                  placeholder="Mitchell"
                  className="h-10"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={formState === "loading"}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company" className="text-sm font-medium">
                Company / Agency name
              </Label>
              <Input
                id="company"
                placeholder="Aurexo Realty"
                className="h-10"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={formState === "loading"}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Work email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@yourcompany.com"
                className="h-10"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={formState === "loading"}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                className="h-10"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={formState === "loading"}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white h-10 font-medium"
              disabled={formState === "loading"}
            >
              {formState === "loading" ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Creating account…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account — It&apos;s Free
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-[11px] text-muted-foreground mt-4 leading-relaxed">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-amber-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-amber-600 hover:underline">
              Privacy Policy
            </a>
            .
          </p>

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
            disabled={formState === "loading"}
            type="button"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
