"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FolderOpen, 
  UploadCloud, 
  Folder, 
  Star, 
  Clock, 
  Share2, 
  Trash2, 
  Settings,
  HardDrive,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  className?: string;
  onCloseMobile?: () => void;
}

export function Sidebar({ className, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Files', href: '/dashboard/my-files', icon: FolderOpen },
    { name: 'Upload', href: '/dashboard/upload', icon: UploadCloud },
    { name: 'Folders', href: '/dashboard/folders', icon: Folder },
    { name: 'Favorites', href: '/dashboard/favorites', icon: Star },
    { name: 'Recent Files', href: '/dashboard/recent', icon: Clock },
    { name: 'Shared Files', href: '/dashboard/shared', icon: Share2 },
    { name: 'Trash', href: '/dashboard/trash', icon: Trash2 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className={cn(
      "w-64 bg-slate-950/80 backdrop-blur-xl border-r border-white/5 h-screen flex flex-col justify-between py-6 px-4 shrink-0 relative",
      className
    )}>
      {/* Mobile close button inside sidebar if needed */}
      {onCloseMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCloseMobile} 
          className="absolute top-4 right-4 md:hidden text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </Button>
      )}

      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <HardDrive className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-headline font-black text-lg tracking-tight text-white flex items-center gap-1.5">
            Quub <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/25 px-1.5 py-0.5 rounded-md font-medium tracking-normal">Vault</span>
          </h1>
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Secure Storage</p>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Exact match for dashboard, startswith for others
          const isActive = item.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-xs uppercase tracking-wider relative group",
                isActive 
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-md shadow-blue-500/5" 
                  : "text-gray-400 hover:text-white hover:bg-white/[0.02] border border-transparent"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-500 rounded-r-full" />
              )}
              <Icon className={cn(
                "w-5 h-5 transition-transform duration-300 group-hover:scale-105", 
                isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"
              )} />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="pt-6 border-t border-white/5 px-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4.5 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase">System Status</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[11px] font-semibold text-gray-300">Fully Encrypted</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
