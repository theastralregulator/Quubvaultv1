'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  ArrowRight, 
  Shield, 
  Zap, 
  FolderGit2, 
  Share2, 
  Search, 
  Lock, 
  Cloud, 
  Eye, 
  HardDrive,
  Cpu,
  FileCode,
  FileImage,
  Video
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      title: "End-to-End Encryption",
      desc: "Your files are encrypted before leaving your device, ensuring maximum privacy and compliance.",
      icon: Shield,
      color: "from-blue-500 to-cyan-400"
    },
    {
      title: "Lightning-Fast Syncing",
      desc: "Powered by Firebase's edge networks for rapid, low-latency uploads and direct high-speed streaming.",
      icon: Zap,
      color: "from-amber-500 to-orange-400"
    },
    {
      title: "Smart Organization",
      desc: "Easily group, tag, search, and sort your vaults using clean grid and list layouts with live updates.",
      icon: FolderGit2,
      color: "from-indigo-500 to-purple-400"
    },
    {
      title: "Seamless Direct Links",
      desc: "Generate secure, instant download links for files to collaborate effortlessly with friends and colleagues.",
      icon: Share2,
      color: "from-emerald-500 to-teal-400"
    },
    {
      title: "Advanced Media Previews",
      desc: "Preview documents, images, and stream high-definition videos right from your web-based secure dashboard.",
      icon: Eye,
      color: "from-pink-500 to-rose-400"
    }
  ];

  const stats = [
    { label: "Secured Files", value: "24.5M+" },
    { label: "Active Vaults", value: "180k+" },
    { label: "Server Uptime", value: "99.99%" },
    { label: "User Rating", value: "4.9/5" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#030712] text-white selection:bg-blue-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#030712]/75 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all duration-300">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-headline font-black text-white tracking-tighter">
              Quub<span className="text-blue-500 font-medium">Vault</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost" className="text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 rounded-xl px-5 h-11">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl px-5 h-11 shadow-lg shadow-blue-600/25 transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -z-10" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-8 text-left">
              <div className="space-y-4">
                <Badge variant="outline" className="px-4 py-1.5 text-blue-400 bg-blue-500/5 rounded-full border-blue-500/30 text-xs font-black uppercase tracking-widest gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Introducing Quub Vault v2
                </Badge>
                <h1 className="text-5xl md:text-7xl font-headline font-black leading-[1.05] tracking-tight">
                  Next-Gen <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                    Secure Storage
                  </span> <br />
                  for Creators.
                </h1>
                <p className="text-lg md:text-xl text-gray-400 max-w-xl font-medium leading-relaxed pt-2">
                  Quub Vault delivers high-fidelity file storage with beautiful glassmorphic UI, military-grade folder rules, and instant media previews.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Link href="/auth/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 h-14 rounded-2xl font-black shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-500 gap-2 hover:scale-[1.02] active:scale-95 transition-all">
                    Create Free Vault <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/auth/signin" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-14 rounded-2xl font-bold border-white/10 hover:bg-white/5 hover:text-white transition-all text-gray-300">
                    Sign In
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-8 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Encrypted & Secure</p>
                    <p className="text-xs text-gray-400">Isolated Firebase Storage rules.</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">50MB Free Quota</p>
                    <p className="text-xs text-gray-400">Expandable personal storage tiers.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Dashboard Mockup (CSS Code Rendered) */}
            <div className="lg:col-span-6 relative hidden lg:block">
              <div className="w-full max-w-[560px] ml-auto glass-card rounded-[2rem] p-6 border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] relative z-20 transform hover:rotate-1 hover:-translate-y-1 transition-all duration-700">
                {/* Dashboard Mockup Top bar */}
                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500/80" />
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-500/80" />
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-xs text-gray-400 font-mono tracking-wider uppercase">Vault Dashboard</span>
                  </div>
                  <div className="h-6 px-3 rounded-full bg-white/5 border border-white/5 text-[10px] text-gray-400 flex items-center">
                    connected
                  </div>
                </div>

                {/* Storage quota display */}
                <div className="py-6 space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Storage Gauge</p>
                      <p className="text-lg font-black text-white mt-0.5">18.4 MB of 50 MB used</p>
                    </div>
                    <span className="text-xs font-semibold text-blue-400">36.8% Used</span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full" style={{ width: '36.8%' }} />
                  </div>
                </div>

                {/* Files Mockup Area */}
                <div className="space-y-4">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Recent Documents</p>
                  
                  {/* Item 1 */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
                        <FileImage className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">portfolio-hero.jpg</p>
                        <p className="text-xs text-gray-400">Image • 4.2 MB • Just now</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 bg-blue-500/10 text-blue-400 font-semibold rounded-lg border border-blue-500/20">Preview</span>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">intro-teaser.mp4</p>
                        <p className="text-xs text-gray-400">Video • 12.8 MB • 2 hrs ago</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 bg-purple-500/10 text-purple-400 font-semibold rounded-lg border border-purple-500/20">Preview</span>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                        <FileCode className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">firebase-config.json</p>
                        <p className="text-xs text-gray-400">JSON • 1.4 MB • 1 day ago</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 bg-amber-500/10 text-amber-400 font-semibold rounded-lg border border-amber-500/20">Preview</span>
                  </div>
                </div>
              </div>

              {/* Decorative Blur Backing */}
              <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-indigo-500/15 rounded-full blur-[80px] -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-20 border-y border-white/5 bg-[#050b1a]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-2">
                <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  {stat.value}
                </h3>
                <p className="text-xs font-black text-blue-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-32 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] -z-10" />
        
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-20">
            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full">
              Full-Scale Infrastructure
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Premium Core Utilities
            </h2>
            <p className="text-lg text-gray-400 font-medium">
              We've built a vault interface engineered for fast developer setups, elegant file sharing, and clean data segregation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="glass-card glass-card-hover rounded-[2rem] p-8 text-left space-y-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${f.color} p-0.5 shadow-lg`}>
                  <div className="w-full h-full bg-[#030712] rounded-[14px] flex items-center justify-center">
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-xl text-white">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[3rem] p-12 lg:p-20 text-center space-y-10 relative overflow-hidden shadow-2xl shadow-blue-500/10">
            {/* Radial overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_100%)]" />
            
            <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
                Secure your files <br className="hidden sm:inline" /> in the Quub Vault today.
              </h2>
              <p className="text-lg text-blue-100 font-medium">
                Experience high-performance client-side storage rules, lightning-fast previews, and an ultra-premium dark aesthetic. Start with 50MB free.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
                <Link href="/auth/signup" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 h-14 px-10 rounded-2xl font-black text-base shadow-xl">
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/auth/signin" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 h-14 px-10 rounded-2xl font-black text-base">
                    Access Vault
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#02050d] border-t border-white/5 py-12 text-sm text-gray-500">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/10">
              <Cloud className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-headline font-black text-white tracking-tighter">
              Quub<span className="text-blue-500 font-medium">Vault</span>
            </span>
          </div>
          <p className="text-xs">© 2026 Quub Vault. Engineered with premium glassmorphism. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs font-semibold text-gray-400">
            <Link href="/auth/signin" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
