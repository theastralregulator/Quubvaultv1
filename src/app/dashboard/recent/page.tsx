"use client";

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  Loader2, 
  Download,
  Share2,
  FileImage,
  Video,
  Music,
  FileCode,
  FileText,
  File,
  ChevronRight
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

export default function RecentPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const recentQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'files'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [db, user]);

  const { data: filesData, loading } = useCollection(recentQuery);

  const getFileIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('image')) return <FileImage className="w-4 h-4 text-blue-400" />;
    if (t.includes('video')) return <Video className="w-4 h-4 text-purple-400" />;
    if (t.includes('audio')) return <Music className="w-4 h-4 text-pink-400" />;
    if (t.includes('json') || t.includes('javascript') || t.includes('typescript') || t.includes('html') || t.includes('css') || t.includes('code')) return <FileCode className="w-4 h-4 text-amber-400" />;
    if (t.includes('text') || t.includes('pdf') || t.includes('document')) return <FileText className="w-4 h-4 text-emerald-400" />;
    return <File className="w-4 h-4 text-gray-400" />;
  };

  const handleShareFile = (file: any) => {
    navigator.clipboard.writeText(file.url);
    toast({
      title: "Link Copied",
      description: "Direct download URL copied to clipboard.",
    });
  };

  const activeRecent = useMemo(() => {
    if (!filesData) return [];
    return filesData.filter(file => !file.isDeleted);
  }, [filesData]);

  if (!mounted) return null;

  return (
    <div className="p-6 md:p-8 space-y-6">
      
      {/* Title */}
      <div className="pb-4 border-b border-white/5">
        <h1 className="text-2xl font-headline font-black tracking-tight text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-indigo-400" /> Recent Files
        </h1>
        <p className="text-xs text-gray-400 mt-1">Quick access to the last 20 files modified or uploaded to your vault.</p>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scanning recent activity...</p>
        </div>
      ) : activeRecent.length === 0 ? (
        <Card className="border border-white/5 bg-slate-950/20 backdrop-blur-sm rounded-[2rem] p-12 text-center">
          <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-500">
            <Clock className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-white">No recent files</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Upload new documents, code files, or photos to populate this list.
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
                  <th className="py-4 px-4">Uploaded</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeRecent.map((file) => (
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
                    <td className="py-4 px-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {file.createdAt?.seconds ? new Date(file.createdAt.seconds * 1000).toLocaleString() : 'Recent'}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="text-[9px] border-white/5 bg-white/[0.01] uppercase tracking-normal">
                        {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button onClick={() => handleShareFile(file)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-white/5" title="Copy Link">
                          <Share2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-white hover:bg-white/5" title="Download">
                          <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                            <Download className="w-3.5 h-3.5" />
                          </a>
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
