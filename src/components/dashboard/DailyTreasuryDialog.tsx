

'use client';

import { useState, useEffect } from 'react';
import { useRewards } from '@/hooks/use-rewards';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Award, CheckCircle, Gift, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export function DailyTreasuryDialog({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
    const { dailyLoginState, claimDailyLoginReward, loading } = useRewards();
    const [isClaiming, setIsClaiming] = useState(false);

    const handleClaim = async () => {
        if (!dailyLoginState.canClaim) return;
        setIsClaiming(true);
        try {
            await claimDailyLoginReward();
            // The dialog will close automatically on re-render because `dailyLoginState.canClaim` becomes false.
        } catch (error) {
            // Toast is handled within the hook
        } finally {
            setIsClaiming(false);
        }
    };

    const rewardsConfig: Record<number, { text: string; subtext?: string }> = {
        1: { text: "+10", subtext: "Credits" },
        2: { text: "+5 C, +3 S", subtext: "Credits, Scratch" },
        3: { text: "+50", subtext: "Credits" },
        4: { text: "+20", subtext: "Scratch" },
        5: { text: "+100", subtext: "Credits" },
        6: { text: "3 Days", subtext: "VIP" },
        7: { text: "Legendary" },
    };
    
    // Determine the day to claim. If streak is 7, it resets to 0 for the next claim, making it Day 1.
    const dayToClaim = dailyLoginState.streak >= 7 ? 1 : dailyLoginState.streak + 1;
    const currentReward = rewardsConfig[dayToClaim] || { text: 'Bonus!', subtext: 'Come back tomorrow' };


    return (
        <Dialog open={isOpen && dailyLoginState.canClaim} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-full bg-slate-900/80 backdrop-blur-lg border-primary/20 text-white">
                <DialogHeader className="text-center">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                        className="mx-auto mb-4 h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/30"
                    >
                        <Gift className="h-10 w-10 text-white" />
                    </motion.div>
                    <DialogTitle className="text-3xl font-bold">Daily Treasury</DialogTitle>
                    <DialogDescription className="text-slate-300">
                        Your daily reward is ready to be claimed!
                    </DialogDescription>
                </DialogHeader>
                
                <div className="py-6 space-y-6">
                     <div className="flex flex-wrap justify-center items-end gap-2">
                        {Array.from({ length: 7 }).map((_, i) => {
                            const day = i + 1;
                            const isCompleted = dailyLoginState.streak >= day;
                            const isNext = (dailyLoginState.streak + 1) === day && !dailyLoginState.hasClaimedToday;
                            const reward = rewardsConfig[day];

                            return (
                                <div key={day} className="flex flex-col items-center gap-1 text-center flex-1">
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 + i * 0.05 }}
                                        className={cn(
                                            "relative h-20 w-full rounded-lg flex flex-col items-center justify-center p-1 border-2 transition-all duration-300",
                                            isCompleted ? "bg-red-500/20 border-red-400" : "bg-black/20 border-white/10",
                                            isNext && "border-amber-400 scale-105 shadow-lg shadow-amber-400/30"
                                        )}
                                    >
                                        {isCompleted && <CheckCircle className="h-5 w-5 text-red-400" />}
                                        <p className="text-white/80 font-bold mt-1 text-sm sm:text-base">{reward.text}</p>
                                        {reward.subtext && <p className="text-white/60 text-[10px] leading-tight">{reward.subtext}</p>}
                                    </motion.div>
                                    <p className="text-xs font-bold text-white">Day {day}</p>
                                </div>
                            )
                        })}
                    </div>
                     <div className="text-center bg-black/30 p-4 rounded-lg border border-white/10">
                        <p className="text-sm font-semibold text-slate-400">Today's Reward (Day {dayToClaim}):</p>
                        <p className="font-bold text-2xl text-amber-300">{currentReward.text}</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        className="w-full h-14 text-lg font-bold bg-green-500 hover:bg-green-600 text-white"
                        onClick={handleClaim}
                        disabled={!dailyLoginState.canClaim || isClaiming || loading}
                    >
                        {isClaiming ? <Loader2 className="animate-spin mr-2" /> : (dailyLoginState.canClaim && <Award className="mr-2" />)}
                        {dailyLoginState.hasClaimedToday ? "Already Claimed" : "Claim Now!"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

    