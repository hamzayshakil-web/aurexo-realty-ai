"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveProfile } from "@/lib/actions/profile";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import type { UserProfile } from "@/lib/supabase/get-profile";
import { createClient } from "@/lib/supabase/client";

interface Props {
  profile: UserProfile | null;
  loginEmail: string;
}

const initial = { success: false, error: null };

export function SettingsForm({ profile, loginEmail }: Props) {
  const [state, action, pending] = useActionState(saveProfile, initial);
  const router = useRouter();

  useEffect(() => {
    if (!state.success) return;
    // Force a new JWT so auth metadata (name/initials) updates in the header
    createClient().auth.refreshSession().then(() => router.refresh());
  }, [state.success, router]);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            name="full_name"
            placeholder="Ahmed Al Mansouri"
            defaultValue={profile?.full_name ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="agency_name">Agency Name</Label>
          <Input
            id="agency_name"
            name="agency_name"
            placeholder="Aurexo Realty"
            defaultValue={profile?.agency_name ?? ""}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notification_email">
          Notification Email
          <span className="ml-1.5 text-xs text-muted-foreground font-normal">
            — lead &amp; appointment alerts sent here
          </span>
        </Label>
        <Input
          id="notification_email"
          name="notification_email"
          type="email"
          placeholder={loginEmail}
          defaultValue={profile?.notification_email ?? loginEmail}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="telegram_chat_id">
          Telegram Chat ID
          <span className="ml-1.5 text-xs text-muted-foreground font-normal">
            — optional, for instant Telegram alerts
          </span>
        </Label>
        <Input
          id="telegram_chat_id"
          name="telegram_chat_id"
          placeholder="e.g. 1473367211"
          defaultValue={profile?.telegram_chat_id ?? ""}
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      {state.success && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          Settings saved successfully.
        </div>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="bg-amber-500 hover:bg-amber-600 text-white"
      >
        {pending ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
        ) : (
          <><Save className="mr-2 h-4 w-4" /> Save Settings</>
        )}
      </Button>
    </form>
  );
}
