'use client';

import { UserWithStats } from '@/hooks/use-leaderboard-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    Clock, Flame, Gem, Medal, 
    Trophy, ShieldCheck, Zap, 
    ArrowRight, Star, X, ScrollText, 
    ShieldAlert, Globe, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShowcaseBadge, getOwnedBadges, badgeMeta } from './shared/badge-renderer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

interface ProfileModalProps {
    user: UserWithStats | null;
    onClose: () => void;
}

export function ProfileModal({ user, onClose }: ProfileModalProps) {
    if (!user) return null;

    const owned = getOwnedBadges(user);
    const equippedFrameId = user.equippedFrame || 'default';

    return (
        <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-3xl border-primary/30 p-0 overflow-hidden rounded-[3rem] shadow-[0_0_100px_rgba(139,92,246,0.3)]">
                <div className="absolute inset-0 bg-grid-white/5 opacity-10 pointer-events-none" />
                
                <div className="h-48 bg-gradient-to-br from-primary/30 via-background to-background relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.2)_0%,_transparent_70%)]" />
                    <Button variant="ghost" size="icon" className="absolute top-6 right-6 h-10 w-10 rounded-full bg-black/20 text-white hover:bg-destructive/20 hover:text-destructive z-50 transition-all" onClick={onClose}>
                        <X className="h-6 w-6"/>
                    </Button>
                    <LogoWatermark className="h-40 w-40 opacity-10 absolute -left-10 -bottom-10 rotate-12" />
                </div>
                
                <div className="px-8 sm:px-12 pb-12 -mt-16 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className={cn("avatar-frame-base h-32 w-32 sm:h-40 sm:w-40", equippedFrameId === 'premium' ? 'avatar-frame-premium' : 'avatar-frame-default shadow-2xl')}>
                            <Avatar className="h-full w-full border-4 bg-background relative z-10 shadow-inner">
                                <AvatarImage src={user.photoURL} />
                                <AvatarFallback className="text-4xl">{user.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg">{user.displayName}</h3>
                            <div className="flex items-center justify-center gap-3">
                                <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary px-4 py-1 font-black uppercase text-[10px] tracking-widest">{user.mindMateId || 'UNREGISTERED'}</Badge>
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981] animate-pulse" />
                                <span className="text-[10px] font-black uppercase opacity-40 tracking-widest">Active Operative</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 grid grid-cols-2 gap-4">
                        <DossierStat icon={Clock} label="Focus Time" val={`${Math.round((user.totalStudyTime || 0) / 3600)}h`} color="text-sky-400" />
                        <DossierStat icon={Gem} label="Credits" val={user.credits.toLocaleString()} color="text-amber-500" />
                        <DossierStat icon={Flame} label="Daily Streak" val={`${user.streak} Days`} color="text-orange-500" />
                        <DossierStat icon={ShieldAlert} label="Isolation Phase" val={user.breakdown.isolationLabel} color="text-red-500" />
                    </div>

                    <div className="mt-10 space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-primary flex items-center gap-3">
                                <Medal className="h-5 w-5"/> Verified Identity Assets
                            </h4>
                            <span className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase bg-muted/50 px-3 py-1 rounded-full">{owned.length} Unlocked</span>
                        </div>

                        <ScrollArea className="h-64 pr-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {owned.map(key => (
                                    <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-primary/30 transition-all shadow-inner">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-xl bg-black/40 shadow-lg">
                                                <ScrollText className="h-4 w-4 text-primary opacity-40"/>
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase italic text-foreground/90">{badgeMeta[key].name}</p>
                                                <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">Certified</p>
                                            </div>
                                        </div>
                                        <div className="scale-75 origin-right">{badgeMeta[key].badge}</div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                <div className="p-8 bg-muted/20 border-t border-white/5 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] italic opacity-20">"The Strongest Survive. The Legends Persist."</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DossierStat({ icon: Icon, label, val, color }: any) {
    return (
        <Card className="bg-black/40 border-white/5 rounded-3xl overflow-hidden p-5 flex items-center gap-5 group hover:border-primary/20 transition-all">
            <div className={cn("p-3 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform shadow-lg", color)}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
                <p className="text-xl font-black italic text-white tracking-tighter">{val}</p>
            </div>
        </Card>
    );
}

function LogoWatermark({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}
