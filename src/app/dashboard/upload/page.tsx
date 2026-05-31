"use client";

import { useState, useEffect, useRef } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { collection, doc, addDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { useToast } from '@/hooks/use-toast';
import { 
  UploadCloud, 
  Loader2, 
  HardDrive,
  CheckCircle2,
  File,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

interface UploadHistoryItem {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'completed' | 'failed';
  progress: number;
}

export default function UploadPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadList, setUploadList] = useState<UploadHistoryItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: userProfile } = useDoc(userDocRef);

  const usedStorage = userProfile?.usedStorage || 0;
  const maxStorage = userProfile?.maxStorage || 52428800;
  const usedPercentage = Math.min((usedStorage / maxStorage) * 100, 100);

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

    const tempId = Math.random().toString(36).substring(2, 15);

    setUploadList(prev => [{
      id: tempId,
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0
    }, ...prev]);

    // Simulate upload progress (Drive API doesn't expose streaming progress)
    const progressInterval = setInterval(() => {
      setUploadList(prev => prev.map(item =>
        item.id === tempId && item.progress < 85
          ? { ...item, progress: item.progress + Math.floor(Math.random() * 12) + 3 }
          : item
      ));
    }, 400);

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

      // Update user quota
      await updateDoc(doc(db, 'users', user.uid), {
        usedStorage: increment(file.size),
        filesCount: increment(1),
      });

      setUploadList(prev => prev.map(item =>
        item.id === tempId ? { ...item, status: 'completed', progress: 100 } : item
      ));

      toast({
        title: "Upload Success",
        description: `${file.name} securely stored in Google Drive.`,
      });
    } catch (err: any) {
      clearInterval(progressInterval);
      setUploadList(prev => prev.map(item =>
        item.id === tempId ? { ...item, status: 'failed' } : item
      ));
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: err.message,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => uploadFile(file));
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
    if (e.dataTransfer.files) {
      Array.from(e.dataTransfer.files).forEach(file => uploadFile(file));
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      
      {/* Title */}
      <div className="pb-4 border-b border-white/5">
        <h1 className="text-2xl font-headline font-black tracking-tight text-white flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-blue-500" /> Upload Files
        </h1>
        <p className="text-xs text-gray-400 mt-1">Securely upload files directly to your Google Drive vault.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Upload Zone */}
        <div className="md:col-span-8 space-y-6">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center gap-6 transition-all duration-300 relative overflow-hidden h-[350px]",
              isDragging 
                ? "border-blue-500 bg-blue-500/10 scale-[1.01]" 
                : "border-white/10 hover:border-white/20 bg-slate-950/20 backdrop-blur-sm"
            )}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              multiple 
              className="hidden" 
            />

            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <UploadCloud className="w-8 h-8 text-white animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Drag & drop files here</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Files are stored privately in your Google Drive vault, indexed in Firestore.
              </p>
            </div>

            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl h-11 px-6 shadow-lg shadow-blue-600/10"
            >
              Browse Files
            </Button>
          </div>

          {/* Session Uploads History */}
          {uploadList.length > 0 && (
            <Card className="border border-white/10 rounded-[2rem] bg-slate-950/40 backdrop-blur-xl text-white shadow-xl overflow-hidden">
              <CardHeader className="p-6 border-b border-white/5">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Session uploads history
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-white/5">
                {uploadList.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 px-6 gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.02] flex items-center justify-center shrink-0 border border-white/5">
                        <File className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-xs font-bold text-white truncate">{item.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">{formatBytes(item.size)}</span>
                          {item.status === 'uploading' && (
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{item.progress}%</span>
                          )}
                        </div>
                        {item.status === 'uploading' && (
                          <Progress value={item.progress} className="h-1 bg-white/5 rounded-full overflow-hidden" />
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {item.status === 'completed' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      )}
                      {item.status === 'failed' && (
                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                      )}
                      {item.status === 'uploading' && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Stats Sidebar */}
        <div className="md:col-span-4 space-y-6">
          <Card className="border border-white/10 rounded-[2rem] bg-slate-950/40 backdrop-blur-xl text-white shadow-xl">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-400" /> Space Remaining
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Used Percentage</span>
                  <span className="text-xs font-semibold text-gray-300">{usedPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={usedPercentage} className="h-2 bg-white/5 rounded-full overflow-hidden" />
              </div>

              <div className="pt-4 border-t border-white/5 text-xs space-y-2 text-gray-400">
                <div className="flex justify-between">
                  <span>Used Space:</span>
                  <strong className="text-white font-semibold">{formatBytes(usedStorage)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Available Quota:</span>
                  <strong className="text-white font-semibold">{formatBytes(maxStorage - usedStorage)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Maximum Limit:</span>
                  <strong className="text-white font-semibold">{formatBytes(maxStorage)}</strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
