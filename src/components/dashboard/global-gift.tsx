
'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Gift, Gem, VenetianMask, Zap, Wallet, 
    ShieldCheck, Snowflake, TrendingUp, Crown, 
    CheckCircle, Loader2, Sparkles, Trophy
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function GlobalGiftCard() {
    const { user } = useUser();
    const { activeGlobalGift, claimGlobalGift } = useAdmin();
    const [isVisible, setIsVisible] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);

    useEffect(() => {
        if (activeGlobalGift && user) {
            const isForThisUser = activeGlobalGift.target === 'all' || activeGlobalGift.target === user.id;
            const hasClaimedThisGift = activeGlobalGift.claimedBy?.includes(user.id);
            
            // Auto-deactivate logic handled on server, but client handles UI visibility
            setIsVisible(isForThisUser && !hasClaimedThisGift);
        } else {
            setIsVisible(false);
        }
    }, [activeGlobalGift, user]);

    const handleClaim = async () => {
        if (!activeGlobalGift || !user || isClaiming) return;
        
        setIsClaiming(true);
        try {
            await claimGlobalGift(activeGlobalGift.id, user.id);
            // Hide the card after a short delay
            setTimeout(() => {
                setIsVisible(false);
            }, 1500);
        } catch (e) {
            setIsClaiming(false);
        }
    };

    const renderRewardsPreview = () => {
        if (!activeGlobalGift) return null;
        const r = activeGlobalGift.rewards;
        return (
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                {r.credits > 0 && <RewardPill icon={Gem} text={`+${r.credits} CR`} color="text-amber-400" />}
                {r.wallet && r.wallet > 0 && <RewardPill icon={Wallet} text={`+₹${r.wallet}`} color="text-emerald-400" />}
                {r.badge && <RewardPill icon={Trophy} text={`${r.badge.toUpperCase()} RANK`} color="text-purple-400" />}
                {r.shields && r.shields > 0 && <RewardPill icon={ShieldCheck} text={`+${r.shields} AEGIS`} color="text-blue-400" />}
                {r.freezes && r.freezes > 0 && <RewardPill icon={Snowflake} text={`+${r.freezes} FREEZE`} color="text-cyan-400" />}
                {r.boosters && r.boosters > 0 && <RewardPill icon={TrendingUp} text={`+${r.boosters} BOOST`} color="text-green-400" />}
                {r.maxers && r.maxers > 0 && <RewardPill icon={Crown} text={`ASCENDER`} color="text-yellow-400" />}
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isVisible && activeGlobalGift && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="mb-8"
                >
                    <Card className="relative overflow-hidden border-2 border-yellow-400/30 bg-slate-900 shadow-[0_0_50px_rgba(250,204,21,0.15)] rounded-[2rem]">
                         <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(to_bottom,white_50%,transparent_100%)] opacity-20"></div>
                         <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-primary/5"></div>
                        <CardContent className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
                             <div className="relative">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                    className="absolute -inset-4 border border-dashed border-yellow-400/20 rounded-full"
                                />
                                <div className="relative p-5 rounded-3xl bg-yellow-400/10 border-2 border-yellow-400/30 shadow-inner">
                                    <Gift className="h-10 w-10 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                                </div>
                            </div>
                            
                            <div className="flex-1 text-center sm:text-left min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Sovereign Bounty Received</h3>
                                    <span className="text-[10px] font-black uppercase text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/20 w-fit mx-auto sm:mx-0">Master's Gift</span>
                                </div>
                                <p className="text-base text-slate-300 font-medium leading-relaxed italic">"{activeGlobalGift.message}"</p>
                                {renderRewardsPreview()}
                            </div>

                            <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                                <Button
                                    onClick={handleClaim}
                                    disabled={isClaiming}
                                    className={cn(
                                        "h-16 px-8 rounded-2xl bg-yellow-400 text-black font-black text-lg shadow-xl shadow-yellow-400/20 transition-all active:scale-95 group",
                                        isClaiming && "bg-muted"
                                    )}
                                >
                                    {isClaiming ? (
                                        <Loader2 className="animate-spin h-6 w-6" />
                                    ) : (
                                        <><Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" /> SECURE ASSETS</>
                                    )}
                                </Button>
                                {activeGlobalGift.maxClaims && (
                                    <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400/60">
                                        Limited supply: {activeGlobalGift.claimedBy?.length || 0} claimed
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function RewardPill({ icon: Icon, text, color }: { icon: any, text: string, color: string }) {
    return (
        <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 shadow-inner", color)}>
            <Icon className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">{text}</span>
        </div>
    );
}
