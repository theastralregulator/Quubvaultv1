"use client";

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { useToast } from '@/hooks/use-toast';
import { 
  Star, 
  Loader2, 
  Download,
  Share2,
  Trash2,
  FileImage,
  Video,
  Music,
  FileCode,
  FileText,
  File
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function FavoritesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const favoritesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'files'),
      where('userId', '==', user.uid),
      where('isFavorite', '==', true),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: filesData, loading } = useCollection(favoritesQuery);

  const getFileIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('image')) return <FileImage className="w-5 h-5 text-blue-400" />;
    if (t.includes('video')) return <Video className="w-5 h-5 text-purple-400" />;
    if (t.includes('audio')) return <Music className="w-5 h-5 text-pink-400" />;
    if (t.includes('json') || t.includes('javascript') || t.includes('typescript') || t.includes('html') || t.includes('css') || t.includes('code')) return <FileCode className="w-5 h-5 text-amber-400" />;
    if (t.includes('text') || t.includes('pdf') || t.includes('document')) return <FileText className="w-5 h-5 text-emerald-400" />;
    return <File className="w-5 h-5 text-gray-400" />;
  };

  const handleRemoveFavorite = async (file: any) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'files', file.id), {
        isFavorite: false
      });
      toast({
        title: "Removed from Favorites",
        description: `${file.name} is no longer marked as favorite.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  const handleShareFile = (file: any) => {
    navigator.clipboard.writeText(file.url);
    toast({
      title: "Link Copied",
      description: "Direct download URL copied to clipboard.",
    });
  };

  // Filter out any that might have been soft-deleted but are still favorite in cache
  const activeFavorites = useMemo(() => {
    if (!filesData) return [];
    return filesData.filter(file => !file.isDeleted);
  }, [filesData]);

  if (!mounted) return null;

  return (
    <div className="p-6 md:p-8 space-y-6">
      
      {/* Title */}
      <div className="pb-4 border-b border-white/5">
        <h1 className="text-2xl font-headline font-black tracking-tight text-white flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500" /> Favorites
        </h1>
        <p className="text-xs text-gray-400 mt-1">Access your most important starred files instantly.</p>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scanning favorites...</p>
        </div>
      ) : activeFavorites.length === 0 ? (
        <Card className="border border-white/5 bg-slate-950/20 backdrop-blur-sm rounded-[2rem] p-12 text-center">
          <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-500">
            <Star className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-white">No starred files</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Star important files from the "My Files" section to keep them bookmarked here.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {activeFavorites.map((file) => (
            <Card key={file.id} className="border border-white/10 rounded-2xl bg-slate-950/40 backdrop-blur-xl hover:border-blue-500/30 transition-all duration-300 overflow-hidden group shadow-lg">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                    {getFileIcon(file.type)}
                  </div>
                  
                  <Button 
                    onClick={() => handleRemoveFavorite(file)}
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg text-amber-500 hover:text-gray-400"
                    title="Remove Favorite"
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </Button>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors" title={file.name}>
                    {file.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-semibold">{formatBytes(file.size)}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                    {file.createdAt?.seconds ? new Date(file.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button onClick={() => handleShareFile(file)} variant="ghost" size="icon" className="h-6.5 w-6.5 rounded-md text-gray-400 hover:text-white p-0">
                      <Share2 className="w-3 h-3" />
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="h-6.5 w-6.5 rounded-md text-gray-400 hover:text-white p-0">
                      <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                        <Download className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}
