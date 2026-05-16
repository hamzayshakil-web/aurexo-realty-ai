"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/constants/navigation";
import { Badge } from "@/components/ui/badge";
import { Building2, X } from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export function Sidebar({ isOpen, onClose, isMobile = false }: SidebarProps) {
  const pathname = usePathname();

  const content = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={isMobile ? onClose : undefined}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 shadow-sm">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-foreground tracking-tight">Aurexo</span>
            <span className="block text-[10px] text-muted-foreground leading-none tracking-widest uppercase">Realty AI</span>
          </div>
        </Link>
        {isMobile && (
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Main Menu
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobile ? onClose : undefined}
              className={cn(
                "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {item.label}
              </div>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "h-5 min-w-5 rounded-full px-1.5 text-[10px] font-semibold",
                    isActive
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">n8n Automation</p>
          <p className="text-[11px] text-amber-700/70 dark:text-amber-500/70 mt-0.5">
            Local Docker ready to connect
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-green-700 dark:text-green-400 font-medium">localhost:5678</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
        {/* Drawer */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border/50 shadow-xl transition-transform duration-300 ease-in-out lg:hidden",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {content}
        </aside>
      </>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col w-[var(--sidebar-width)] min-h-screen border-r border-border/50 bg-background shrink-0 sticky top-0">
      {content}
    </aside>
  );
}
