"use client";

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  User,
  Lock,
  HardDrive,
  Loader2,
  Save,
  ShieldCheck,
  Mail,
  Crown,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const formatBytes = (bytes: number, decimals = 1) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function SettingsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profileData } = useDoc(userDocRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (profileData?.displayName) {
      setDisplayName(profileData.displayName);
    } else if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [profileData, user]);

  const usedStorage = profileData?.usedStorage || 0;
  const maxStorage = profileData?.maxStorage || 52428800;
  const usedPercentage = Math.min((usedStorage / maxStorage) * 100, 100);
  const filesCount = profileData?.filesCount || 0;
  const plan = profileData?.plan || 'Free';

  const handleSaveProfile = async () => {
    if (!db || !user) return;
    setSavingProfile(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim(),
      });
      toast({ title: "Profile Updated", description: "Your display name has been saved." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords don't match", description: "New password and confirmation must be identical." });
      return;
    }
    if (newPassword.length < 6) {
      toast({ variant: "destructive", title: "Too Short", description: "Password must be at least 6 characters." });
      return;
    }

    setSavingPassword(true);
    try {
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      if (!firebaseUser || !user.email) throw new Error("No authenticated user found.");

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, newPassword);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({ title: "Password Changed", description: "Your password has been updated successfully." });
    } catch (err: any) {
      const msg = err.code === 'auth/wrong-password' ? 'Current password is incorrect.' : err.message;
      toast({ variant: "destructive", title: "Password Error", description: msg });
    } finally {
      setSavingPassword(false);
    }
  };

  if (!mounted) return null;

  const initials = displayName
    ? displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-3xl mx-auto">

      {/* Title */}
      <div className="pb-4 border-b border-white/5">
        <h1 className="text-2xl font-headline font-black tracking-tight text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-500" /> Account Settings
        </h1>
        <p className="text-xs text-gray-400 mt-1">Manage your profile, security, and vault preferences.</p>
      </div>

      {/* Profile */}
      <Card className="border border-white/10 rounded-[2rem] bg-slate-950/40 backdrop-blur-xl shadow-xl overflow-hidden">
        <CardHeader className="p-6 border-b border-white/5">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Profile Info
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-5">
            <Avatar className="w-16 h-16 rounded-2xl border-2 border-white/10 shadow-lg">
              <AvatarImage src={user?.photoURL || ''} />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-lg rounded-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-bold text-white">{displayName || 'Unnamed User'}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3 h-3" /> {user?.email}
              </p>
              <Badge className="mt-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] uppercase tracking-widest">
                <Crown className="w-2.5 h-2.5 mr-1" /> {plan} Plan
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display-name" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Display Name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name..."
              className="bg-white/[0.03] border-white/10 text-white placeholder:text-gray-600 rounded-xl focus-visible:ring-blue-500 h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</Label>
            <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 h-11 text-sm text-gray-400">
              <Mail className="w-4 h-4 text-gray-600 shrink-0" />
              <span className="flex-1 truncate">{user?.email}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            </div>
            <p className="text-[10px] text-gray-600">Email address is managed by your authentication provider and cannot be changed here.</p>
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl h-11 px-6 gap-2"
          >
            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Storage */}
      <Card className="border border-white/10 rounded-[2rem] bg-slate-950/40 backdrop-blur-xl shadow-xl overflow-hidden">
        <CardHeader className="p-6 border-b border-white/5">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <HardDrive className="w-3.5 h-3.5" /> Vault Storage
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-semibold">Used Space</span>
              <span className="font-black text-white">{formatBytes(usedStorage)} / {formatBytes(maxStorage)}</span>
            </div>
            <Progress value={usedPercentage} className="h-2.5 bg-white/5 rounded-full overflow-hidden" />
            <p className="text-[10px] text-gray-500">
              {usedPercentage.toFixed(1)}% used — {formatBytes(maxStorage - usedStorage)} remaining
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Files Stored', value: filesCount.toString() },
              { label: 'Storage Quota', value: formatBytes(maxStorage) },
              { label: 'Current Plan', value: plan },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                <p className="text-lg font-black text-white">{value}</p>
                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {plan === 'Free' && (
            <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400" /> Upgrade to Pro
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Get 10 GB of storage, priority support, and advanced sharing.</p>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl h-9 px-5 shrink-0">
                Upgrade
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="border border-white/10 rounded-[2rem] bg-slate-950/40 backdrop-blur-xl shadow-xl overflow-hidden">
        <CardHeader className="p-6 border-b border-white/5">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" /> Change Password
          </CardTitle>
          <CardDescription className="text-[11px] text-gray-500 mt-1">
            Re-authentication required to change your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-white/[0.03] border-white/10 text-white placeholder:text-gray-600 rounded-xl h-11 focus-visible:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="bg-white/[0.03] border-white/10 text-white placeholder:text-gray-600 rounded-xl h-11 focus-visible:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="bg-white/[0.03] border-white/10 text-white placeholder:text-gray-600 rounded-xl h-11 focus-visible:ring-blue-500"
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
            variant="outline"
            className="border-white/10 bg-white/[0.02] text-white hover:bg-white/5 font-bold text-xs uppercase tracking-wider rounded-xl h-11 px-6 gap-2"
          >
            {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Update Password
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
