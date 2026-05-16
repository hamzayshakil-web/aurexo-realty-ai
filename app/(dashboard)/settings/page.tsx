import type { Metadata } from "next";
import { Settings, User, Bell, Send } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { getUserProfile } from "@/lib/supabase/get-profile";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings/SettingsForm";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getUserProfile();

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Settings"
        description="Manage your account and notification preferences"
        icon={Settings}
      />

      {/* Account Info — read-only */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <User className="h-4 w-4 text-amber-600" />
            </div>
            <h2 className="text-sm font-semibold">Account</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Login Email</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">User ID</p>
              <p className="text-xs font-mono text-muted-foreground">{user?.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile & Notifications — editable */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <Bell className="h-4 w-4 text-amber-600" />
            </div>
            <h2 className="text-sm font-semibold">Profile &amp; Notifications</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5 ml-12">
            Email and Telegram alerts for new leads and appointments will be sent to these addresses.
          </p>
          <SettingsForm profile={profile} loginEmail={user?.email ?? ""} />
        </CardContent>
      </Card>

      {/* Telegram setup tip */}
      <Card className="border-dashed">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Send className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1">How to get your Telegram Chat ID</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Open Telegram and search <span className="font-mono bg-muted px-1 rounded">@userinfobot</span></li>
                <li>Send it any message — it replies instantly with your Chat ID</li>
                <li>Paste that number in the Telegram Chat ID field above and save</li>
                <li>Done — you will now get instant Telegram alerts for every lead and appointment</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
