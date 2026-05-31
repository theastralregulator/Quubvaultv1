
"use client"

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  doc, 
  updateDoc, 
  deleteDoc, 
  where,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Briefcase, 
  AlertTriangle, 
  CheckCircle2, 
  Ban, 
  Trash2, 
  TrendingUp, 
  ShieldCheck, 
  Loader2,
  MoreVertical,
  Bell,
  Search,
  Check,
  X,
  FileText,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';

export default function AdminPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Fetch current user's profile to check role
  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }
    
    // Explicit elevation for requested user
    if (user?.email === 'sabinsaji3900@gmail.com') {
      setIsAdmin(true);
      if (profile && profile.role !== 'admin' && db) {
        updateDoc(doc(db, 'users', user.uid), { role: 'admin' });
      }
    } else if (profile) {
      setIsAdmin(profile.role === 'admin');
    }
  }, [user, authLoading, profile, router, db]);

  // Data Queries
  const usersQuery = useMemoFirebase(() => db ? query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50)) : null, [db]);
  const jobsQuery = useMemoFirebase(() => db ? query(collection(db, 'jobs'), orderBy('createdAt', 'desc'), limit(50)) : null, [db]);
  const reportsQuery = useMemoFirebase(() => db ? query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(50)) : null, [db]);

  const { data: allUsers, loading: usersLoading } = useCollection(usersQuery);
  const { data: allJobs, loading: jobsLoading } = useCollection(jobsQuery);
  const { data: allReports, loading: reportsLoading } = useCollection(reportsQuery);

  const handleVerifyUser = (userId: string, currentStatus: boolean) => {
    if (!db) return;
    updateDoc(doc(db, 'users', userId), { isVerified: !currentStatus });
    toast({ title: "User Updated", description: `Verification status changed.` });
  };

  const handleBanUser = (userId: string, currentStatus: boolean) => {
    if (!db) return;
    updateDoc(doc(db, 'users', userId), { isBanned: !currentStatus });
    toast({ variant: currentStatus ? "default" : "destructive", title: "User Updated", description: currentStatus ? "User unbanned." : "User has been banned." });
  };

  const handleApproveJob = (jobId: string) => {
    if (!db) return;
    updateDoc(doc(db, 'jobs', jobId), { status: 'approved' });
    toast({ title: "Job Approved", description: "The job is now visible to everyone." });
  };

  const handleDeleteJob = (jobId: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'jobs', jobId));
    toast({ variant: "destructive", title: "Job Deleted", description: "The posting has been removed." });
  };

  const handleResolveReport = (reportId: string) => {
    if (!db) return;
    updateDoc(doc(db, 'reports', reportId), { status: 'resolved' });
    toast({ title: "Report Resolved", description: "Case closed." });
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FE]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="font-bold text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FE] p-4">
        <Card className="max-w-md w-full rounded-[2.5rem] border-none shadow-2xl p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-destructive/10 rounded-[2rem] flex items-center justify-center mx-auto text-destructive">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black">Access Denied</h2>
            <p className="text-muted-foreground font-medium">You do not have the required permissions to access the admin panel.</p>
          </div>
          <Button onClick={() => router.push('/dashboard')} className="w-full h-14 rounded-2xl font-black">Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  const stats = [
    { label: "Total Users", value: allUsers?.length || 0, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Active Jobs", value: allJobs?.length || 0, icon: Briefcase, color: "text-indigo-600 bg-indigo-50" },
    { label: "Open Reports", value: allReports?.filter(r => r.status === 'open').length || 0, icon: AlertTriangle, color: "text-orange-600 bg-orange-50" },
    { label: "Verification Requests", value: allUsers?.filter(u => !u.isVerified).length || 0, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FE] pb-24 lg:pb-12 pt-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary text-white border-none rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest">Admin Control</Badge>
              <h1 className="text-4xl font-black tracking-tight">System Workspace</h1>
            </div>
            <p className="text-muted-foreground font-medium">Manage users, moderate content, and monitor platform health.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl h-12 gap-2 border-muted-foreground/20 bg-white">
              <TrendingUp className="w-4 h-4 text-primary" /> Reports
            </Button>
            <Button className="rounded-xl h-12 gap-2 shadow-xl shadow-primary/20">
              <Bell className="w-4 h-4" /> Notifications
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <Card key={i} className="border-none shadow-sm rounded-[2rem] bg-white group hover:shadow-md transition-all">
              <CardContent className="p-8 flex flex-col gap-4">
                <div className={cn("w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-transform group-hover:scale-110", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tight">{stat.value}</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="bg-white p-2 rounded-[2rem] border shadow-sm inline-flex w-full md:w-auto">
            <TabsList className="bg-transparent h-auto p-0 gap-1 flex-wrap md:flex-nowrap w-full">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'jobs', label: 'Jobs', icon: Briefcase },
                { id: 'reports', label: 'Reports', icon: AlertTriangle }
              ].map(tab => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-xl px-6 py-3 font-black text-sm transition-all flex items-center gap-2"
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                  <CardHeader className="p-10 pb-0">
                    <CardTitle className="text-2xl font-black">Recent Platform Activity</CardTitle>
                    <CardDescription className="font-medium">Latest users and jobs requiring attention.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10">
                     <div className="space-y-4">
                       {allUsers?.slice(0, 5).map(u => (
                         <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/30 transition-colors border border-transparent hover:border-muted/50">
                           <div className="flex items-center gap-4">
                             <Avatar className="w-12 h-12 rounded-xl border-2 border-white shadow-sm">
                               <AvatarImage src={u.avatarUrl || undefined} />
                               <AvatarFallback className="font-black bg-primary/10 text-primary">{u.name?.[0]}</AvatarFallback>
                             </Avatar>
                             <div>
                               <p className="font-black text-sm">{u.name}</p>
                               <p className="text-[10px] text-muted-foreground font-medium">{u.email}</p>
                             </div>
                           </div>
                           <div className="flex items-center gap-2">
                             {!u.isVerified && <Badge className="bg-orange-50 text-orange-600 border-none text-[9px] font-black uppercase tracking-tight">Pending Verification</Badge>}
                             {u.isBanned && <Badge variant="destructive" className="text-[9px] font-black uppercase">Banned</Badge>}
                           </div>
                         </div>
                       ))}
                     </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-4 space-y-8">
                <Card className="border-none shadow-none rounded-[2.5rem] bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white p-10">
                  <div className="space-y-6">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-black leading-tight">Security System Active</h3>
                    <p className="text-sm font-medium text-white/80 leading-relaxed">
                      All platform moderation tools are online. Proactive monitoring is scanning for spam and unauthorized content.
                    </p>
                    <Button variant="secondary" className="w-full h-14 rounded-2xl font-black text-primary">View Audit Log</Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white">
              <div className="p-8 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-12 h-12 rounded-xl bg-muted/30 border-none font-bold" placeholder="Search users by name or email..." />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="rounded-xl h-12 font-black text-xs border-muted-foreground/10">Export CSV</Button>
                </div>
              </div>
              <ScrollArea className="h-[600px]">
                <div className="p-0">
                   <table className="w-full text-left">
                     <thead className="bg-muted/20 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground sticky top-0 z-10">
                       <tr>
                         <th className="px-8 py-4">User</th>
                         <th className="px-8 py-4">Status</th>
                         <th className="px-8 py-4">Joined</th>
                         <th className="px-8 py-4 text-right">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-muted/10">
                       {allUsers?.map(u => (
                         <tr key={u.id} className="group hover:bg-muted/5 transition-colors">
                           <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                               <Avatar className="w-10 h-10 rounded-xl shadow-sm border border-muted/10">
                                 <AvatarImage src={u.avatarUrl || undefined} />
                                 <AvatarFallback className="font-bold text-xs">{u.name?.[0]}</AvatarFallback>
                               </Avatar>
                               <div className="flex flex-col">
                                 <span className="font-black text-sm group-hover:text-primary transition-colors">{u.name}</span>
                                 <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{u.userType}</span>
                               </div>
                             </div>
                           </td>
                           <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                               {u.isVerified ? 
                                 <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black uppercase flex items-center gap-1"><Check className="w-3 h-3" /> Verified</Badge> : 
                                 <Badge className="bg-orange-50 text-orange-600 border-none text-[9px] font-black uppercase">Unverified</Badge>
                               }
                               {u.isBanned && <Badge variant="destructive" className="text-[9px] font-black uppercase">Banned</Badge>}
                             </div>
                           </td>
                           <td className="px-8 py-6 text-[10px] font-bold text-muted-foreground uppercase">
                             {u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                           </td>
                           <td className="px-8 py-6 text-right">
                             <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted/50"><MoreVertical className="w-5 h-5" /></Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end" className="rounded-2xl w-48 p-2 border-muted/10 shadow-2xl">
                                 <DropdownMenuItem onClick={() => handleVerifyUser(u.id, u.isVerified)} className="rounded-xl font-bold py-3 gap-3">
                                   <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {u.isVerified ? 'Remove Verification' : 'Verify User'}
                                 </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => handleBanUser(u.id, u.isBanned)} className={cn("rounded-xl font-bold py-3 gap-3", u.isBanned ? "text-emerald-600" : "text-destructive")}>
                                   <Ban className="w-4 h-4" /> {u.isBanned ? 'Unban User' : 'Ban User'}
                                 </DropdownMenuItem>
                                 <div className="h-px bg-muted my-1" />
                                 <DropdownMenuItem className="rounded-xl font-bold py-3 gap-3 text-destructive hover:bg-destructive/5">
                                   <Trash2 className="w-4 h-4" /> Delete Account
                                 </DropdownMenuItem>
                               </DropdownMenuContent>
                             </DropdownMenu>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <div className="grid gap-6">
              {allJobs?.map(job => (
                <Card key={job.id} className="border-none shadow-sm rounded-[2.5rem] bg-white group hover:shadow-lg transition-all overflow-hidden">
                  <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                     <div className="flex items-center gap-6 w-full">
                        <div className="w-20 h-20 bg-muted/20 rounded-[1.75rem] flex items-center justify-center shrink-0 text-primary group-hover:scale-110 transition-transform">
                          <Briefcase className="w-10 h-10" />
                        </div>
                        <div className="space-y-2 flex-1">
                           <div className="flex items-center gap-3">
                             <h4 className="text-2xl font-black">{job.title}</h4>
                             {job.status === 'pending' && <Badge className="bg-orange-50 text-orange-600 border-none font-black text-[9px] uppercase">Pending Review</Badge>}
                           </div>
                           <div className="flex items-center gap-6 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                             <span className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> {job.employerName}</span>
                             <span className="flex items-center gap-2 font-black text-primary"><TrendingUp className="w-3.5 h-3.5" /> {job.budget}</span>
                             <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {job.createdAt?.seconds ? new Date(job.createdAt.seconds * 1000).toLocaleDateString() : 'Now'}</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                        {job.status === 'pending' && (
                          <Button onClick={() => handleApproveJob(job.id)} className="flex-1 md:flex-none h-14 rounded-2xl px-8 font-black bg-emerald-500 hover:bg-emerald-600 gap-2">
                             <Check className="w-4 h-4" /> Approve
                          </Button>
                        )}
                        <Button variant="outline" size="icon" className="rounded-2xl h-14 w-14 border-destructive/20 text-destructive hover:bg-destructive/5" onClick={() => handleDeleteJob(job.id)}>
                           <Trash2 className="w-5 h-5" />
                        </Button>
                     </div>
                  </CardContent>
                </Card>
              ))}
              {allJobs?.length === 0 && (
                <div className="text-center p-20 bg-white rounded-[2.5rem] border-dashed border-2">
                  <p className="font-bold text-muted-foreground">No job postings found.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid gap-6">
              {allReports?.map(report => (
                <Card key={report.id} className={cn("border-none shadow-sm rounded-[2.5rem] bg-white group hover:shadow-lg transition-all border-l-8", report.status === 'open' ? "border-l-orange-500" : "border-l-emerald-500")}>
                  <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <Badge className={cn("rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest", report.status === 'open' ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600")}>
                          {report.status} Report
                        </Badge>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{report.createdAt?.seconds ? new Date(report.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}</span>
                      </div>
                      <h4 className="text-xl font-black">{report.reason}</h4>
                      <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-2xl">{report.details}</p>
                      <div className="flex items-center gap-4 pt-2">
                         <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
                           Target: <span className="text-foreground">{report.targetType} ({report.targetId})</span>
                         </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {report.status === 'open' && (
                        <Button onClick={() => handleResolveReport(report.id)} className="h-14 rounded-2xl px-8 font-black bg-indigo-600 hover:bg-indigo-700">Resolve Case</Button>
                      )}
                      <Button variant="outline" className="h-14 rounded-2xl px-6 font-black border-muted-foreground/10" onClick={() => router.push(report.targetType === 'user' ? `/profile/${report.targetId}` : `/jobs`)}>View Target</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {allReports?.length === 0 && (
                <div className="text-center p-20 bg-white rounded-[2.5rem] border-dashed border-2">
                  <div className="max-w-xs mx-auto space-y-4">
                     <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                        <CheckCircle2 className="w-8 h-8" />
                     </div>
                     <p className="font-black text-xl">All Clear!</p>
                     <p className="text-muted-foreground font-medium">There are no pending reports or moderation requests at this time.</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
