
"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, MessageSquare, User, LayoutDashboard } from 'lucide-react';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useUser();

  if (!user || pathname.startsWith('/dashboard') || pathname.startsWith('/profile') || pathname === '/' || pathname.startsWith('/auth')) return null;

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Briefcase, label: 'Job', href: '/jobs' },
    { icon: MessageSquare, label: 'Message', href: '/messages' },
    { icon: User, label: 'Profile', href: '/profile/me' },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative",
              isActive ? "text-[#6366f1]" : "text-muted-foreground"
            )}
          >
            <Icon className={cn("w-6 h-6", isActive && "fill-[#6366f1]/10")} />
            <span className="text-[10px] font-black uppercase tracking-tight">{item.label}</span>
            {isActive && <div className="absolute bottom-0 w-8 h-1 bg-[#6366f1] rounded-t-full" />}
          </Link>
        );
      })}
    </nav>
  );
}
