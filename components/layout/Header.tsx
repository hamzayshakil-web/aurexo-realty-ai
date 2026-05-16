"use client";

import { Bell, Search, Menu, LogOut, Settings, User } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface HeaderProps {
  onMobileMenuOpen: () => void;
}

// Derive display name and initials from the Supabase user object
function getUserDisplay(user: { email?: string; user_metadata?: Record<string, string> } | null) {
  if (!user) return { name: "", initials: "?" };
  const fullName: string = user.user_metadata?.full_name ?? "";
  const name = fullName || user.email?.split("@")[0] || "User";
  const initials = fullName
    ? fullName
        .split(" ")
        .slice(0, 2)
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : (user.email?.[0] ?? "U").toUpperCase();
  return { name, initials };
}

export function Header({ onMobileMenuOpen }: HeaderProps) {
  const { user, isLoading, signOut } = useAuth();
  const { name, initials } = getUserDisplay(user);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur-sm px-4 lg:px-6">
      {/* Mobile menu trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0"
        onClick={onMobileMenuOpen}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>

      {/* Search */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads, properties…"
            className="pl-9 h-9 bg-muted/40 border-transparent focus:border-border focus:bg-background text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Mobile search */}
        <Button variant="ghost" size="icon" className="sm:hidden">
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}
          >
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[9px] bg-amber-500 text-white border-0">
              3
            </Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="font-semibold">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              { title: "New lead from website", time: "2 min ago", dot: "bg-blue-500" },
              { title: "Appointment reminder: Ahmed Al Mansouri", time: "1 hr ago", dot: "bg-amber-500" },
              { title: "Automation ran: Follow-up Sequence", time: "3 hr ago", dot: "bg-green-500" },
            ].map((n, i) => (
              <DropdownMenuItem key={i} className="flex items-start gap-3 py-3 cursor-pointer">
                <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${n.dot}`} />
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.time}</p>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-amber-600 font-medium justify-center">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        {isLoading ? (
          // Skeleton while auth state is hydrating
          <div className="flex items-center gap-2 px-2">
            <Skeleton className="h-7 w-7 rounded-full" />
            <div className="hidden md:block space-y-1">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-2 w-12" />
            </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "flex items-center gap-2 h-9 px-2 rounded-full"
              )}
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-amber-100 text-amber-700 text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold leading-none">{name}</p>
                <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="font-normal">
                <p className="font-semibold text-sm truncate">{name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Profile
              </DropdownMenuItem>
              <Link href="/settings">
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                onClick={signOut}
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
