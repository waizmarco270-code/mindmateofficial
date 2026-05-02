'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Trophy, Gem, Clock, Star, 
    Lock, CheckCircle, Gift, Sparkles, 
    ArrowRight, Loader2, Info, Target, 
    X, ShieldAlert, Award, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Group } from '@/context/groups-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '../ui/progress';

interface ClanMilestonesDialogProps {
    group: Group;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    claimedMilestones: string[];
}

const LEVEL_REWARDS = [
    { id: 'clan-lvl-2', level: 2, reward: 500, label: 'Early Discipline' },
    { id: 'clan-lvl-3', level: 3, reward: 1500, label: 'Alpha Authority' },
    { id: 'clan-lvl-4', level: 4, reward: 2500, label: 'Warrior Spirit' },
    { id: 'clan-lvl-5', level: 5, reward: 5000, label: 'Legendary Ascension' }
];

const STUDY_REWARDS = [
    { id: 'clan-study-100h', hours: 100, reward: 1000, label: 'Stamina Recruit' },
    { id: 'clan-study-250h', hours: 250, reward: 2500, label: 'Core Veteran' },
    { id: 'clan-study-500h', hours: 500, reward: 5000, label: 'Mainframe Master' }
];

export function ClanMilestonesDialog({ group, isOpen, onOpenChange, claimedMilestones }: ClanMilestonesDialogProps) {
    const totalHours = Math.floor((group.totalStudySeconds || 0) / 3600);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl bg-background/95 backdrop-blur-3xl border-primary/20 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
                <div className="h-32 sm:h-40 bg-gradient-to-br from-primary/20 via-background to-background relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                    <div className="p-8 sm:p-12 relative z-10">
                        <DialogHeader>
                            <DialogTitle className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter text-white">Clan Bounties</DialogTitle>
                            <DialogDescription className="font-bold text-primary/60 uppercase text-[10px] sm:text-xs tracking-[0.4em]">Protocol: Collective Achievement Rewards</DialogDescription>
                        </DialogHeader>
                    </div>
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/20 text-white hover:bg-destructive/20 hover:text-destructive z-50" onClick={() => onOpenChange(false)}>
                        <X className="h-6 w-6"/>
                    </Button>
                </div>

                <ScrollArea className="h-[60vh] sm:h-[500px]">
                    <div className="p-6 sm:p-10 space-y-12">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-primary/5 border-primary/10 rounded-3xl p-5 flex items-center justify-between group overflow-hidden relative">
                                <div className="absolute inset-0 bg-grid-white/5 opacity-5 group-hover:opacity-10 transition-opacity" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">Current Standing</p>
                                    <h4 className="text-2xl font-black text-white italic">LVL {group.level}</h4>
                                </div>
                                <div className="p-3 rounded-2xl bg-primary/20 text-primary shadow-xl group-hover:scale-110 transition-transform">
                                    <Trophy className="h-6 w-6" />
                                </div>
                            </Card>
                            <Card className="bg-amber-500/5 border-amber-500/10 rounded-3xl p-5 flex items-center justify-between group overflow-hidden relative">
                                <div className="absolute inset-0 bg-grid-white/5 opacity-5 group-hover:opacity-10 transition-opacity" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 mb-1">Stamina Record</p>
                                    <h4 className="text-2xl font-black text-white italic">{totalHours} HOURS</h4>
                                </div>
                                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-500 shadow-xl group-hover:scale-110 transition-transform">
                                    <Clock className="h-6 w-6" />
                                </div>
                            </Card>
                        </div>

                        {/* Level Milestones */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <h5 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                                    <Zap className="h-4 w-4 fill-current"/> Ascension Bounties
                                </h5>
                                <Badge variant="outline" className="text-[8px] font-black uppercase">One-Time Injection</Badge>
                            </div>
                            <div className="grid gap-4">
                                {LEVEL_REWARDS.map((m) => {
                                    const isReached = group.level >= m.level;
                                    const isClaimed = claimedMilestones.includes(m.id);
                                    return (
                                        <MilestoneCard 
                                            key={m.id}
                                            title={`Level ${m.level}: ${m.label}`}
                                            reward={m.reward}
                                            isReached={isReached}
                                            isClaimed={isClaimed}
                                            progress={group.level}
                                            target={m.level}
                                            progressLabel={`Level ${group.level} / ${m.level}`}
                                        />
                                    );
                                })}
                            </div>
                        </section>

                        {/* Study Hour Milestones */}
                        <section className="space-y-6 pb-12">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <h5 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500 flex items-center gap-3">
                                    <Award className="h-4 w-4 fill-current"/> Stamina Bounties
                                </h5>
                                <Badge variant="outline" className="text-[8px] font-black uppercase">Collective Effort</Badge>
                            </div>
                            <div className="grid gap-4">
                                {STUDY_REWARDS.map((m) => {
                                    const isReached = totalHours >= m.hours;
                                    const isClaimed = claimedMilestones.includes(m.id);
                                    return (
                                        <MilestoneCard 
                                            key={m.id}
                                            title={`${m.hours}h: ${m.label}`}
                                            reward={m.reward}
                                            isReached={isReached}
                                            isClaimed={isClaimed}
                                            progress={totalHours}
                                            target={m.hours}
                                            progressLabel={`${totalHours}h / ${m.hours}h`}
                                            color="amber"
                                        />
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                </ScrollArea>

                <div className="p-6 bg-muted/20 border-t flex items-center gap-4">
                    <ShieldAlert className="h-5 w-5 text-primary opacity-50 shrink-0" />
                    <p className="text-[10px] font-medium italic text-slate-400">"Milestones are calculated based on collective Clan metrics. Rewards are claimable once per citizen per milestone."</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function MilestoneCard({ title, reward, isReached, isClaimed, progress, target, progressLabel, color = "primary" }: any) {
    const percent = Math.min(100, (progress / target) * 100);
    const accentColor = color === "primary" ? "text-primary border-primary/30" : "text-amber-500 border-amber-500/30";
    const bgOpacity = isReached ? (color === "primary" ? "bg-primary/10" : "bg-amber-500/10") : "bg-white/[0.02]";

    return (
        <Card className={cn(
            "relative overflow-hidden border-2 transition-all duration-500 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6",
            isReached ? (color === "primary" ? "border-primary/40 shadow-lg shadow-primary/10" : "border-amber-500/40 shadow-lg shadow-amber-500/10") : "border-white/5",
            bgOpacity
        )}>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                <div className={cn(
                    "h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center border shadow-xl shrink-0 transition-transform group-hover:scale-110",
                    isReached ? (color === "primary" ? "bg-primary text-white border-primary" : "bg-amber-500 text-black border-amber-500") : "bg-black/40 text-muted-foreground border-white/5"
                )}>
                    {isClaimed ? <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8" /> : isReached ? <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 animate-pulse" /> : <Lock className="h-6 w-6 sm:h-8 sm:w-8 opacity-40" />}
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0 space-y-2 w-full">
                    <h4 className="font-black text-base sm:text-lg uppercase italic tracking-tight text-white">{title}</h4>
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-60">
                            <span>Progress</span>
                            <span>{progressLabel}</span>
                        </div>
                        <Progress value={percent} className="h-1 bg-black/20" indicatorClassName={isReached ? (color === "primary" ? "bg-primary" : "bg-amber-500") : "bg-slate-700"} />
                    </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
                    <div className={cn("flex items-center gap-2 font-black text-xl sm:text-2xl italic tabular-nums", accentColor)}>
                        <Gem className="h-5 w-5" /> +{reward}
                    </div>
                    {isReached ? (
                        isClaimed ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 uppercase text-[8px] font-black">Pulse Secured</Badge>
                        ) : (
                            <Button size="sm" className={cn("h-9 rounded-xl font-black uppercase text-[10px] tracking-widest px-6 shadow-lg", color === "primary" ? "bg-primary" : "bg-amber-500 text-black")} onClick={() => {}}>
                                CLAIM ASSET
                            </Button>
                        )
                    ) : (
                        <div className="px-4 py-1.5 rounded-xl bg-black/20 border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                            LOCKED
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}