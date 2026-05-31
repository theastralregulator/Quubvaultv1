"use client";

import { useState } from 'react';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-screen overflow-hidden bg-[#030712] text-white">
        {/* Desktop Sidebar (hidden on mobile) */}
        <Sidebar className="hidden md:flex" />

        {/* Mobile Sidebar (Sheet drawer) */}
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 bg-slate-950 border-r border-white/5 w-64 text-white">
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main Work Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Top Navbar */}
          <TopNavbar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

          {/* Dynamic Page Content */}
          <main className="flex-1 overflow-y-auto relative z-10">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
