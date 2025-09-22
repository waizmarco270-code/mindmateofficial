

'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, DollarSign, VenetianMask, Box, CheckCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function GlobalGiftCard() {
    const { user } = useUser();
    const { activeGlobalGift, claimGlobalGift } = useAdmin();
    const [isVisible, setIsVisible] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);

    const isGift = activeGlobalGift?.rewards && (activeGlobalGift.rewards.credits > 0 || activeGlobalGift.rewards.scratch > 0 || activeGlobalGift.rewards.flip > 0);

    useEffect(() => {
        if (activeGlobalGift && user) {
            const isForThisUser = activeGlobalGift.target === 'all' || activeGlobalGift.target === user.id;
            const hasClaimedThisGift = activeGlobalGift.claimedBy?.includes(user.id);
            
            setIsVisible(isForThisUser && !hasClaimedThisGift);
        } else {
            setIsVisible(false);
        }
    }, [activeGlobalGift, user]);

    const handleClaim = async () => {
        if (!activeGlobalGift || !user || isClaiming) return;
        
        setIsClaiming(true);
        await claimGlobalGift(activeGlobalGift.id, user.id);
        
        // Hide the card after a short delay
        setTimeout(() => {
            setIsVisible(false);
        }, 1500);
    };

    const getRewardText = () => {
        if (!activeGlobalGift || !activeGlobalGift.rewards) return '';
        const { credits, scratch, flip } = activeGlobalGift.rewards;
        const parts = [];
        if (credits > 0) parts.push(`${credits} Credits`);
        if (scratch > 0) parts.push(`${scratch} Scratch Card(s)`);
        if (flip > 0) parts.push(`${flip} Card Flip(s)`);
        return parts.join(', ');
    };

    return (
        <AnimatePresence>
            {isVisible && activeGlobalGift && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-8"
                >
                    <Card className="relative overflow-hidden border-yellow-400/30 bg-yellow-950/40">
                         <div className="absolute -inset-2 bg-grid-slate-800 animate-pulse duration-1000 [mask-image:linear-gradient(to_bottom,white_50%,transparent_100%)]"></div>
                         <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent"></div>
                        <CardContent className="relative p-6 flex flex-col sm:flex-row items-center gap-6">
                             <div className="p-4 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30">
                                <Gift className="h-10 w-10 text-yellow-400" />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="text-xl font-bold text-yellow-400 [text-shadow:0_0_8px_hsl(var(--primary)/50%)]">{activeGlobalGift.message}</h3>
                                <p className="text-yellow-400/80 mt-1">A message from the admins!</p>
                            </div>
                            <Button
                                onClick={handleClaim}
                                disabled={isClaiming}
                                className={cn("bg-yellow-400 text-yellow-900 hover:bg-yellow-300 w-full sm:w-auto")}
                            >
                                {isClaiming ? 'Receiving...' : (isGift ? `Claim ${getRewardText()}` : 'Understood')}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
