"use client";

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Loader2, 
  Download,
  Link2,
  Trash2,
  FileImage,
  Video,
  Music,
  FileCode,
  FileText,
  File,
  EyeOff
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const formatBytes = (bytes: number, decimals = 1) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function SharedPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sharedQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'files'),
      where('userId', '==', user.uid),
      where('isShared', '==', true),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: filesData, loading } = useCollection(sharedQuery);

  const getFileIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('image')) return <FileImage className="w-4 h-4 text-blue-400" />;
    if (t.includes('video')) return <Video className="w-4 h-4 text-purple-400" />;
    if (t.includes('audio')) return <Music className="w-4 h-4 text-pink-400" />;
    if (t.includes('json') || t.includes('javascript') || t.includes('typescript') || t.includes('html') || t.includes('css') || t.includes('code')) return <FileCode className="w-4 h-4 text-amber-400" />;
    if (t.includes('text') || t.includes('pdf') || t.includes('document')) return <FileText className="w-4 h-4 text-emerald-400" />;
    return <File className="w-4 h-4 text-gray-400" />;
  };

  const handleDisableShare = async (file: any) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'files', file.id), {
        isShared: false
      });
      toast({
        title: "Link Disabled",
        description: `Public access link for ${file.name} is now disabled.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  const handleCopyLink = (file: any) => {
    navigator.clipboard.writeText(file.url);
    toast({
      title: "Link Copied",
      description: "Direct URL copied to clipboard.",
    });
  };

  const activeShared = useMemo(() => {
    if (!filesData) return [];
    return filesData.filter(file => !file.isDeleted);
  }, [filesData]);

  if (!mounted) return null;

  return (
    <div className="p-6 md:p-8 space-y-6">
      
      {/* Title */}
      <div className="pb-4 border-b border-white/5">
        <h1 className="text-2xl font-headline font-black tracking-tight text-white flex items-center gap-2">
          <Share2 className="w-6 h-6 text-emerald-400" /> Shared Links
        </h1>
        <p className="text-xs text-gray-400 mt-1">Manage public download URLs and secure shared keys generated from your sandbox.</p>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scanning active shares...</p>
        </div>
      ) : activeShared.length === 0 ? (
        <Card className="border border-white/5 bg-slate-950/20 backdrop-blur-sm rounded-[2rem] p-12 text-center">
          <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-500">
            <Share2 className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-white">No active shared links</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Copying links or sharing files from "My Files" will activate them, and they'll show up here for status management.
          </p>
        </Card>
      ) : (
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-950/40 backdrop-blur-xl shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-gray-500 uppercase font-black tracking-widest bg-white/[0.01]">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-4">Size</th>
                  <th className="py-4 px-4">Shared Link Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeShared.map((file) => (
                  <tr key={file.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.02] flex items-center justify-center shrink-0 border border-white/5">
                          {getFileIcon(file.type)}
                        </div>
                        <span className="text-xs font-bold text-white truncate max-w-xs md:max-w-md block group-hover:text-blue-400 transition-colors">
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-gray-300">{formatBytes(file.size)}</td>
                    <td className="py-4 px-4">
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] uppercase tracking-normal">
                        Active Public URL
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button onClick={() => handleCopyLink(file)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-white/5" title="Copy Link">
                          <Link2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button onClick={() => handleDisableShare(file)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10" title="Disable Share">
                          <EyeOff className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
