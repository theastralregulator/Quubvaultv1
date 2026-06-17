"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useAuth } from '@/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, query, collection, where, orderBy, limit, updateDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { 
  Search, 
  Bell, 
  Menu, 
  LogOut, 
  Settings, 
  User as UserIcon, 
  HardDrive,
  CheckCircle2,
  Clock,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { ChangeProfilePhotoModal } from '@/components/ChangeProfilePhotoModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

// Helper to format bytes to human-readable size
const formatBytes = (bytes: number, decimals = 1) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

interface TopNavbarProps {
  onOpenMobileSidebar?: () => void;
}

function TopNavbarContent({ onOpenMobileSidebar }: TopNavbarProps) {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);

  // Sync avatar from localStorage on startup
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`quub_avatar_${user.uid}`);
      if (saved) {
        setLocalAvatarUrl(saved);
      }
    }
  }, [user]);

  const handleSaveAvatar = async (newPhotoUrl: string) => {
    if (!user || !db) return;
    
    // 1. Update in Firestore
    await updateDoc(doc(db, "users", user.uid), {
      avatarUrl: newPhotoUrl
    });

    // 2. Update in Firebase Auth
    await updateProfile(user, {
      photoURL: newPhotoUrl
    });

    // 3. Save to localStorage
    localStorage.setItem(`quub_avatar_${user.uid}`, newPhotoUrl);

    // 4. Update local state
    setLocalAvatarUrl(newPhotoUrl);
  };

  // Sync state with URL params
  useEffect(() => {
    setSearchValue(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch User Document for Storage Gauge
  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(userDocRef);

  // Fetch Notifications
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue.trim()) {
      params.set('search', searchValue.trim());
    } else {
      params.delete('search');
    }
    
    // Target files listing or current dashboard page
    let target = '/dashboard/my-files';
    if (pathname.startsWith('/dashboard/')) {
      target = pathname;
    }
    router.push(`${target}?${params.toString()}`);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    } catch (e) {
      console.error("Error marking notification as read", e);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/auth/signin');
    } catch (e) {
      console.error("Error signing out", e);
    }
  };

  if (!mounted) return null;

  const usedStorage = profile?.usedStorage || 0;
  const maxStorage = profile?.maxStorage || 52428800; // 50MB default
  const usedPercentage = Math.min((usedStorage / maxStorage) * 100, 100);

  return (
    <header className="h-20 bg-slate-950/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Mobile Menu trigger & Title */}
      <div className="flex items-center gap-4">
        {onOpenMobileSidebar && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onOpenMobileSidebar} 
            className="md:hidden text-gray-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        
        {/* Page title context (optional) */}
        <h2 className="hidden sm:block text-sm font-black uppercase tracking-widest text-gray-400">
          Vault Workspace
        </h2>
      </div>

      {/* Center Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search files, folders..."
            className="w-full bg-white/[0.03] border-white/5 pl-10 pr-4 rounded-xl text-xs text-white placeholder-gray-500 focus-visible:ring-1 focus-visible:ring-blue-500/50"
          />
        </div>
      </form>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Storage usage indicator */}
        <div className="hidden lg:flex flex-col gap-1.5 w-36">
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <span>Storage</span>
            <span className="text-gray-300 font-semibold">{formatBytes(usedStorage)} / {formatBytes(maxStorage)}</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" 
              style={{ width: `${usedPercentage}%` }} 
            />
          </div>
        </div>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white rounded-xl h-10 w-10 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05]">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-950 animate-pulse" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-slate-950 border border-white/10 text-white rounded-2xl p-2 shadow-2xl">
            <DropdownMenuLabel className="font-headline font-black text-xs uppercase tracking-widest text-gray-400 p-3 flex justify-between items-center">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} New
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            <ScrollArea className="h-[280px]">
              {notifications && notifications.length > 0 ? (
                <div className="space-y-1 p-1">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => handleMarkAsRead(n.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-colors flex items-start gap-3 ${n.read ? 'hover:bg-white/[0.02]' : 'bg-indigo-500/[0.03] border border-indigo-500/10 hover:bg-indigo-500/[0.05]'}`}
                    >
                      <div className="mt-0.5">
                        {n.read ? (
                          <CheckCircle2 className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-indigo-400" />
                        )}
                      </div>
                      <div className="space-y-1 flex-1">
                        <p className="text-xs font-semibold leading-normal">{n.message}</p>
                        <p className="text-[9px] text-gray-500 font-bold uppercase">
                          {n.createdAt?.seconds ? new Date(n.createdAt.seconds * 1000).toLocaleTimeString() : 'Just now'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-2">
                  <Bell className="w-8 h-8 text-gray-600" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Alerts</p>
                  <p className="text-[10px] text-gray-600">Your secure log is currently quiet.</p>
                </div>
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown */}
        <div className="relative flex items-center">
          <ProfileAvatar
            src={localAvatarUrl || profile?.avatarUrl || user?.photoURL}
            fallbackText={profile?.name || user?.email || "U"}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          />
          <ProfileDropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            profile={profile}
            email={user?.email}
            onChangePhotoClick={() => setIsModalOpen(true)}
            onSignOut={handleSignOut}
            usedStorage={usedStorage}
            maxStorage={maxStorage}
          />
        </div>

        {/* Change Profile Photo Modal */}
        <ChangeProfilePhotoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentPhotoUrl={localAvatarUrl || profile?.avatarUrl || user?.photoURL}
          fallbackText={profile?.name || user?.email || "U"}
          userId={user?.uid || ""}
          onSave={handleSaveAvatar}
        />
      </div>
    </header>
  );
}

export function TopNavbar({ onOpenMobileSidebar }: TopNavbarProps) {
  return (
    <Suspense fallback={
      <header className="h-20 bg-slate-950/40 border-b border-white/5 flex items-center justify-between px-6">
        <div className="w-10 h-10 bg-white/5 rounded-xl animate-pulse" />
        <div className="w-48 h-8 bg-white/5 rounded-xl animate-pulse" />
      </header>
    }>
      <TopNavbarContent onOpenMobileSidebar={onOpenMobileSidebar} />
    </Suspense>
  );
}
