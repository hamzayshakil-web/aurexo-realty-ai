"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar */}
      <Sidebar
        isMobile
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="main-content flex flex-col">
        <Header onMobileMenuOpen={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 bg-muted/20">{children}</main>
      </div>
    </div>
  );
}
