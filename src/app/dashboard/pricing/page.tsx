
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Check, Sparkles, Crown, Zap, 
    Gem, ShieldCheck, Flame, 
    ArrowRight, Star, Loader2,
    Trophy, Rocket, ShieldAlert,
    Smartphone, Globe, X
} from 'lucide-react';
import { useAdmin } from '@/hooks/use-admin';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { createRazorpayOrder } from '@/app/actions/razorpay';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';

function PlusSuccessDialog({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (o: boolean) => void }) {
    const router = useRouter();
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border-none p-0 bg-transparent shadow-none outline-none">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative p-8 rounded-[3rem] overflow-hidden bg-background border-4 premium-rainbow-border text-center space-y-6"
                >
                    {/* Background Animation */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        <div className="absolute inset-0 rainbow-aurora-bg animate-pulse" />
                    </div>

                    <div className="relative z-10">
                        <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center mb-6">
                            <Crown className="h-12 w-12 text-primary animate-bounce" />
                        </div>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-foreground drop-shadow-sm">CONGRATULATIONS!</h2>
                        <p className="text-muted-foreground font-bold uppercase tracking-widest mt-2">You have ascended to MindMate Plus</p>
                    </div>

                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 shadow-inner relative z-10">
                        <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-4">Identity Assets Secured</p>
                        <div className="flex flex-col items-center gap-4">
                            <div className="scale-125 transform transition-transform">
                                <span className="premium-badge"><Crown className="h-3 w-3"/> PREMIUM</span>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium italic">"Your legend is now permanent in the mainframe."</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                        <Button variant="outline" className="h-14 rounded-2xl font-black uppercase tracking-widest border-2" onClick={() => router.push('/dashboard/profile')}>
                            VISIT PROFILE
                        </Button>
                        <Button className="h-14 rounded-2xl font-black uppercase tracking-widest bg-primary shadow-xl shadow-primary/20" onClick={() => router.push('/dashboard')}>
                            EXPLORE HUB
                        </Button>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}

export default function PricingPage() {
    const { currentUserData, claimPlusMembership, appSettings } = useAdmin();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);

    const plusMemberCount = appSettings?.plusMemberCount || 0;
    const slotsLeft = Math.max(0, 100 - plusMemberCount);
    const isPlusMember = currentUserData?.isPlusMember;

    const handlePurchase = async () => {
        if (isPlusMember) {
            toast({ title: "Already a Legend", description: "You already have MindMate Plus access." });
            return;
        }

        setIsProcessing(true);
        try {
            const order = await createRazorpayOrder(199, {
                userId: currentUserData!.uid,
                packName: 'MindMate Plus (Permanent)',
                credits: 5000
            });

            const options = {
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: 'MindMate Plus',
                description: 'Permanent Sovereign Access',
                order_id: order.id,
                handler: async function (response: any) {
                    await claimPlusMembership(response.razorpay_payment_id);
                    setIsProcessing(false);
                    setIsSuccessOpen(true);
                },
                theme: { color: '#8b5cf6' },
                modal: { ondismiss: () => setIsProcessing(false) }
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Order Failed", description: error.message });
            setIsProcessing(false);
        }
    };

    const features = [
        { icon: Crown, text: 'Legendary "Premium" Identity Badge', color: 'text-yellow-400' },
        { icon: Zap, text: 'Instant Injection: 5,000 Mainframe Credits', color: 'text-primary' },
        { icon: ShieldCheck, text: 'Permanent Alpha Glow in World Chat', color: 'text-pink-500' },
        { icon: Star, text: 'Elite Lounge: Immediate Authorization', color: 'text-amber-500' },
        { icon: ShieldAlert, text: '5x Penalty Aegis Shields', color: 'text-blue-400' },
        { icon: Flame, text: '5x Chronos Streak Freezes', color: 'text-orange-500' },
        { icon: Smartphone, text: 'Sovereign Rainbow Identity Frame', color: 'text-cyan-400' },
        { icon: Globe, text: 'Lifetime Future Protocol Updates', color: 'text-emerald-400' },
    ];

    return (
        <div className="space-y-12 pb-20 max-w-5xl mx-auto px-4 relative overflow-hidden">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <PlusSuccessDialog isOpen={isSuccessOpen} onOpenChange={setIsSuccessOpen} />
            
            <div className="text-center space-y-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto w-20 h-20 rounded-[2rem] bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-2xl">
                    <Crown className="h-10 w-10 text-primary animate-bounce" />
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">MindMate Plus</h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Protocol: Permanent Ascension</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {features.map((f, i) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                transition={{ delay: i * 0.1 }}
                                key={i} 
                                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/30 transition-all"
                            >
                                <div className={cn("p-2 rounded-xl bg-black/20", f.color)}>
                                    <f.icon className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-bold text-slate-200">{f.text}</span>
                            </motion.div>
                        ))}
                    </div>

                    <Card className="bg-primary/5 border-primary/20 rounded-[2rem] overflow-hidden">
                        <CardHeader className="p-6 pb-2 text-center">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Identity Asset Showcase</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-center gap-12">
                            <div className="flex flex-col items-center gap-3">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Premium Badge</p>
                                <div className="scale-125 transition-transform hover:scale-150 duration-500">
                                    <span className="premium-badge"><Crown className="h-3 w-3"/> PREMIUM</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Kinetic Frame</p>
                                <div className="avatar-frame-premium p-[3px] rounded-full">
                                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center font-black text-xs text-muted-foreground">PREVIEW</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-5">
                    <Card className="relative overflow-hidden border-2 border-primary/40 bg-slate-900 shadow-[0_0_60px_rgba(139,92,246,0.3)] rounded-[3rem]">
                        <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                        <CardHeader className="text-center p-8 sm:p-10 relative z-10 border-b border-white/5 bg-white/5">
                            <div className="flex justify-center mb-4">
                                <Badge className="bg-red-500 text-white font-black animate-pulse px-4 py-1">LIMITED FOUNDER SLOTS</Badge>
                            </div>
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <span className="text-sm font-black text-muted-foreground line-through opacity-50">₹999 / MONTH</span>
                                <span className="text-xs font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">90% OFF</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-7xl font-black tracking-tighter text-white">₹199</span>
                                <span className="text-2xl font-black text-primary uppercase italic tracking-tighter mt-[-10px]">PERMANENT</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 sm:p-10 space-y-8 relative z-10">
                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                                    <span>Founder Capacity</span>
                                    <span>{plusMemberCount} / 100 SIGNED</span>
                                </div>
                                <Progress value={plusMemberCount} className="h-2 bg-white/5" indicatorClassName="animated-rainbow-progress" />
                                <p className="text-[9px] text-center text-muted-foreground font-bold uppercase">{slotsLeft} Elite slots remain at this price.</p>
                            </div>

                            <ul className="space-y-4 text-xs font-bold text-slate-300">
                                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-green-500" /> One-time payment. Forever Access.</li>
                                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-green-500" /> Rainbow Kinetic Border Profile.</li>
                                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-green-500" /> Priority Mainframe Support.</li>
                            </ul>
                        </CardContent>
                        <CardFooter className="p-8 sm:p-10 pt-0 relative z-10">
                            <Button 
                                onClick={handlePurchase} 
                                disabled={isProcessing || slotsLeft === 0 || isPlusMember}
                                className="w-full h-16 rounded-2xl text-xl font-black uppercase shadow-2xl bg-primary hover:bg-primary/90 group"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" /> : isPlusMember ? 'LEGACY STATUS ACTIVE' : slotsLeft === 0 ? 'CAPACITY REACHED' : 'AUTHORIZE ASCENSION'}
                                {!isProcessing && !isPlusMember && slotsLeft > 0 && <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            <div className="p-10 rounded-[3rem] bg-primary/5 border border-primary/20 text-center max-w-3xl mx-auto space-y-4">
                <h4 className="text-xl font-black uppercase italic text-primary">Why Plus?</h4>
                <p className="text-slate-400 font-medium leading-relaxed italic">
                    "Standard students study. Plus Legends dominate. By securing a Founder Slot, you're not just buying features; you're anchoring your identity in the MindMate elite forever. No subscriptions, no renewals. Just absolute mastery."
                </p>
            </div>
        </div>
    );
}
