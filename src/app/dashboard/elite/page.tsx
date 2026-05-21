
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Crown, Zap, Gem, ShieldCheck, 
    ArrowRight, Star, Loader2, 
    Trophy, Rocket, ShieldAlert,
    Smartphone, Globe, X, Check,
    Copy, Download, Key, Info,
    Cpu, Monitor, SmartphoneOff, 
    Fingerprint, Lock, Shield
} from 'lucide-react';
import { useAdmin, useUsers } from '@/hooks/use-admin';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createRazorpayOrder, verifyRazorpayPayment } from '@/app/actions/razorpay';
import Script from 'next/script';
import { Progress } from '@/components/ui/progress';
import { doc, setDoc, serverTimestamp, increment, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { addDays } from 'date-fns';

const ELITE_PLANS = [
    { id: 'perm', label: 'Permanent', price: 149, currency: 'INR', type: 'money', desc: 'Lifetime Sovereign Access', icon: Crown, color: 'text-yellow-400' },
    { id: '7d', label: '7 Days', price: 1000, currency: 'CR', type: 'credits', desc: 'Weekly Tactical Ingress', icon: Zap, color: 'text-primary' },
    { id: '21d', label: '21 Days', price: 2000, currency: 'CR', type: 'credits', desc: 'Warrior Stance Access', icon: Swords, color: 'text-orange-500' }
];

export default function MindMateElitePage() {
    const { user } = useUser();
    const { currentUserData, addCreditsToUser } = useUsers();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const hasMaster = currentUserData?.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();

    const generateEliteKey = async (planId: string) => {
        const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const part3 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const key = `ELITE-${part1}-${part2}-${part3}`;
        
        let expiry: string | null = null;
        if (planId === '7d') expiry = addDays(new Date(), 7).toISOString();
        if (planId === '21d') expiry = addDays(new Date(), 21).toISOString();

        // Register key in global registry
        await setDoc(doc(db, 'elite_keys', key), {
            id: key,
            ownerId: user?.id,
            ownerName: currentUserData?.displayName,
            status: 'unused',
            planId,
            expiry,
            createdAt: serverTimestamp(),
            isPermanent: planId === 'perm'
        });

        // Link to user profile
        await updateDoc(doc(db, 'users', user!.id), {
            eliteKeys: arrayUnion({ key, planId, createdAt: new Date().toISOString() })
        });

        return key;
    };

    const handlePurchaseWithCredits = async (plan: typeof ELITE_PLANS[0]) => {
        if (!user || !currentUserData) return;
        if (!hasMaster && currentUserData.credits < plan.price) {
            toast({ variant: 'destructive', title: "INSUFFICIENT LIQUIDITY", description: `You need ${plan.price} credits to authorize this ingress.` });
            return;
        }

        setIsProcessing(plan.id);
        try {
            const key = await generateEliteKey(plan.id);
            if (!hasMaster) await addCreditsToUser(user.id, -plan.price);
            setGeneratedKey(key);
            toast({ title: "INGRESS AUTHORIZED", description: "Your Elite Key has been fabricated." });
        } catch (e: any) {
            toast({ variant: 'destructive', title: "FABRICATION FAILED", description: e.message });
        } finally {
            setIsProcessing(null);
        }
    };

    const handlePurchaseWithMoney = async (plan: typeof ELITE_PLANS[0]) => {
        if (!user) return;
        setIsProcessing(plan.id);
        try {
            const order = await createRazorpayOrder(plan.price, {
                userId: user.id,
                packName: 'MindMate Elite Permanent Access',
                credits: 0
            });

            const options = {
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: 'MindMate Elite',
                description: 'Permanent Sovereign Activation',
                order_id: order.id,
                handler: async function (response: any) {
                    const key = await generateEliteKey('perm');
                    setGeneratedKey(key);
                    toast({ title: "ASCENSION CONFIRMED", description: "Permanent identity key manifest." });
                    setIsProcessing(null);
                },
                theme: { color: '#8b5cf6' },
                modal: { ondismiss: () => setIsProcessing(null) }
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (e: any) {
            toast({ variant: 'destructive', title: "TRANSACTION BREACH", description: e.message });
            setIsProcessing(null);
        }
    };

    const copyKey = () => {
        if (!generatedKey) return;
        navigator.clipboard.writeText(generatedKey);
        setIsCopied(true);
        toast({ title: "Key Secured in Buffer" });
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="space-y-12 pb-40 max-w-6xl mx-auto px-4 relative">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            
            {/* Background Atmosphere */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 golden-legend-bg opacity-30" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.15)_0%,_transparent_70%)]" />
            </div>

            <header className="text-center space-y-6 relative z-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto w-24 h-24 rounded-[2.5rem] bg-yellow-400/10 border-2 border-yellow-400/30 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.3)] backdrop-blur-md">
                    <Crown className="h-12 w-12 text-yellow-400 animate-gold-shine" />
                </motion.div>
                <div className="space-y-2">
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-white via-white to-slate-500 bg-clip-text text-transparent">
                        MindMate Elite
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-xs">Protocol: Beyond the Mainframe</p>
                </div>
            </header>

            {/* KEY MANIFESTATION AREA */}
            <AnimatePresence>
                {generatedKey && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 max-w-2xl mx-auto"
                    >
                        <Card className="bg-slate-900 border-4 border-yellow-400/50 rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(245,158,11,0.2)]">
                            <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                            <CardHeader className="text-center p-8 bg-yellow-400/10 border-b border-yellow-400/20">
                                <div className="flex justify-center mb-4"><CheckCircle className="h-12 w-12 text-yellow-400 animate-bounce"/></div>
                                <CardTitle className="text-3xl font-black uppercase italic text-white tracking-tighter">ACCESS KEY MANIFEST</CardTitle>
                                <CardDescription className="font-bold text-yellow-500/60 uppercase text-[10px] tracking-widest">Authorized Device-Locked Credential</CardDescription>
                            </CardHeader>
                            <CardContent className="p-10 space-y-8 text-center">
                                <div className="relative group">
                                    <div className="p-6 rounded-2xl bg-black/40 border-2 border-white/10 font-mono text-3xl sm:text-4xl font-black tracking-[0.2em] text-yellow-400 break-all">
                                        {generatedKey}
                                    </div>
                                    <Button size="icon" variant="ghost" className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full h-12 w-12 bg-white/5 hover:bg-yellow-400 hover:text-black transition-all" onClick={copyKey}>
                                        {isCopied ? <Check className="h-6 w-6"/> : <Copy className="h-6 w-6"/>}
                                    </Button>
                                </div>
                                <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 text-blue-400 flex items-start gap-4 text-left">
                                    <Info className="h-5 w-5 shrink-0 mt-1"/>
                                    <p className="text-xs font-medium leading-relaxed italic">
                                        "Copy this key now. It is a one-time credential that binds to the first device it activates on. It cannot be used by any other Citizen record."
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Download Portal Activated</p>
                                    <Button asChild size="lg" className="w-full h-20 rounded-[2.5rem] bg-white text-black font-black text-2xl italic hover:bg-slate-200 shadow-2xl">
                                        <Link href="https://mindmate-elite.app/download">
                                            <Download className="mr-3 h-8 w-8"/> INSTALL ELITE APP
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative z-10">
                {/* Marketing & Features */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Elite Capabilities</h2>
                        <p className="text-slate-400 font-medium leading-relaxed italic">"Web technologies are limited. The Elite application breaches those limits, granting us absolute control over the student hardware layer."</p>
                    </div>

                    <div className="grid gap-4">
                        <EliteFeature icon={Fingerprint} label="Device-Level Identity" desc="Secure biometric binding for ultimate profile safety." />
                        <EliteFeature icon={Cpu} label="Hardware Acceleration" desc="Zero-latency Focus Engine processing." />
                        <EliteFeature icon={Lock} label="Kernel-Level Focus" desc="Blocks distractions at the OS level, impossible to bypass." />
                        <EliteFeature icon={Globe} label="Offline Mainframe" desc="Full tool access even without an active data signal." />
                    </div>
                </div>

                {/* Purchase Matrix */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 border-2 border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                        <CardHeader className="p-8 sm:p-10 border-b border-white/5 bg-white/5">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
                                <Zap className="h-4 w-4"/> Ingress Matrix
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 sm:p-10 space-y-4">
                            {ELITE_PLANS.map((plan) => (
                                <button 
                                    key={plan.id}
                                    onClick={() => plan.type === 'money' ? handlePurchaseWithMoney(plan) : handlePurchaseWithCredits(plan)}
                                    disabled={!!isProcessing || !!generatedKey}
                                    className="w-full group relative overflow-hidden p-6 rounded-[2rem] border-2 border-white/5 bg-white/[0.02] hover:bg-primary/5 hover:border-primary/40 transition-all duration-500 text-left"
                                >
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-6">
                                            <div className={cn("p-4 rounded-2xl bg-black/40 border border-white/10 group-hover:scale-110 transition-transform", plan.color)}>
                                                <plan.icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-black uppercase italic text-white tracking-tight">{plan.label}</h4>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{plan.desc}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {isProcessing === plan.id ? (
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            ) : (
                                                <>
                                                    <p className="text-2xl font-black text-white italic tabular-nums">{plan.currency === 'CR' ? '' : '₹'}{plan.price}{plan.currency === 'CR' ? ' CR' : ''}</p>
                                                    <p className="text-[8px] font-black uppercase text-primary tracking-widest opacity-60">Authorize</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </CardContent>
                        <CardFooter className="px-10 pb-10 flex flex-col gap-4">
                            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center gap-3">
                                <ShieldAlert className="h-5 w-5 text-red-500 shrink-0"/>
                                <p className="text-[10px] font-bold text-red-500/80 uppercase italic">"Device-Locked: Access is restricted to the first machine authorized."</p>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function EliteFeature({ icon: Icon, label, desc }: any) {
    return (
        <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex items-center gap-6 group hover:bg-white/[0.08] transition-all">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-primary group-hover:scale-110 transition-transform">
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <h4 className="font-black text-lg uppercase italic text-white leading-none">{label}</h4>
                <p className="text-sm text-slate-500 font-medium mt-1">{desc}</p>
            </div>
        </div>
    );
}

function updateDoc(arg0: any, arg1: { eliteKeys: any; }) {
    throw new Error('Function not implemented.');
}

