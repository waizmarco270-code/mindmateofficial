
'use client';

import { useState, useEffect } from 'react';
import { useAdmin, BadgeType } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Gift, Gem, VenetianMask, Zap, Wallet, 
    ShieldCheck, Snowflake, TrendingUp, Crown, 
    CheckCircle, Loader2, Sparkles, Trophy, X,
    Code, Swords, Bird, Moon
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// Synchronized Badge Registry for high-fidelity rendering
const badgeDetails: Record<string, { name: string, badge: JSX.Element }> = {
    dev: { name: 'Developer', badge: <span className="dev-badge"><Code className="h-3 w-3" /> DEV</span> },
    admin: { name: 'Admin', badge: <span className="admin-badge"><ShieldCheck className="h-3 w-3" /> ADMIN</span> },
    vip: { name: 'Elite Member', badge: <span className="elite-badge"><Crown className="h-3 w-3" /> ELITE</span> },
    gm: { name: 'Game Master', badge: <span className="gm-badge">GM</span> },
    challenger: { name: 'Challenger', badge: <span className="challenger-badge"><Swords className="h-3 w-3"/> Challenger</span> },
    'co-dev': { name: 'Co-Developer', badge: <span className="co-dev-badge"><Code className="h-3 w-3"/> Co-Dev</span> },
    'early-bird': { name: 'Early Bird', badge: <span className="early-bird-badge"><Bird className="h-3 w-3"/> EARLY BIRD</span> },
    'night-owl': { name: 'Night Owl', badge: <span className="night-owl-badge"><Moon className="h-3 w-3"/> NIGHT OWL</span> },
    'knowledge-knight': { name: 'Knowledge Knight', badge: <span className="knowledge-knight-badge"><ShieldCheck className="h-3 w-3"/> KNIGHT</span> },
    streaker: { name: 'Streaker', badge: <span className="streaker-badge"><Flame className="h-3 w-3"/> STREAKER</span> },
    isolater: { name: 'Isolater', badge: <span className="isolater-badge">ISOLATER</span> },
    'iso-warrior': { name: 'ISO-Warrior', badge: <span className="iso-warrior-badge">ISO-WARRIOR</span> },
    warrior: { name: 'Warrior', badge: <span className="warrior-badge">WARRIOR</span> },
    'iso-master': { name: 'ISO-Master', badge: <span className="iso-master-badge">ISO-MASTER</span> },
    sovereign: { name: 'Sovereign', badge: <span className="sovereign-badge">Sovereign</span> }
};

function Flame({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.21 1.14-3.027L8.5 14.5Z"/></svg>;
}

function GiftSuccessDialog({ isOpen, onOpenChange, rewards }: { isOpen: boolean, onOpenChange: (o: boolean) => void, rewards: any }) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border-0 bg-transparent shadow-none p-0">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative overflow-hidden rounded-[2.5rem] bg-background border-4 border-yellow-400/20 p-8 text-center"
                >
                    {/* Energy Particle Background */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(15)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: -20, x: Math.random() * 400, opacity: 1 }}
                                animate={{ 
                                    y: 600, 
                                    x: (Math.random() - 0.5) * 200 + 200,
                                    rotate: 360,
                                    opacity: 0 
                                }}
                                transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 1.5 }}
                                className={cn(
                                    "absolute h-2 w-2 rounded-full",
                                    ["bg-yellow-400", "bg-primary", "bg-emerald-400", "bg-sky-400"][Math.floor(Math.random() * 4)]
                                )}
                            />
                        ))}
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="mx-auto w-24 h-24 rounded-full bg-yellow-400/10 border-4 border-yellow-400/20 flex items-center justify-center">
                            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                                <Trophy className="h-12 w-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                            </motion.div>
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">BOUNTY SECURED!</h2>
                            <p className="text-muted-foreground font-medium">The assets have been integrated into your mainframe profile.</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2">
                            {rewards.credits > 0 && <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-500 font-black">+{rewards.credits} CREDITS</Badge>}
                            {rewards.badge && <div className="scale-90">{badgeDetails[rewards.badge]?.badge}</div>}
                            {rewards.alphaGlowWeeks && <Badge className="bg-pink-500 text-white font-black">ALPHA RADIANCE</Badge>}
                        </div>

                        <Button onClick={() => onOpenChange(false)} size="lg" className="w-full h-14 bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xl rounded-2xl shadow-[0_10px_30px_rgba(250,204,21,0.3)]">
                            GLORY AWAITS
                        </Button>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}

