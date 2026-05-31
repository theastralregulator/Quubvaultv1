"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Mail, Lock, User, AlertCircle, Cloud, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useAuth, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { 
  createUserWithEmailAndPassword, 
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    password: '',
  });

  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignUp = async () => {
    if (!auth || !db) return;
    setAuthError(null);
    
    if (!formData.email || !formData.password || !formData.fname) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields (Name, Email, and Password).",
      });
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      const fullName = `${formData.fname} ${formData.lname}`.trim();

      await updateProfile(user, {
        displayName: fullName
      });

      // Initialize cloud storage profile with 50MB default maxStorage (50 * 1024 * 1024 bytes)
      const userProfileData = {
        name: fullName,
        email: formData.email,
        usedStorage: 0,
        maxStorage: 52428800, // 50 MB
        filesCount: 0,
        createdAt: serverTimestamp()
      };

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, userProfileData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'create',
          requestResourceData: userProfileData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });

      toast({ title: "Welcome to Quub Vault", description: `Vault initialized successfully. Hello, ${formData.fname}!` });
      router.push('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/configuration-not-found') {
        setAuthError("Email/Password provider is not enabled in your Firebase Console.");
      } else {
        toast({ variant: "destructive", title: "Registration failed", description: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-[#030712] relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute -bottom-10 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[80px] -z-10" />

      <Card className="w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl bg-slate-950/40 backdrop-blur-xl text-white overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="space-y-4 pb-0 text-center pt-10 px-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-blue-600/20">
            <Cloud className="w-7 h-7 text-white animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-headline font-black tracking-tight text-white">
            Create your Vault
          </CardTitle>
          <CardDescription className="text-sm text-gray-400 font-medium">
            Initialize your free 50MB secure encrypted cloud vault.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-6 space-y-6">
          {authError && (
            <Alert variant="destructive" className="rounded-2xl border-destructive/50 bg-destructive/10 text-white">
              <AlertCircle className="h-4 w-4 text-rose-400" />
              <AlertTitle className="font-bold">Configuration Required</AlertTitle>
              <AlertDescription className="text-gray-300 text-xs">{authError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fname" className="text-xs font-black uppercase tracking-widest text-gray-300 ml-1">First Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    id="fname" 
                    value={formData.fname}
                    onChange={(e) => setFormData({...formData, fname: e.target.value})}
                    className="h-14 rounded-2xl bg-white/[0.03] border border-white/10 px-11 focus-visible:ring-blue-500 text-white placeholder-gray-500 focus:bg-white/[0.05] transition-all" 
                    placeholder="Jane" 
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lname" className="text-xs font-black uppercase tracking-widest text-gray-300 ml-1">Last Name</Label>
                <Input 
                  id="lname" 
                  value={formData.lname}
                  onChange={(e) => setFormData({...formData, lname: e.target.value})}
                  className="h-14 rounded-2xl bg-white/[0.03] border border-white/10 px-5 focus-visible:ring-blue-500 text-white placeholder-gray-500 focus:bg-white/[0.05] transition-all" 
                  placeholder="Doe" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-gray-300 ml-1">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="h-14 rounded-2xl bg-white/[0.03] border border-white/10 px-12 focus-visible:ring-blue-500 text-white placeholder-gray-500 focus:bg-white/[0.05] transition-all" 
                  placeholder="jane@example.com" 
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pass" className="text-xs font-black uppercase tracking-widest text-gray-300 ml-1">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                  id="pass" 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="h-14 rounded-2xl bg-white/[0.03] border border-white/10 px-12 focus-visible:ring-blue-500 text-white placeholder-gray-500 focus:bg-white/[0.05] transition-all" 
                  placeholder="••••••••" 
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl font-black text-base bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/10 hover:scale-[1.01] active:scale-95 transition-transform animate-pulse"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <span className="flex items-center justify-center gap-2">
                    Create Account <UserPlus className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-400">
            Already have an active vault? <Link href="/auth/signin" className="text-blue-400 font-black hover:underline">Sign In</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
