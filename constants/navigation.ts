import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  Zap,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Users, badge: 12 },
  { label: "Properties", href: "/properties", icon: Building2 },
  { label: "Appointments", href: "/appointments", icon: CalendarDays, badge: 3 },
  { label: "Automation", href: "/automation", icon: Zap },
  { label: "Settings", href: "/settings", icon: Settings },
];
