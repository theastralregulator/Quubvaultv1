"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { 
  FolderOpen, 
  Grid, 
  List, 
  Trash2, 
  Download, 
  Edit2, 
  FileText, 
  FileImage, 
  Video, 
  Music, 
  FileCode, 
  File, 
  Loader2, 
  ArrowUpDown,
  ExternalLink,
  MoreVertical,
  Share2,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

function MyFilesContent() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');

  // Search query from URL
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch User Files
  const filesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'files'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: filesData, loading: filesLoading } = useCollection(filesQuery);

  const getFileIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('image')) return <FileImage className="w-5 h-5 text-blue-400" />;
    if (t.includes('video')) return <Video className="w-5 h-5 text-purple-400" />;
    if (t.includes('audio')) return <Music className="w-5 h-5 text-pink-400" />;
    if (t.includes('json') || t.includes('javascript') || t.includes('typescript') || t.includes('html') || t.includes('css') || t.includes('code')) return <FileCode className="w-5 h-5 text-amber-400" />;
    if (t.includes('text') || t.includes('pdf') || t.includes('document')) return <FileText className="w-5 h-5 text-emerald-400" />;
    return <File className="w-5 h-5 text-gray-400" />;
  };

  // Soft Delete: Move File to Trash (Firestore only — Drive file kept until permanent delete)
  const handleMoveToTrash = async (file: any) => {
    if (!db || !user) return;
    try {
      await updateDoc(doc(db, 'files', file.id), { isDeleted: true });
      toast({ title: "Moved to Trash", description: `${file.name} moved to trash.` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  // Toggle Favorite (Firestore only)
  const handleToggleFavorite = async (file: any) => {
    if (!db) return;
    try {
      const newFavoriteState = !file.isFavorite;
      await updateDoc(doc(db, 'files', file.id), { isFavorite: newFavoriteState });
      toast({
        title: newFavoriteState ? "Added to Favorites" : "Removed from Favorites",
        description: `${file.name} updated.`,
      });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  // Rename File Logic
  const handleStartRename = (file: any) => {
    setEditingFileId(file.id);
    setNewFileName(file.name);
  };

  const handleSaveRename = async (fileId: string, file: any) => {
    if (!db || !newFileName.trim()) return;
    try {
      // Update Firestore metadata
      await updateDoc(doc(db, 'files', fileId), { name: newFileName.trim() });

      // Also rename in Google Drive if driveFileId is present
      if (file.driveFileId) {
        await fetch('/api/drive/rename', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ driveFileId: file.driveFileId, newName: newFileName.trim() }),
        });
      }

      setEditingFileId(null);
      toast({ title: "File Renamed", description: "File name updated successfully." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Rename Error", description: err.message });
    }
  };

  // Copy shareable link
  const handleShareFile = (file: any) => {
    navigator.clipboard.writeText(file.url);
    toast({
      title: "Link Copied",
      description: "Direct download URL copied to clipboard.",
    });
  };

  // Filter & Sort files
  const processedFiles = useMemo(() => {
    if (!filesData) return [];
    
    // Filter
    let filtered = filesData.filter(file => 
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !file.isDeleted
    );

    // Sort
    filtered.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'date' || !a.createdAt) {
        valA = a.createdAt?.seconds || 0;
        valB = b.createdAt?.seconds || 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [filesData, searchTerm, sortBy, sortOrder]);

  const toggleSort = (field: 'date' | 'size') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-headline font-black tracking-tight text-white flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-blue-500" /> My Files
          </h1>
          <p className="text-xs text-gray-400 mt-1">Manage, sort, and organize all files inside your secure vault.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => toggleSort('date')}
            variant="outline" 
            className="rounded-xl h-10 px-4 gap-2 border-white/5 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white"
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
          <Button 
            onClick={() => toggleSort('size')}
            variant="outline" 
            className="rounded-xl h-10 px-4 gap-2 border-white/5 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white"
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> Size {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>

          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-1 flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={cn("h-8 w-8 rounded-lg", viewMode === 'grid' ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('list')}
              className={cn("h-8 w-8 rounded-lg", viewMode === 'list' ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search results banner if search active */}
      {searchTerm && (
        <div className="bg-blue-500/5 border border-blue-500/10 p-3 rounded-xl flex items-center justify-between text-xs text-blue-400">
          <span>Found <strong>{processedFiles.length}</strong> matches for search query: "{searchTerm}"</span>
        </div>
      )}

      {/* Files Loading */}
      {filesLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scanning files...</p>
        </div>
      ) : processedFiles.length === 0 ? (
        <Card className="border border-white/5 bg-slate-950/20 backdrop-blur-sm rounded-[2rem] p-12 text-center">
          <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-500">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No files found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
            {searchTerm ? "No matching files found in your search. Try adjusting terms." : "Your vault is empty. Upload your first file to get started!"}
          </p>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {processedFiles.map((file) => (
            <Card key={file.id} className="border border-white/10 rounded-2xl bg-slate-950/40 backdrop-blur-xl hover:border-blue-500/30 transition-all duration-300 overflow-hidden group shadow-lg">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center relative">
                    {getFileIcon(file.type)}
                    {file.isFavorite && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 border border-slate-950">
                        <Star className="w-2.5 h-2.5 text-white fill-current" />
                      </div>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-950 border border-white/10 text-white rounded-xl p-1">
                      <DropdownMenuItem onClick={() => handleToggleFavorite(file)} className="focus:bg-white/5 cursor-pointer text-xs font-bold uppercase tracking-wider p-2 gap-2 text-gray-300">
                        <Star className={cn("w-3.5 h-3.5", file.isFavorite && "fill-amber-500 text-amber-500")} /> 
                        {file.isFavorite ? "Unfavorite" : "Favorite"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShareFile(file)} className="focus:bg-white/5 cursor-pointer text-xs font-bold uppercase tracking-wider p-2 gap-2 text-gray-300">
                        <Share2 className="w-3.5 h-3.5" /> Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStartRename(file)} className="focus:bg-white/5 cursor-pointer text-xs font-bold uppercase tracking-wider p-2 gap-2 text-gray-300">
                        <Edit2 className="w-3.5 h-3.5" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="focus:bg-white/5 cursor-pointer text-xs font-bold uppercase tracking-wider p-2 gap-2 text-gray-300">
                        <a href={`/api/drive/download?driveFileId=${file.driveFileId}&name=${encodeURIComponent(file.name)}`} download={file.name}>
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMoveToTrash(file)} className="focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer text-xs font-bold uppercase tracking-wider p-2 gap-2 text-rose-500">
                        <Trash2 className="w-3.5 h-3.5" /> Move to Trash
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-1">
                  {editingFileId === file.id ? (
                    <div className="flex items-center gap-2">
                      <Input 
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        className="h-8 bg-white/5 text-xs rounded-lg"
                      />
                      <Button size="sm" onClick={() => handleSaveRename(file.id)} className="h-8 px-2 bg-blue-600 hover:bg-blue-500 text-white text-xs">Save</Button>
                    </div>
                  ) : (
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors flex items-center gap-1.5" title={file.name}>
                      {file.name}
                    </h4>
                  )}
                  <p className="text-[10px] text-gray-500 font-semibold">{formatBytes(file.size)}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[9px] text-gray-500 uppercase font-bold tracking-wider">
                  <span>{file.createdAt?.seconds ? new Date(file.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}</span>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-white/5 bg-white/[0.01] uppercase tracking-normal">
                    {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List Layout */
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
                {processedFiles.map((file) => (
                  <tr key={file.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.02] flex items-center justify-center shrink-0 relative">
                          {getFileIcon(file.type)}
                          {file.isFavorite && (
                            <Star className="w-2.5 h-2.5 text-amber-500 fill-current absolute -top-1 -right-1" />
                          )}
                        </div>
                        {editingFileId === file.id ? (
                          <div className="flex items-center gap-2">
                            <Input 
                              value={newFileName}
                              onChange={(e) => setNewFileName(e.target.value)}
                              className="h-8 bg-white/5 text-xs rounded-lg"
                            />
                            <Button size="sm" onClick={() => handleSaveRename(file.id, file)} className="h-8 px-2 bg-blue-600 hover:bg-blue-500 text-white text-xs">Save</Button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-white truncate max-w-xs md:max-w-md block group-hover:text-blue-400 transition-colors" title={file.name}>
                            {file.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-gray-300">{formatBytes(file.size)}</td>
                    <td className="py-4 px-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {file.createdAt?.seconds ? new Date(file.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="text-[9px] border-white/5 bg-white/[0.01] uppercase tracking-normal">
                        {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button onClick={() => handleToggleFavorite(file)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-white/5" title="Toggle Favorite">
                          <Star className={cn("w-3.5 h-3.5", file.isFavorite && "fill-amber-500 text-amber-500")} />
                        </Button>
                        <Button onClick={() => handleShareFile(file)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-white/5" title="Copy Link">
                          <Share2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button onClick={() => handleStartRename(file)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-white hover:bg-white/5" title="Rename">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-white hover:bg-white/5" title="Download">
                          <a href={`/api/drive/download?driveFileId=${file.driveFileId}&name=${encodeURIComponent(file.name)}`} download={file.name}>
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                        <Button onClick={() => handleMoveToTrash(file)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10" title="Move to Trash">
                          <Trash2 className="w-3.5 h-3.5" />
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

export default function MyFilesPage() {
  return (
    <Suspense fallback={
      <div className="h-64 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Your Vault...</p>
      </div>
    }>
      <MyFilesContent />
    </Suspense>
  );
}
