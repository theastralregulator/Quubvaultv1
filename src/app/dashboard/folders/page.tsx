"use client";

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { 
  Folder, 
  FolderOpen, 
  ArrowLeft, 
  FileText, 
  FileImage, 
  Video, 
  Music, 
  FileCode, 
  File, 
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Helper to format bytes to human-readable size
const formatBytes = (bytes: number, decimals = 1) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

interface FolderCategory {
  id: string;
  name: string;
  matchTypes: string[];
  icon: any;
  color: string;
}

export default function FoldersPage() {
  const { user } = useUser();
  const db = useFirestore();

  const [mounted, setMounted] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all user files
  const filesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'files'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: files, loading } = useCollection(filesQuery);

  const folderCategories: FolderCategory[] = [
    { id: 'images', name: 'Images & Photos', matchTypes: ['image/'], icon: FileImage, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { id: 'videos', name: 'Videos & Movies', matchTypes: ['video/'], icon: Video, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { id: 'documents', name: 'Documents & PDFs', matchTypes: ['text/', 'pdf', 'document', 'msword', 'openxmlformats'], icon: FileText, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { id: 'audio', name: 'Music & Audio', matchTypes: ['audio/'], icon: Music, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
    { id: 'code', name: 'Developer Source', matchTypes: ['json', 'javascript', 'typescript', 'html', 'css', 'code', 'octet-stream'], icon: FileCode, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  ];

  // Group files into categories
  const groupedData = useMemo(() => {
    if (!files) return {};
    
    const groups: Record<string, any[]> = {
      images: [],
      videos: [],
      documents: [],
      audio: [],
      code: [],
      other: []
    };

    files.forEach(file => {
      const type = file.type.toLowerCase();
      let matched = false;
      
      for (const cat of folderCategories) {
        if (cat.matchTypes.some(mt => type.includes(mt))) {
          groups[cat.id].push(file);
          matched = true;
          break;
        }
      }

      if (!matched) {
        groups.other.push(file);
      }
    });

    return groups;
  }, [files]);

  const getFileIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('image')) return <FileImage className="w-4 h-4 text-blue-400" />;
    if (t.includes('video')) return <Video className="w-4 h-4 text-purple-400" />;
    if (t.includes('audio')) return <Music className="w-4 h-4 text-pink-400" />;
    if (t.includes('code')) return <FileCode className="w-4 h-4 text-amber-400" />;
    return <File className="w-4 h-4 text-gray-400" />;
  };

  if (!mounted) return null;

  const currentFolder = folderCategories.find(c => c.id === selectedFolderId) || (selectedFolderId === 'other' ? { id: 'other', name: 'Other Files', icon: File, color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' } : null);
  const currentFiles = selectedFolderId ? groupedData[selectedFolderId] || [] : [];

  return (
    <div className="p-6 md:p-8 space-y-6">
      
      {/* Title */}
      <div className="pb-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-black tracking-tight text-white flex items-center gap-2">
            <Folder className="w-6 h-6 text-blue-500" /> Virtual Folders
          </h1>
          <p className="text-xs text-gray-400 mt-1">Automatic type-categorization of all uploaded files.</p>
        </div>
        
        {selectedFolderId && (
          <Button 
            onClick={() => setSelectedFolderId(null)}
            variant="ghost" 
            className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white gap-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Back to folders
          </Button>
        )}
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Grouping files...</p>
        </div>
      ) : !selectedFolderId ? (
        /* Folder Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {folderCategories.map((folder) => {
            const count = groupedData[folder.id]?.length || 0;
            const sizeSum = groupedData[folder.id]?.reduce((sum, f) => sum + f.size, 0) || 0;
            const Icon = folder.icon;

            return (
              <Card 
                key={folder.id} 
                onClick={() => setSelectedFolderId(folder.id)}
                className="border border-white/10 rounded-3xl bg-slate-950/40 backdrop-blur-xl hover:border-blue-500/30 transition-all duration-300 cursor-pointer shadow-lg overflow-hidden group"
              >
                <CardContent className="p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${folder.color} shrink-0 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{folder.name}</h4>
                      <p className="text-[10px] text-gray-500 font-semibold mt-0.5">{count} files • {formatBytes(sizeSum)}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                </CardContent>
              </Card>
            );
          })}

          {/* Other Category */}
          {groupedData.other?.length > 0 && (
            <Card 
              onClick={() => setSelectedFolderId('other')}
              className="border border-white/10 rounded-3xl bg-slate-950/40 backdrop-blur-xl hover:border-blue-500/30 transition-all duration-300 cursor-pointer shadow-lg overflow-hidden group"
            >
              <CardContent className="p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-gray-500/20 bg-gray-500/10 text-gray-400 shrink-0 group-hover:scale-105 transition-transform">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Other Files</h4>
                    <p className="text-[10px] text-gray-500 font-semibold mt-0.5">{groupedData.other.length} files • {formatBytes(groupedData.other.reduce((sum, f) => sum + f.size, 0))}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Folder Contents File List */
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${currentFolder?.color}`}>
              {currentFolder && <currentFolder.icon className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{currentFolder?.name}</h2>
              <p className="text-[10px] text-gray-500 font-semibold uppercase">{currentFiles.length} files stored inside</p>
            </div>
          </div>

          {currentFiles.length === 0 ? (
            <Card className="border border-white/5 bg-slate-950/20 backdrop-blur-sm rounded-[2rem] p-12 text-center">
              <p className="text-xs text-gray-500">No files found inside this category.</p>
            </Card>
          ) : (
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-950/40 backdrop-blur-xl shadow-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] text-gray-500 uppercase font-black tracking-widest bg-white/[0.01]">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-4">Size</th>
                    <th className="py-4 px-4">Uploaded</th>
                    <th className="py-4 px-6 text-right">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {currentFiles.map((file) => (
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
                        {file.createdAt?.seconds ? new Date(file.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-white">
                          <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                            <ChevronRight className="w-4 h-4" />
                          </a>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
