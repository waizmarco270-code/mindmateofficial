
'use client';

import { useState, useMemo } from 'react';
import { useUsers, useAdmin } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    FileCheck, ShieldCheck, Trophy, Clock, 
    ArrowRight, Star, Loader2, Download, 
    ChevronRight, Sparkles, ScrollText, Gem,
    Flame, Target, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SovereignCertificate } from '@/components/proof-of-work/sovereign-certificate';
import { cn } from '@/lib/utils';

export default function ProofOfWorkPage() {
    const { currentUserData, loading } = useUsers();
    const [view, setView] = useState<'hub' | 'preview'>('hub');

    const stats = useMemo(() => {
        if (!currentUserData) return null;
        
        const hours = (currentUserData.totalStudyTime || 0) / 3600;
        
        // Dynamic Rank Calculation
        let rank = 'Neophyte';
        let color = 'text-slate-400';
        if (hours >= 500) { rank = 'Sovereign Architect'; color = 'text-yellow-400'; }
        else if (hours >= 250) { rank = 'Grandmaster of Focus'; color = 'text-purple-400'; }
        else if (hours >= 100) { rank = 'Master Scholar'; color = 'text-blue-400'; }
        else if (hours >= 50) { rank = 'Deep Focus Specialist'; color = 'text-emerald-400'; }
        else if (hours >= 10) { rank = 'Dedicated Scholar'; color = 'text-sky-400'; }

        // Integrity Calculation
        const completed = currentUserData.focusSessionsCompleted || 0;
        const streak = currentUserData.streak || 0;
        const integrity = Math.min(100, 85 + (completed / 10) + (streak / 5));

        return {
            hours: hours.toFixed(1),
            rank,
            color,
            integrity: integrity.toFixed(0),
            sessions: completed,
            credits: currentUserData.credits || 0,
            streak: streak
        };
    }, [currentUserData]);

    if (loading || !stats) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20 relative">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 golden-legend-bg opacity-20" />
            </div>

            <AnimatePresence mode="wait">
                {view === 'hub' ? (
                    <motion.div 
                        key="hub"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-8 relative z-10"
                    >
                        <header className="text-center space-y-4">
                            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center border-2 border-primary/20 shadow-2xl backdrop-blur-md">
                                <FileCheck className="h-10 w-10 text-primary" />
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-br from-white via-white to-slate-500 bg-clip-text text-transparent uppercase italic">
                                Sovereign Ledger
                            </h1>
                            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                                Protocol: Physical Validation of Digital Discipline. <br />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Authorized Registry v2.5</span>
                            </p>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Live Stats Board */}
                            <div className="lg:col-span-8 space-y-6">
                                <Card className="bg-slate-900/40 backdrop-blur-3xl border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                                    <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                                    <CardHeader className="relative z-10 p-8 border-b border-white/5 bg-white/5">
                                        <CardTitle className="text-xl font-black uppercase tracking-widest italic flex items-center gap-3">
                                            <ScrollText className="text-primary"/> Operational Dossier
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em]">Identity Classification</p>
                                            <h3 className={cn("text-3xl font-black uppercase italic tracking-tight", stats.color)}>{stats.rank}</h3>
                                        </div>
                                        <div className="space-y-1 md:text-right">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em]">Operational Fidelity</p>
                                            <h3 className="text-3xl font-black text-white italic">{stats.integrity}%</h3>
                                        </div>

                                        <div className="col-span-full grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                                            <StatPill icon={Clock} label="Focus Time" val={`${stats.hours}h`} color="text-sky-400" />
                                            <StatPill icon={Target} label="Completed" val={`${stats.sessions}`} color="text-emerald-400" />
                                            <StatPill icon={Flame} label="Streak" val={`${stats.streak}d`} color="text-orange-500" />
                                            <StatPill icon={Gem} label="Mainframe" val={`${stats.credits}`} color="text-amber-500" />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-8 sm:p-12 pt-0 relative z-10">
                                        <Button 
                                            size="lg" 
                                            className="w-full h-20 rounded-[2rem] text-2xl font-black uppercase italic shadow-2xl group"
                                            onClick={() => setView('preview')}
                                        >
                                            GENERATE PROOF OF WORK <ArrowRight className="ml-3 h-8 w-8 group-hover:translate-x-2 transition-transform" />
                                        </Button>
                                    </CardFooter>
                                </Card>

                                <div className="p-8 rounded-[3rem] bg-primary/5 border border-primary/20 flex items-start gap-6">
                                    <div className="p-4 rounded-2xl bg-primary/10 text-primary shadow-xl">
                                        <ShieldCheck className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h4 className="font-black uppercase text-xs tracking-[0.2em] mb-2">Cryptographic Validation</h4>
                                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                            Every record is sealed with a unique 32-bit Sovereign Hash derived from your MindMate UID. This certificate serves as immutable proof of your academic discipline.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Info Sidebar */}
                            <div className="lg:col-span-4 space-y-6">
                                <Card className="bg-slate-900/60 border-white/5 rounded-[2.5rem] p-8 space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <Star className="h-4 w-4" /> Certification Tiers
                                    </h4>
                                    <div className="space-y-4">
                                        <TierItem hours="10h" label="Dedicated" color="bg-sky-500" />
                                        <TierItem hours="50h" label="Specialist" color="bg-emerald-500" />
                                        <TierItem hours="100h" label="Master" color="bg-blue-500" />
                                        <TierItem hours="250h" label="Grandmaster" color="bg-purple-500" />
                                        <TierItem hours="500h" label="Sovereign" color="bg-yellow-500" />
                                    </div>
                                </Card>

                                <Card className="border-amber-500/20 bg-amber-500/5 rounded-[2.5rem] p-8">
                                    <div className="flex items-start gap-3 text-amber-500">
                                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                            Protocol: Certificates are snapshot-based. Your record updates in real-time as you log missions in the Focus Engine.
                                        </p>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="preview"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="space-y-8 relative z-10"
                    >
                        <SovereignCertificate 
                            userData={currentUserData} 
                            stats={stats} 
                            onBack={() => setView('hub')} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatPill({ icon: Icon, label, val, color }: any) {
    return (
        <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5">
            <Icon className={cn("h-5 w-5", color)} />
            <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{label}</p>
            <p className="text-xl font-black text-white italic">{val}</p>
        </div>
    );
}

function TierItem({ hours, label, color }: any) {
    return (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/5 group hover:border-white/20 transition-all">
            <div className="flex items-center gap-3">
                <div className={cn("h-2 w-2 rounded-full", color)} />
                <span className="text-[10px] font-black uppercase text-slate-300">{label}</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">{hours}</span>
        </div>
    );
}
