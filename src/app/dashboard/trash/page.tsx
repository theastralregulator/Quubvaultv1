"use client";

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy, doc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { useToast } from '@/hooks/use-toast';
import {
  Trash2,
  Loader2,
  RotateCcw,
  FileImage,
  Video,
  Music,
  FileCode,
  FileText,
  File,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const formatBytes = (bytes: number, decimals = 1) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function TrashPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const trashQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'files'),
      where('userId', '==', user.uid),
      where('isDeleted', '==', true),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: filesData, loading } = useCollection(trashQuery);

  const getFileIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('image')) return <FileImage className="w-4 h-4 text-blue-400/60" />;
    if (t.includes('video')) return <Video className="w-4 h-4 text-purple-400/60" />;
    if (t.includes('audio')) return <Music className="w-4 h-4 text-pink-400/60" />;
    if (t.includes('json') || t.includes('javascript') || t.includes('typescript') || t.includes('html') || t.includes('css') || t.includes('code')) return <FileCode className="w-4 h-4 text-amber-400/60" />;
    if (t.includes('text') || t.includes('pdf') || t.includes('document')) return <FileText className="w-4 h-4 text-emerald-400/60" />;
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const handleRestore = async (file: any) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'files', file.id), {
        isDeleted: false,
      });
      toast({
        title: "File Restored",
        description: `${file.name} has been restored to your vault.`,
      });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const handlePermanentDelete = async (file: any) => {
    if (!db || !user) return;
    setDeletingId(file.id);
    try {
      // Delete from Google Drive
      if (file.driveFileId) {
        await fetch('/api/drive/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ driveFileId: file.driveFileId }),
        });
      }
      // Delete Firestore document
      await deleteDoc(doc(db, 'files', file.id));
      // Decrement user quota
      await updateDoc(doc(db, 'users', user.uid), {
        usedStorage: increment(-file.size),
        filesCount: increment(-1),
      });
      toast({
        title: "Permanently Deleted",
        description: `${file.name} has been erased from the system.`,
      });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Deletion Error", description: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEmptyTrash = async () => {
    if (!db || !user || !filesData) return;
    try {
      for (const file of filesData) {
        // Delete from Google Drive
        if (file.driveFileId) {
          await fetch('/api/drive/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ driveFileId: file.driveFileId }),
          }).catch(() => {});
        }
        await deleteDoc(doc(db, 'files', file.id));
        await updateDoc(doc(db, 'users', user.uid), {
          usedStorage: increment(-file.size),
          filesCount: increment(-1),
        });
      }
      toast({ title: "Trash Emptied", description: "All trashed files have been permanently removed." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-6 md:p-8 space-y-6">

      {/* Title */}
      <div className="pb-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-black tracking-tight text-white flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-rose-500" /> Trash
          </h1>
          <p className="text-xs text-gray-400 mt-1">Files here are not deleted yet. Restore them or erase permanently.</p>
        </div>

        {filesData && filesData.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-xs font-bold uppercase tracking-wider border-rose-500/20 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl h-10 px-5 gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Empty Trash
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-950 border border-white/10 rounded-3xl text-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 font-headline text-white">
                  <AlertTriangle className="w-5 h-5 text-rose-500" /> Empty Entire Trash?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400 text-xs leading-relaxed">
                  This will permanently erase <strong className="text-white">{filesData.length} file{filesData.length !== 1 ? 's' : ''}</strong> and free up storage quota. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 rounded-xl text-xs font-bold uppercase">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleEmptyTrash}
                  className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase"
                >
                  Confirm — Empty Trash
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading trash...</p>
        </div>
      ) : !filesData || filesData.length === 0 ? (
        <Card className="border border-white/5 bg-slate-950/20 backdrop-blur-sm rounded-[2rem] p-12 text-center">
          <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-600">
            <Trash2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Trash is Empty</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Files you remove from "My Files" will appear here for review before permanent deletion.
          </p>
        </Card>
      ) : (
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-950/40 backdrop-blur-xl shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] text-gray-500 uppercase font-black tracking-widest bg-white/[0.01]">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-4">Size</th>
                <th className="py-4 px-4">Deleted</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filesData.map((file) => (
                <tr key={file.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group opacity-70 hover:opacity-100">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.02] flex items-center justify-center shrink-0 border border-white/5">
                        {getFileIcon(file.type)}
                      </div>
                      <span className="text-xs font-bold text-gray-400 truncate max-w-xs md:max-w-md block line-through decoration-gray-600">
                        {file.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs font-semibold text-gray-500">{formatBytes(file.size)}</td>
                  <td className="py-4 px-4 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    {file.createdAt?.seconds ? new Date(file.createdAt.seconds * 1000).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => handleRestore(file)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                        title="Restore"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10"
                            title="Permanently Delete"
                            disabled={deletingId === file.id}
                          >
                            {deletingId === file.id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />
                            }
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-950 border border-white/10 rounded-3xl text-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-headline text-white flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-rose-500" /> Delete Permanently?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400 text-xs leading-relaxed">
                              <strong className="text-white">{file.name}</strong> will be erased from the vault and storage forever. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 rounded-xl text-xs font-bold uppercase">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handlePermanentDelete(file)}
                              className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase"
                            >
                              Delete Forever
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
