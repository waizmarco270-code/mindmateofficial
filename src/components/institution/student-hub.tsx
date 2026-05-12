'use client';

import { useInstitution } from '@/hooks/use-institution';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    School, Target, Zap, 
    ShieldCheck, Gem, Trophy, 
    Clock, MessageSquare, Plus,
    X, CheckCircle, ShieldAlert,
    LayoutDashboard, History, Send,
    UserCog, Crown, Star, MoreVertical,
    BarChart3, LogOut, ArrowRight,
    Megaphone, Timer
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAdmin } from '@/hooks/use-admin';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export function StudentHub() {
    const { academy, directives, leaveAcademy, students } = useInstitution();
    const { currentUserData } = useAdmin();

    if (!academy) return null;

    const myRole = currentUserData?.institutionRole || 'student';
    const isMonitor = myRole === 'monitor';
    const activeDirectives = directives.filter(d => d.status === 'active');

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className={cn("p-1.5 rounded-[2rem] border-2 shadow-2xl", isMonitor ? "border-primary animate-pulse" : "border-white/10")}>
                        <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                            <AvatarImage src={academy.logoUrl || undefined} />
                            <AvatarFallback className="bg-muted text-3xl font-black">{academy.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase italic text-white leading-none">{academy.name}</h1>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                             {isMonitor ? (
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest animate-gold-shine shadow-lg">
                                    <ShieldCheck className="h-3 w-3" /> Monitor Status Active
                                </div>
                             ) : (
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Citizen Active • Phase v1.0</p>
                             )}
                        </div>
                    </div>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="h-12 rounded-xl text-red-500/40 hover:text-red-500 hover:bg-red-500/10 font-black uppercase text-[10px] tracking-[0.3em]">
                            <LogOut className="mr-2 h-4 w-4" /> DISCONNECT FROM ACADEMY
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-slate-950 border-red-600/50 rounded-[2.5rem]">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-red-600 uppercase italic font-black text-2xl">BREAK UPLINK?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-300">
                                This will remove your record from the academy registry. You will no longer receive directives or bounties from the Proctor.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="border-white/10 font-bold">ABORT</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 font-black uppercase" onClick={leaveAcademy}>TERMINATE CONNECTION</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* ACTIVE MISSIONS */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="bg-slate-900 border-2 border-primary/20 rounded-[3rem] overflow-hidden shadow-2xl relative">
                        <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                        <CardHeader className="p-8 sm:p-10 border-b border-white/5 bg-white/5">
                            <CardTitle className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
                                <Target className="text-primary h-8 w-8" /> Active Directives
                            </CardTitle>
                            <CardDescription className="text-sm font-bold uppercase tracking-widest text-slate-400">Live Mission Logs from the Proctor</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 sm:p-10">
                            <div className="grid gap-6">
                                {activeDirectives.map((d, i) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        key={d.id} 
                                        className={cn(
                                            "p-6 rounded-[2rem] border-2 transition-all relative overflow-hidden group",
                                            d.type === 'urgent' ? "bg-red-600/5 border-red-600/30" : "bg-white/5 border-white/5"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-xl shadow-lg",
                                                    d.type === 'urgent' ? "bg-red-600 text-white" : "bg-primary text-white"
                                                )}>
                                                    {d.type === 'urgent' ? <ShieldAlert className="h-4 w-4"/> : <Megaphone className="h-4 w-4"/>}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{d.type} Protocol</span>
                                            </div>
                                            {d.deadline && (
                                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[9px] font-bold">
                                                    <Timer className="h-3 w-3 text-primary"/>
                                                    DUE: {format(d.deadline.toDate(), 'MMM d')}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xl font-bold text-slate-100 italic leading-relaxed relative z-10">"{d.text}"</p>
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Target className="h-24 w-24" />
                                        </div>
                                    </motion.div>
                                ))}
                                {activeDirectives.length === 0 && (
                                    <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                                        <CheckCircle className="h-16 w-16" />
                                        <p className="text-sm font-black uppercase tracking-widest">All Academy objectives secured</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {isMonitor && (
                        <Card className="bg-primary/5 border-primary/20 rounded-[2.5rem] p-8 relative overflow-hidden">
                            <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 rounded-3xl bg-primary text-white shadow-2xl">
                                        <ShieldCheck className="h-10 w-10" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter">Monitor Privilege Active</h3>
                                        <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">The Proctor has granted you peer authority.</p>
                                    </div>
                                </div>
                                <Button asChild variant="outline" className="h-14 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest border-white/10 bg-white/5">
                                    <Link href="/dashboard/social">Access War Room <ArrowRight className="ml-2 h-4 w-4"/></Link>
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>

                {/* ACADEMY INTEL */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-slate-900/60 border-white/5 rounded-[2.5rem] p-8 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                                <School className="h-6 w-6" />
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-primary">Academy Info</h4>
                        </div>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed italic">"{academy.description || 'Professional grade academic environment.'}"</p>
                        <Separator className="bg-white/5" />
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                                <span>Registry Size</span>
                                <span>{students.length} Citizens</span>
                            </div>
                            <div className="flex -space-x-3">
                                {students.slice(0, 5).map(s => (
                                    <Avatar key={s.uid} className="h-10 w-10 border-4 border-slate-900">
                                        <AvatarImage src={s.photoURL}/>
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                ))}
                                {students.length > 5 && (
                                    <div className="h-10 w-10 rounded-full bg-muted border-4 border-slate-900 flex items-center justify-center text-[10px] font-black">+{students.length - 5}</div>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20 rounded-[2.5rem] p-8 text-center space-y-6">
                        <div className="mx-auto h-16 w-16 bg-amber-500/10 rounded-full border-2 border-amber-500/20 flex items-center justify-center">
                            <Gem className="h-8 w-8 text-amber-500 animate-gold-shine" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xl font-black uppercase italic text-white tracking-tighter">Bounty Ready</h4>
                            <p className="text-xs font-medium text-slate-400">Complete directives to receive high-fidelity credit injections from the Proctor.</p>
                        </div>
                        <Button asChild variant="secondary" className="w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">
                            <Link href="/dashboard/roadmap">SYNC ROADMAP</Link>
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
