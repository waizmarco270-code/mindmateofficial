'use client';

import { UserWithStats } from '@/hooks/use-leaderboard-data';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Zap, ChevronRight, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export function UserRankHUD({ rank, user }: { rank: number; user?: UserWithStats }) {
    if (!user) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-auto"
        >
            <Card className="bg-primary/5 border-2 border-primary/30 rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                <div className="scanning-line" />
                
                <CardContent className="p-0 flex items-center gap-6 relative z-10">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-primary/20 flex flex-col items-center justify-center border-2 border-primary/40 shrink-0">
                        <span className="text-[8px] font-black uppercase text-primary/60">Rank</span>
                        <span className="text-3xl sm:text-4xl font-black italic text-white tracking-tighter">#{rank}</span>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Identity Pulse</p>
                                <h4 className="text-xl font-black italic uppercase text-white truncate max-w-[150px]">{user.displayName}</h4>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">To Next Rank</p>
                                <p className="text-lg font-black italic text-primary">12.5h</p>
                            </div>
                        </div>
                        
                        <div className="space-y-1.5">
                            <Progress value={65} className="h-1.5 bg-black/40" indicatorClassName="bg-primary shadow-[0_0_10px_#8b5cf6]" />
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-40 italic">
                                <span>Master Rank</span>
                                <span>Sovereign Tier</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
