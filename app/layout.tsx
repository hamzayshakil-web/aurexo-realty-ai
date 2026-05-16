import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Aurexo Realty AI",
    template: "%s | Aurexo Realty AI",
  },
  description:
    "AI-powered Real Estate CRM and Automation Platform. Manage leads, properties, appointments and automate your sales pipeline.",
  keywords: ["real estate", "CRM", "AI", "automation", "property management", "Dubai"],
  authors: [{ name: "Aurexo Realty" }],
  metadataBase: new URL("https://aurexo.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {/*
          AuthProvider is a client component — perfectly valid inside a server layout.
          It listens to Supabase auth state and makes { user, session, signOut }
          available to all "use client" components via useAuth().
        */}
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
