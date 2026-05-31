
"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc, useCollection, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { 
  LogOut,
  ShieldAlert,
  Search,
  Bell,
  Clock,
  CheckCircle2,
  MapPin,
  ChevronDown,
  Navigation
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from '@/components/ui/scroll-area';
import { doc, query, collection, where, orderBy, limit, updateDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [location, setLocation] = useState<string>('Remote');

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/auth/signin');
    } catch (e) {
      console.error("Error signing out", e);
    }
  };

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(profileRef);

  // Notifications Query
  const notificationsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }, [db, user]);

  const { data: notifications } = useCollection(notificationsQuery);
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  useEffect(() => {
    setMounted(true);
    const checkLocation = () => {
      if (typeof window === 'undefined') return;
      const loc = localStorage.getItem('quub_location') || 'Remote';
      if (loc !== location) setLocation(loc);
    };

    const interval = setInterval(checkLocation, 2000);
    return () => clearInterval(interval);
  }, [location]);

  const updateLocation = (newLoc: string) => {
    setLocation(newLoc);
    if (typeof window !== 'undefined') {
      localStorage.setItem('quub_location', newLoc);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    } catch (e) {
      console.error("Error marking notification as read", e);
    }
  };

  const locations = [
    "Kerala", "Kochi", "Trivandrum", "Kozhikode", "Thrissur", "Kollam", 
    "Alappuzha", "Palakkad", "Malappuram", "Kannur", "Kottayam", 
    "Idukki", "Wayanad", "Pathanamthitta", "Kasaragod", "Tamil Nadu", 
    "Karnataka", "Maharashtra", "Delhi", "Remote"
  ];

  if (pathname === '/' || pathname === '/auth/signin' || pathname === '/auth/signup' || pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) {
    return null;
  }

  if (!mounted) return (
    <header className="sticky top-0 z-50 w-full bg-[#030712]/75 backdrop-blur-md border-b border-white/5 hidden md:block">
      <div className="container mx-auto px-4 flex h-20 items-center justify-between">
        <div className="w-10 h-10 bg-[#6366f1] rounded-xl" />
        <div className="h-6 w-64 bg-white/5 animate-pulse rounded-lg" />
      </div>
    </header>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-[#030712]/75 backdrop-blur-md border-b border-white/5 hidden md:block">
      <div className="container mx-auto px-4 flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 group-hover:scale-105 transition-transform shrink-0">
            <svg viewBox="0 0 32 32" className="w-full h-full text-[#6366f1] drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C8.268 2 2 8.268 2 16c0 3.018.956 5.811 2.584 8.102L2 30l6.09-2.436A13.938 13.938 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2z" fill="currentColor" />
              <circle cx="16" cy="16" r="6" fill="white" />
              <path d="M19 19l3 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-2xl font-headline font-black text-white tracking-tight">Quub</span>
        </Link>

        <div className="flex items-center gap-8">
          {user ? (
            <>
              <nav className="flex items-center gap-8">
                <Link href="/dashboard" className={cn("text-sm font-black transition-colors uppercase tracking-widest", pathname === '/dashboard' ? "text-[#6366f1]" : "text-muted-foreground hover:text-foreground")}>Dashboard</Link>
                <Link href="/jobs" className={cn("text-sm font-black transition-colors uppercase tracking-widest", pathname === '/jobs' ? "text-[#6366f1]" : "text-muted-foreground hover:text-foreground")}>Jobs Hub</Link>
                <Link href="/messages" className={cn("text-sm font-black transition-colors uppercase tracking-widest", pathname === '/messages' ? "text-[#6366f1]" : "text-muted-foreground hover:text-foreground")}>Messages</Link>
                {(profile?.role === 'admin' || user.email === 'sabinsaji3900@gmail.com') && (
                  <Link href="/admin" className={cn("text-sm font-black transition-colors uppercase tracking-widest flex items-center gap-1", pathname === '/admin' ? "text-orange-600" : "text-orange-500 hover:text-orange-600")}>
                    <ShieldAlert className="w-4 h-4" /> Admin
                  </Link>
                )}
              </nav>

              <div className="flex items-center gap-4 border-l pl-8 border-white/10">
                <Button variant="ghost" size="icon" className="rounded-2xl relative bg-white/5 hover:bg-white/10 text-white w-12 h-12 transition-all">
                  <Search className="w-5 h-5 text-gray-400" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-2xl relative bg-white/5 hover:bg-white/10 text-white w-12 h-12 transition-all">
                      <Bell className={cn("w-5 h-5 transition-colors", unreadCount > 0 ? "text-[#6366f1]" : "text-gray-400")} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-5 h-5 bg-[#6366f1] text-white text-[10px] flex items-center justify-center rounded-full border-2 border-slate-950 font-black animate-in fade-in zoom-in">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 rounded-3xl p-2 border-white/10 shadow-2xl bg-slate-950/95 backdrop-blur-xl">
                    <DropdownMenuLabel className="px-4 py-3 flex items-center justify-between">
                      <span className="font-black text-sm uppercase tracking-widest text-white">Notifications</span>
                      {unreadCount > 0 && <span className="text-[10px] bg-[#6366f1]/10 text-[#6366f1] px-2 py-0.5 rounded-full font-black">{unreadCount} New</span>}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <ScrollArea className="h-80">
                      {notifications && notifications.length > 0 ? (
                        <div className="space-y-1">
                          {notifications.map((notif) => (
                            <DropdownMenuItem 
                              key={notif.id} 
                              onClick={() => handleMarkAsRead(notif.id)}
                              className={cn(
                                "flex flex-col items-start gap-1 p-4 rounded-2xl cursor-pointer transition-colors",
                                !notif.read ? "bg-[#6366f1]/5 hover:bg-[#6366f1]/10 text-white" : "hover:bg-white/5 text-gray-300"
                              )}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className={cn("font-black text-sm", !notif.read ? "text-[#6366f1]" : "text-white")}>{notif.title}</span>
                                {!notif.read && <div className="w-2 h-2 bg-[#6366f1] rounded-full" />}
                              </div>
                              <p className="text-xs text-gray-400 font-medium line-clamp-2">{notif.message}</p>
                              <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold text-gray-500 uppercase tracking-tighter">
                                <Clock className="w-3 h-3" /> {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-black text-sm text-white">All caught up!</p>
                            <p className="text-[10px] font-medium text-gray-400">No new notifications at the moment.</p>
                          </div>
                        </div>
                      )}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-[1.25rem] border border-white/10 shadow-sm cursor-pointer hover:bg-white/10 transition-all group">
                      <div className="w-9 h-9 bg-[#6366f1]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MapPin className="w-4 h-4 text-[#6366f1]" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] leading-none mb-1">Location</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white">{location}</span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="rounded-2xl w-56 p-0 shadow-2xl overflow-hidden bg-slate-950 border-white/10">
                    <ScrollArea className="h-[300px] w-full p-2">
                      <DropdownMenuItem onClick={() => updateLocation('Remote')} className="rounded-xl font-bold py-3 px-4 gap-2 mb-1 text-white hover:bg-white/10">
                        <Navigation className="w-4 h-4 text-[#6366f1]" /> Global / Remote
                      </DropdownMenuItem>
                      <div className="h-px bg-white/10 my-1" />
                      {locations.map(loc => (
                        <DropdownMenuItem key={loc} onClick={() => updateLocation(loc)} className={cn("rounded-xl font-bold py-3 px-4 text-white hover:bg-white/10", location === loc && "bg-[#6366f1]/10 text-[#6366f1]")}>
                          {loc}
                        </DropdownMenuItem>
                      ))}
                      <div className="h-px bg-white/10 my-1" />
                      <DropdownMenuItem onClick={handleSignOut} className="rounded-xl font-bold py-3 px-4 gap-2 text-destructive focus:text-destructive hover:bg-destructive/10">
                        <LogOut className="w-4 h-4" /> Log Out
                      </DropdownMenuItem>
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-8">
              <Link href="/auth/signin" className="text-sm font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/auth/signup">
                <Button className="font-black rounded-[1.25rem] px-10 h-14 bg-[#6366f1] shadow-xl shadow-[#6366f1]/20 hover:scale-105 transition-all text-sm uppercase tracking-widest">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
