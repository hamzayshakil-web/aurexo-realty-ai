"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, Send } from "lucide-react";

const LOCATIONS = [
  "Dubai Marina", "Downtown Dubai", "Palm Jumeirah", "Jumeirah",
  "Business Bay", "DIFC", "Arabian Ranches", "Jumeirah Village Circle",
  "Dubai Hills Estate", "Emaar Beachfront", "Other",
];

const PROPERTY_TYPES = [
  "Apartment", "Villa", "Townhouse", "Penthouse",
  "Office", "Retail", "Land", "Other",
];

const BUDGET_RANGES = [
  { value: "under-1m",  label: "Under AED 1M" },
  { value: "1m-3m",     label: "AED 1M – 3M" },
  { value: "3m-5m",     label: "AED 3M – 5M" },
  { value: "5m-10m",    label: "AED 5M – 10M" },
  { value: "10m-plus",  label: "AED 10M+" },
];

export function InquiryForm() {
  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    budget_range: "", location: "", property_type: "", message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setErrorMsg("Please enter your name."); return; }
    if (!form.phone.trim() && !form.email.trim()) {
      setErrorMsg("Please enter your phone number or email."); return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/public/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("success");
    } catch (err) {
      setErrorMsg((err as Error).message);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold mb-2">Inquiry Received!</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Thank you! Our agent will review your requirements and contact you shortly.
          You'll receive a confirmation shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="inq-name">Full Name <span className="text-red-500">*</span></Label>
        <Input
          id="inq-name"
          placeholder="Ahmed Al Mansouri"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
        />
      </div>

      {/* Phone + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="inq-phone">Phone Number</Label>
          <Input
            id="inq-phone"
            placeholder="+971 50 123 4567"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inq-email">Email Address</Label>
          <Input
            id="inq-email"
            type="email"
            placeholder="ahmed@email.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-1.5">
        <Label htmlFor="inq-budget">Budget Range</Label>
        <select
          id="inq-budget"
          value={form.budget_range}
          onChange={(e) => set("budget_range", e.target.value)}
          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select budget range</option>
          {BUDGET_RANGES.map((b) => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>
      </div>

      {/* Location + Property Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="inq-location">Preferred Location</Label>
          <select
            id="inq-location"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select location</option>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inq-type">Property Type</Label>
          <select
            id="inq-type"
            value={form.property_type}
            onChange={(e) => set("property_type", e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select type</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <Label htmlFor="inq-message">Tell us more about what you're looking for</Label>
        <Textarea
          id="inq-message"
          placeholder="I'm looking for a 3-bedroom villa with a pool, preferably with a sea view..."
          rows={4}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
        />
      </div>

      {/* Error */}
      {errorMsg && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
      )}

      <Button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white h-11 text-base font-semibold shadow-md shadow-amber-200/50 dark:shadow-amber-900/30"
      >
        {status === "loading" ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Inquiry…</>
        ) : (
          <><Send className="mr-2 h-4 w-4" /> Send My Inquiry</>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        We respond within 1 hour during business hours. No spam, ever.
      </p>
    </form>
  );
}
