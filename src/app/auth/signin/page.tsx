"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Mail, Lock, LogIn, Cloud, ArrowLeft, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { 
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleEmailSignIn = async () => {
    if (!auth) return;
    
    if (!formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter your email and password.",
      });
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      toast({ title: "Welcome to Quub Vault", description: "Successfully authenticated." });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Authentication Failed", 
        description: error.message || "Invalid email or password." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    if (!forgotEmail) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your registered email address.",
      });
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      toast({
        title: "Reset Email Sent",
        description: "Please check your inbox (and spam folder) for instructions.",
      });
      setShowForgot(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: error.message || "Failed to send password reset email."
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-[#030712] relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute -top-10 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[80px] -z-10" />

      <Card className="w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl bg-slate-950/40 backdrop-blur-xl text-white overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        
        {/* Toggle Forgot Password / Sign In View */}
        {!showForgot ? (
          <>
            <CardHeader className="space-y-4 pb-0 text-center pt-10 px-8">
              <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-blue-600/20">
                <Cloud className="w-7 h-7 text-white animate-pulse" />
              </div>
              <CardTitle className="text-3xl font-headline font-black tracking-tight text-white">
                Access your Vault
              </CardTitle>
              <CardDescription className="text-sm text-gray-400 font-medium">
                Enter your credentials to manage your personal cloud vault.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 pt-6 space-y-6">
              <form onSubmit={(e) => { e.preventDefault(); handleEmailSignIn(); }} className="space-y-5">
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
                      placeholder="name@example.com" 
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center pr-1">
                    <Label htmlFor="pass" className="text-xs font-black uppercase tracking-widest text-gray-300 ml-1">Password</Label>
                    <button 
                      type="button" 
                      onClick={() => setShowForgot(true)}
                      className="text-[10px] font-black uppercase tracking-wider text-blue-400 hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
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
                    className="w-full h-14 rounded-2xl font-black text-base bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/10 hover:scale-[1.01] active:scale-95 transition-transform"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <span className="flex items-center justify-center gap-2">
                        Sign In <LogIn className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </form>

              <p className="text-center text-sm text-gray-400">
                Don't have a vault yet? <Link href="/auth/signup" className="text-blue-400 font-black hover:underline">Sign Up</Link>
              </p>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-4 pb-0 text-center pt-10 px-8">
              <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-orange-500/20">
                <KeyRound className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-3xl font-headline font-black tracking-tight text-white">
                Forgot Password?
              </CardTitle>
              <CardDescription className="text-sm text-gray-400 font-medium">
                Enter your email address and we'll send you reset instructions.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 pt-6 space-y-6">
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-xs font-black uppercase tracking-widest text-gray-300 ml-1">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      id="reset-email" 
                      type="email" 
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="h-14 rounded-2xl bg-white/[0.03] border border-white/10 px-12 focus-visible:ring-blue-500 text-white placeholder-gray-500 focus:bg-white/[0.05] transition-all" 
                      placeholder="name@example.com" 
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <Button 
                    type="submit"
                    disabled={resetLoading}
                    className="w-full h-14 rounded-2xl font-black text-base bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/10 hover:scale-[1.01] active:scale-95 transition-transform"
                  >
                    {resetLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Email"}
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => setShowForgot(false)}
                    className="w-full h-14 rounded-2xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/5 gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Sign In
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
