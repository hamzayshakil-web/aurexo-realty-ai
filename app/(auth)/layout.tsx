import type { Metadata } from "next";

/**
 * Auth group layout.
 *
 * Login and signup pages are "use client" components and therefore cannot
 * export their own metadata. This server layout handles metadata for the
 * entire (auth) route group.
 */
export const metadata: Metadata = {
  title: {
    default: "Sign In",
    template: "%s | Aurexo Realty AI",
  },
  description: "Sign in or create your Aurexo Realty AI account.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
