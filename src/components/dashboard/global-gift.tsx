
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
    const [isClaimed, setIsClaimed] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);

    useEffect(() => {
        if (activeGlobalGift && user) {
            // Check if the current user has already claimed this specific gift
            const hasClaimedThisGift = activeGlobalGift.claimedBy?.includes(user.id);
            setIsClaimed(hasClaimedThisGift);
            setIsVisible(!hasClaimedThisGift);
        } else {
            setIsVisible(false);
        }
    }, [activeGlobalGift, user]);

    const handleClaim = async () => {
        if (!activeGlobalGift || !user || isClaiming) return;
        
        setIsClaiming(true);
        await claimGlobalGift(activeGlobalGift.id, user.id);
        setIsClaimed(true);
        setIsClaiming(false);

        // Hide the card after a short delay to show the "Claimed" state
        setTimeout(() => {
            setIsVisible(false);
        }, 2000);
    };

    const getIcon = () => {
        if (!activeGlobalGift) return <Gift className="h-10 w-10 text-yellow-400" />;
        switch (activeGlobalGift.type) {
            case 'credits': return <DollarSign className="h-10 w-10 text-yellow-400" />;
            case 'scratch': return <VenetianMask className="h-10 w-10 text-purple-400" />;
            case 'flip': return <Box className="h-10 w-10 text-blue-400" />;
            default: return <Gift className="h-10 w-10 text-yellow-400" />;
        }
    };
    
    const getRewardText = () => {
        if (!activeGlobalGift) return '';
        const { type, amount } = activeGlobalGift;
        if (type === 'credits') return `${amount} Credits`;
        if (type === 'scratch') return `${amount} Scratch Card${amount > 1 ? 's' : ''}`;
        if (type === 'flip') return `${amount} Card Flip Play${amount > 1 ? 's' : ''}`;
        return '';
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
                                {getIcon()}
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="text-xl font-bold text-yellow-400 [text-shadow:0_0_8px_hsl(var(--primary)/50%)]">{activeGlobalGift.message}</h3>
                                <p className="text-yellow-400/80 mt-1">A gift from the admins!</p>
                            </div>
                            <Button
                                onClick={handleClaim}
                                disabled={isClaimed || isClaiming}
                                className={cn(
                                    "bg-yellow-400 text-yellow-900 hover:bg-yellow-300 w-full sm:w-auto",
                                    isClaimed && "bg-green-500 hover:bg-green-500 text-white"
                                )}
                            >
                                {isClaimed ? (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4"/> Claimed!
                                    </>
                                ) : isClaiming ? 'Claiming...' : `Claim ${getRewardText()}`}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
