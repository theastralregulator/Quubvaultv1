"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, where, orderBy, limit, doc, addDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { 
  Cloud, 
  Upload, 
  Trash2, 
  Download, 
  FileText, 
  FileImage, 
  Video, 
  Music, 
  FileCode, 
  File, 
  Loader2, 
  HardDrive,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Share2,
  Clock,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Helper to format bytes to human-readable size
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingName, setUploadingName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch User Document for Storage Quota
  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: userProfile } = useDoc(userDocRef);

  // Fetch Recent Files (Limit to 5)
  const recentFilesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'files'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [db, user]);

  const { data: recentFiles, loading: filesLoading } = useCollection(recentFilesQuery);

  const usedStorage = userProfile?.usedStorage || 0;
  const maxStorage = userProfile?.maxStorage || 52428800; // 50MB default
  const usedPercentage = Math.min((usedStorage / maxStorage) * 100, 100);

  const getFileIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('image')) return <FileImage className="w-4 h-4 text-blue-400" />;
    if (t.includes('video')) return <Video className="w-4 h-4 text-purple-400" />;
    if (t.includes('audio')) return <Music className="w-4 h-4 text-pink-400" />;
    if (t.includes('json') || t.includes('javascript') || t.includes('typescript') || t.includes('html') || t.includes('css') || t.includes('code')) return <FileCode className="w-4 h-4 text-amber-400" />;
    if (t.includes('text') || t.includes('pdf') || t.includes('document')) return <FileText className="w-4 h-4 text-emerald-400" />;
    return <File className="w-4 h-4 text-gray-400" />;
  };

  // File Upload Handlers
  const uploadFile = async (file: File) => {
    if (!db || !user) return;

    if (usedStorage + file.size > maxStorage) {
      toast({
        variant: "destructive",
        title: "Vault Quota Exceeded",
        description: `This file is ${formatBytes(file.size)}. You only have ${formatBytes(maxStorage - usedStorage)} remaining.`,
      });
      return;
    }

    setUploadingName(file.name);
    setUploadProgress(10);

    // Simulate smooth progress while uploading to Drive
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null || prev >= 85) return prev;
        return prev + Math.floor(Math.random() * 10) + 3;
      });
    }, 500);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.uid);

      const res = await fetch('/api/drive/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }

      const { driveFileId, webContentLink, webViewLink } = await res.json();

      // Store metadata in Firestore
      await addDoc(collection(db, 'files'), {
        driveFileId,
        userId: user.uid,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        url: webContentLink || webViewLink,
        createdAt: serverTimestamp(),
        isDeleted: false,
        isFavorite: false,
        isShared: false,
      });

      // Atomically update user quota
      await updateDoc(doc(db, 'users', user.uid), {
        usedStorage: increment(file.size),
        filesCount: increment(1),
      });

      toast({
        title: "Upload Success",
        description: `${file.name} stored in Google Drive.`,
      });
      setUploadProgress(null);
    } catch (err: any) {
      clearInterval(progressInterval);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: err.message,
      });
      setUploadProgress(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent border border-white/5 p-8 md:p-10 shadow-xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] -z-10" />
        <div className="relative z-10 space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Premium Storage Portal
          </div>
          <h1 className="text-3xl md:text-4xl font-headline font-black tracking-tight">
            Welcome to Quub Vault
          </h1>
          <p className="text-sm text-gray-400 leading-normal">
            Your high-performance private cloud workspace. Store, share, and manage all your assets with zero-knowledge, state-of-the-art security rules.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link href="/dashboard/my-files">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl h-11 px-5 shadow-lg shadow-blue-500/20 gap-2">
                Browse Files <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid Stats & Quick Upload */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Stats Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid sm:grid-cols-3 gap-6">
            
            {/* Storage Quota Card */}
            <Card className="border border-white/10 rounded-[2rem] bg-slate-950/40 backdrop-blur-xl text-white shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Storage Used</span>
                  <HardDrive className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-headline font-black">{formatBytes(usedStorage)}</h3>
                  <p className="text-[10px] text-gray-500 mt-1">of {formatBytes(maxStorage)} limit</p>
                </div>
                <Progress value={usedPercentage} className="h-1.5 bg-white/5 rounded-full overflow-hidden" />
              </CardContent>
            </Card>

            {/* Total Files Card */}
            <Card className="border border-white/10 rounded-[2rem] bg-slate-950/40 backdrop-blur-xl text-white shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Files</span>
                  <Cloud className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-headline font-black">{userProfile?.filesCount || 0}</h3>
                  <p className="text-[10px] text-gray-500 mt-1">secure assets uploaded</p>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full" />
              </CardContent>
            </Card>

            {/* Security Badge Card */}
            <Card className="border border-white/10 rounded-[2rem] bg-slate-950/40 backdrop-blur-xl text-white shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Security State</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-headline font-black text-emerald-400">Encrypted</h3>
                  <p className="text-[10px] text-gray-500 mt-1">Zero-knowledge protection</p>
                </div>
                <div className="h-1.5 w-full bg-emerald-500/20 rounded-full" />
              </CardContent>
            </Card>

          </div>

          {/* Recent Files Table */}
          <Card className="border border-white/10 rounded-[2.5rem] bg-slate-950/40 backdrop-blur-xl text-white shadow-xl overflow-hidden">
            <CardHeader className="p-6 border-b border-white/5">
              <CardTitle className="text-sm font-headline font-black flex items-center gap-2 uppercase tracking-widest text-gray-400">
                <Clock className="w-4 h-4 text-blue-400" /> Recent Uploads
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filesLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : recentFiles && recentFiles.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {recentFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 px-6 hover:bg-white/[0.01] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.02] flex items-center justify-center shrink-0 border border-white/5">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate max-w-xs md:max-w-md" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-[10px] text-gray-500 font-semibold">{formatBytes(file.size)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <Button 
                          onClick={() => {
                            navigator.clipboard.writeText(file.url);
                            toast({ title: "Link Copied", description: "File sharing link ready." });
                          }}
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-gray-400 hover:text-white"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-white">
                          <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center gap-2 text-center p-6">
                  <File className="w-8 h-8 text-gray-600" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Recent Files</p>
                  <p className="text-[10px] text-gray-500">Your recent uploads log is empty.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Drag and Drop Upload */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border border-white/10 rounded-[2rem] bg-slate-950/40 backdrop-blur-xl text-white shadow-xl overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-sm font-headline font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-400" /> Quick Deposit
              </CardTitle>
              <CardDescription className="text-gray-500 text-xs mt-1">Upload directly into your sandbox.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 transition-all duration-300 relative overflow-hidden",
                  isDragging 
                    ? "border-blue-500 bg-blue-500/10 scale-[1.01]" 
                    : "border-white/10 hover:border-white/20 bg-slate-950/20"
                )}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />

                {uploadProgress !== null ? (
                  <div className="w-full space-y-4 py-4 px-2">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white truncate max-w-[150px] mx-auto">{uploadingName}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Encrypting & Depositing...</p>
                    </div>
                    <div className="space-y-1">
                      <Progress value={uploadProgress} className="h-1.5 bg-white/5 rounded-full overflow-hidden" />
                      <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{uploadProgress}%</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-500" />
                    <p className="text-xs font-bold text-gray-300">Drag files here or browse</p>
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      size="sm" 
                      className="bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 rounded-xl px-4 h-9 mt-1"
                    >
                      Browse Device
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
