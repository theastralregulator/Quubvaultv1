"use client";

import { useState, useEffect } from 'react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Loader2, 
  Crown, 
  Sparkles, 
  Mail, 
  HardDrive,
  ArrowLeft,
  Settings as SettingsIcon,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';

// Helper to format bytes to human-readable size
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profileData, loading: profileLoading } = useDoc(userRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Loading Vault Profile...</p>
        </div>
      </div>
    );
  }

  const usedStorage = profileData?.usedStorage || 0;
  const maxStorage = profileData?.maxStorage || 52428800; // 50MB default
  const usedPercentage = Math.min((usedStorage / maxStorage) * 100, 100);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'ultra': return <Crown className="w-6 h-6 text-purple-400" />;
      case 'pro': return <Sparkles className="w-6 h-6 text-indigo-400" />;
      default: return <HardDrive className="w-6 h-6 text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white pb-24 pt-8">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto px-6 max-w-4xl space-y-8">
        {/* Back and Edit Header */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <Link href="/dashboard/settings">
            <Button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl h-10 px-4 font-bold text-xs gap-2">
              <SettingsIcon className="w-4 h-4" /> Edit Settings
            </Button>
          </Link>
        </div>

        {/* Profile Card */}
        <Card className="border border-white/10 rounded-[2.5rem] bg-slate-950/40 backdrop-blur-xl text-white overflow-hidden shadow-xl">
          <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            <div className="relative">
              <Avatar className="w-32 h-32 rounded-3xl border-4 border-white/5 shadow-2xl">
                <AvatarImage src={profileData?.avatarUrl || user?.photoURL || `https://picsum.photos/seed/${user?.uid}/400`} />
                <AvatarFallback className="text-3xl font-black bg-blue-600 text-white">{profileData?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-white/10 p-2 rounded-2xl shadow-xl">
                {getTierIcon(profileData?.accountType || 'standard')}
              </div>
            </div>
            
            <div className="space-y-4 flex-1 text-center md:text-left">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <h2 className="text-3xl font-headline font-black tracking-tight">{profileData?.name || "New Member"}</h2>
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/5 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full">
                    {profileData?.accountType || 'Standard'} Tier
                  </Badge>
                </div>
                <p className="text-gray-400 font-medium">{profileData?.bio || "Zero-Knowledge Storage Vault User"}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-300">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-300">
                    Vault Active since {profileData?.createdAt?.seconds ? new Date(profileData.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Recently"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Details */}
        <div className="grid md:grid-cols-12 gap-8">
          <Card className="md:col-span-8 border border-white/10 rounded-[2rem] bg-slate-950/40 backdrop-blur-xl text-white overflow-hidden shadow-xl">
            <CardHeader className="p-6">
              <CardTitle className="text-lg font-headline font-black flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-blue-400" /> Storage Capacity Summary
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs mt-1">Real-time status of your secure cloud vault allocation.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Used Space</p>
                    <p className="text-2xl font-black mt-1">{formatBytes(usedStorage)}</p>
                  </div>
                  <p className="text-xs text-gray-400 font-semibold">of {formatBytes(maxStorage)} quota</p>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full" style={{ width: `${usedPercentage}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 text-center">
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Total Files</p>
                  <p className="text-xl font-black mt-1">{profileData?.filesCount || 0}</p>
                </div>
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Quota Utilization</p>
                  <p className="text-xl font-black mt-1 text-blue-400">{usedPercentage.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-4 border border-white/10 rounded-[2rem] bg-slate-950/40 backdrop-blur-xl text-white overflow-hidden shadow-xl flex flex-col justify-between">
            <CardHeader className="p-6">
              <CardTitle className="text-lg font-headline font-black flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Vault Security
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs mt-1">Your vault security parameters.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs space-y-1">
                <p className="text-gray-400 font-bold">UID Identity Key</p>
                <p className="font-mono text-[9px] text-gray-500 truncate">{user?.uid}</p>
              </div>
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/25 rounded-xl text-xs">
                <p className="font-bold text-emerald-400">Zero-Knowledge Sandbox</p>
                <p className="text-[11px] text-gray-400 mt-1 leading-normal">Your files are completely decoupled and isolated by custom security rules.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