export function GlobalGiftCard() {
    const { user } = useUser();
    const { activeGlobalGift, claimGlobalGift } = useAdmin();
    const [isVisible, setIsVisible] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (activeGlobalGift && user) {
            const isTargeted = activeGlobalGift.target === 'all' || 
                               (Array.isArray(activeGlobalGift.target) ? activeGlobalGift.target.includes(user.id) : activeGlobalGift.target === user.id);
            const hasClaimed = activeGlobalGift.claimedBy?.includes(user.id);
            setIsVisible(isTargeted && !hasClaimed);
        } else {
            setIsVisible(false);
        }
    }, [activeGlobalGift, user]);

    const handleClaim = async () => {
        if (!activeGlobalGift || !user || isClaiming) return;
        setIsClaiming(true);
        try {
            await claimGlobalGift(activeGlobalGift.id, user.id);
            setShowSuccess(true);
            setTimeout(() => setIsVisible(false), 500);
        } catch (e) {
            setIsClaiming(false);
        }
    };

    const renderRewardsPreview = () => {
        if (!activeGlobalGift) return null;
        const r = activeGlobalGift.rewards;
        return (
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                {r.badge && (
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        className="scale-110 mr-2"
                    >
                        {badgeDetails[r.badge]?.badge}
                    </motion.div>
                )}
                {r.credits > 0 && <RewardPill icon={Gem} text={`+${r.credits} CR`} color="text-amber-400" />}
                {r.wallet && r.wallet > 0 && <RewardPill icon={Wallet} text={`+₹${r.wallet}`} color="text-emerald-400" />}
                {r.alphaGlowWeeks && <RewardPill icon={Sparkles} text={`ALPHA RADIANCE`} color="text-pink-400" />}
                {r.shields && r.shields > 0 && <RewardPill icon={ShieldCheck} text={`+${r.shields} AEGIS`} color="text-blue-400" />}
                {r.freezes && r.freezes > 0 && <RewardPill icon={Snowflake} text={`+${r.freezes} FREEZE`} color="text-cyan-400" />}
                {r.boosters && r.boosters > 0 && <RewardPill icon={TrendingUp} text={`+${r.boosters} BOOST`} color="text-green-400" />}
                {r.maxers && r.maxers > 0 && <RewardPill icon={Crown} text={`ASCENDER`} color="text-yellow-400" />}
            </div>
        );
    };

    return (
        <>
            <GiftSuccessDialog isOpen={showSuccess} onOpenChange={setShowSuccess} rewards={activeGlobalGift?.rewards} />
            <AnimatePresence>
                {isVisible && activeGlobalGift && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: -20 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95, y: -20 }} 
                        className="mb-8"
                    >
                        <Card className="relative overflow-hidden border-2 border-yellow-400/40 bg-slate-900 shadow-[0_0_60px_rgba(250,204,21,0.2)] rounded-[2.5rem]">
                            <div className="absolute inset-0 bg-grid-slate-800/50 opacity-20"></div>
                            
                            {/* Animated Background Pulse */}
                            <div className="absolute top-0 right-0 p-8">
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="h-32 w-32 bg-yellow-400 rounded-full blur-3xl"
                                />
                            </div>

                            <CardContent className="relative p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-8">
                                <div className="relative">
                                    <motion.div 
                                        animate={{ rotate: 360 }} 
                                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} 
                                        className="absolute -inset-6 border border-dashed border-yellow-400/30 rounded-full"
                                    />
                                    <div className="relative p-6 rounded-[2rem] bg-gradient-to-br from-yellow-400/20 to-transparent border-2 border-yellow-400/40 shadow-2xl">
                                        <Gift className="h-12 w-12 text-yellow-400 animate-bounce" />
                                    </div>
                                </div>

                                <div className="flex-1 text-center sm:text-left min-w-0 space-y-2">
                                    <div className="flex items-center justify-center sm:justify-start gap-2">
                                        <span className="h-1.5 w-8 bg-yellow-400 rounded-full animate-pulse" />
                                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Sovereign Bounty Detected</h3>
                                    </div>
                                    <p className="text-lg text-slate-200 font-medium italic leading-tight">"{activeGlobalGift.message}"</p>
                                    {renderRewardsPreview()}
                                </div>

                                <div className="flex flex-col items-center gap-3 w-full sm:w-auto">
                                    <Button 
                                        onClick={handleClaim} 
                                        disabled={isClaiming} 
                                        className={cn(
                                            "h-16 px-10 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xl shadow-2xl transition-all active:scale-95 group",
                                            "shadow-[0_0_20px_rgba(250,204,21,0.4)]"
                                        )}
                                    >
                                        {isClaiming ? <Loader2 className="animate-spin h-6 w-6" /> : <><Sparkles className="mr-2 h-6 w-6 group-hover:rotate-12 transition-transform" /> SECURE ASSETS</>}
                                    </Button>
                                    
                                    {activeGlobalGift.maxClaims && (
                                        <div className="w-full space-y-1">
                                            <div className="flex justify-between text-[10px] font-black uppercase text-yellow-400/60 tracking-widest">
                                                <span>Harvest Status</span>
                                                <span>{activeGlobalGift.claimedBy?.length || 0} / {activeGlobalGift.maxClaims}</span>
                                            </div>
                                            <Progress 
                                                value={(activeGlobalGift.claimedBy?.length || 0) / activeGlobalGift.maxClaims * 100} 
                                                className="h-1 bg-white/5" 
                                                indicatorClassName="bg-yellow-400 shadow-[0_0_5px_#facc15]" 
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function RewardPill({ icon: Icon, text, color }: { icon: any, text: string, color: string }) {
    return (
        <div className={cn("flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/40 border border-white/10 shadow-inner", color)}>
            <Icon className="h-4 w-4" />
            <span className="text-xs font-black uppercase tracking-widest">{text}</span>
        </div>
    );
}
