
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUsers, WalletTransaction } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { Wallet, Landmark, ArrowUpCircle, History, ShieldCheck, Loader2, TrendingUp, Vault, Ticket, Sparkles, Trophy, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createRazorpayOrder } from '@/app/actions/razorpay';
import Script from 'next/script';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';

function RedemptionSuccessDialog({ isOpen, onOpenChange, amount }: { isOpen: boolean, onOpenChange: (o: boolean) => void, amount: number }) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border-0 bg-transparent shadow-none p-0">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative overflow-hidden rounded-[3rem] bg-background border-4 border-emerald-500/20 p-8 text-center"
                >
                    {/* Currency Rain Background */}
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
                                    "absolute font-black text-emerald-500/20 select-none",
                                    i % 2 === 0 ? "text-2xl" : "text-xl"
                                )}
                            >
                                ₹
                            </motion.div>
                        ))}
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="mx-auto w-24 h-24 rounded-full bg-emerald-500/10 border-4 border-emerald-500/20 flex items-center justify-center">
                            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                                <Trophy className="h-12 w-12 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                            </motion.div>
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">LIQUIDITY SECURED!</h2>
                            <p className="text-muted-foreground font-medium">Redemption protocol complete. Asset transfer confirmed.</p>
                        </div>

                        <div className="p-6 rounded-3xl bg-emerald-500/5 border-2 border-emerald-500/20 shadow-inner">
                            <p className="text-xs font-black uppercase text-emerald-500/60 tracking-widest mb-1">Value Unlocked</p>
                            <p className="text-6xl font-black text-emerald-500 tracking-tighter italic">₹{amount}</p>
                        </div>

                        <Button onClick={() => onOpenChange(false)} size="lg" className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xl rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.3)]">
                            VAULT SYNCED
                        </Button>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}

export default function WalletPage() {
    const { user } = useUser();
    const { currentUserData, topUpWallet, redeemCode } = useUsers();
    const { toast } = useToast();

    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [redeemInput, setRedeemInput] = useState('');
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [showRedeemSuccess, setShowRedeemSuccess] = useState(false);
    const [redeemedAmount, setRedeemedAmount] = useState(0);

    const balance = currentUserData?.walletBalance || 0;
    const transactions = currentUserData?.walletTransactions || [];

    const handleTopUp = async () => {
        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount < 1 || !user) {
            toast({ variant: 'destructive', title: "Invalid Amount", description: "Minimum top-up is ₹1." });
            return;
        }

        setIsProcessing(true);
        try {
            const order = await createRazorpayOrder(numAmount, {
                userId: user.id,
                packName: 'Vault Deposit',
                credits: 0
            });

            const options = {
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: 'MindMate Vault',
                description: `Deposit ₹${numAmount} into vault`,
                order_id: order.id,
                handler: async function (response: any) {
                    await topUpWallet(numAmount, response.razorpay_payment_id);
                    toast({ title: "Assets Secured!", description: `₹${numAmount} successfully deposited.` });
                    setAmount('');
                    setIsProcessing(false);
                },
                prefill: {
                    name: user.fullName || '',
                    email: user.primaryEmailAddress?.emailAddress || '',
                },
                theme: { color: '#8b5cf6' },
                modal: { 
                    ondismiss: () => setIsProcessing(false),
                    escape: false,
                    backdropclose: false
                },
                retry: { enabled: false }
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                toast({ variant: 'destructive', title: "Deposit Failed", description: response.error.description });
                setIsProcessing(false);
            });
            rzp.open();
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Vault Error", description: error.message || "Failed to initiate payment." });
            setIsProcessing(false);
        }
    };

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!redeemInput.trim() || isRedeeming) return;

        setIsRedeeming(true);
        try {
            const value = await redeemCode(redeemInput);
            setRedeemedAmount(value);
            setShowRedeemSuccess(true);
            setRedeemInput('');
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Redemption Failed", description: error.message });
        } finally {
            setIsRedeeming(false);
        }
    };

    return (
        <div className="space-y-8 pb-20 max-w-5xl mx-auto px-4">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            
            <RedemptionSuccessDialog isOpen={showRedeemSuccess} onOpenChange={setShowRedeemSuccess} amount={redeemedAmount} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-3xl bg-primary/10 text-primary border border-primary/20 shadow-xl shadow-primary/5">
                        <Vault className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">MindMate Vault</h1>
                        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                            <ShieldCheck className="h-3 w-3 text-emerald-500" /> Secure Digital Asset Management
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-2xl border border-white/5">
                    <Badge variant="outline" className="bg-background border-primary/20 text-primary px-3 py-1 font-black uppercase">Mainnet v2.5</Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Balance Card */}
                <Card className="lg:col-span-7 relative overflow-hidden border-0 bg-slate-900 shadow-2xl rounded-[2.5rem]">
                    <div className="absolute inset-0 blue-nebula-bg opacity-20" />
                    <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]" />
                    
                    <CardHeader className="relative z-10 p-8 sm:p-10">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Total Liquid Value</CardTitle>
                            <div className="h-8 w-12 bg-white/10 rounded-md border border-white/10 flex items-center justify-center font-black text-[10px] text-white/50">NEXUS</div>
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10 px-8 sm:px-10 pb-12">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-blue-400/80 italic">₹</span>
                            <span className="text-7xl sm:text-8xl font-black tracking-tighter text-white [text-shadow:0_0_20px_rgba(255,255,255,0.2)]">
                                {balance.toLocaleString()}
                            </span>
                        </div>
                        <div className="mt-10 grid grid-cols-3 gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            <div><p className="opacity-50">Status</p><p className="text-emerald-400 text-sm font-black">ACTIVE</p></div>
                            <div><p className="opacity-50">Network</p><p className="text-white text-sm font-black">MAINNET</p></div>
                            <div><p className="opacity-50">Identity</p><p className="text-white text-sm font-black">LEGEND</p></div>
                        </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-primary to-purple-500" />
                </Card>

                {/* Deposit Card */}
                <Card className="lg:col-span-5 border-primary/10 bg-card/50 backdrop-blur-sm rounded-[2.5rem]">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2 uppercase italic">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Asset Ingress
                        </CardTitle>
                        <CardDescription>Instant top-up via Secure Uplink.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 space-y-6">
                        <div className="flex gap-2">
                            {[10, 50, 100].map(val => (
                                <Button 
                                    key={val} 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setAmount(String(val))} 
                                    className="flex-1 rounded-xl font-bold border-white/10"
                                >
                                    ₹{val}
                                </Button>
                            ))}
                        </div>
                        <div className="space-y-4">
                            <div className="relative">
                                <Input 
                                    type="number" 
                                    placeholder="Enter amount" 
                                    value={amount} 
                                    onChange={e => setAmount(e.target.value)}
                                    className="h-14 text-2xl font-black pl-10 rounded-2xl bg-muted/30 border-primary/10"
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-primary/50">₹</span>
                            </div>
                            <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-xl" onClick={handleTopUp} disabled={isProcessing || !amount}>
                                {isProcessing ? <Loader2 className="animate-spin" /> : <ArrowUpCircle className="mr-2 h-6 w-6"/>}
                                SECURE DEPOSIT
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Redeem Code Section */}
            <Card className="border-emerald-500/20 bg-emerald-500/5 rounded-[2.5rem] overflow-hidden relative group">
                <div className="absolute inset-0 bg-grid-slate-800/50 opacity-10" />
                <CardHeader className="relative z-10 p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl font-black uppercase italic text-emerald-500 flex items-center gap-3">
                            <Ticket className="h-8 w-8" />
                            Redeem Asset Token
                        </CardTitle>
                        <CardDescription className="text-emerald-600/80 font-medium text-base">Enter your encrypted token to unlock liquid assets.</CardDescription>
                    </div>
                    <form onSubmit={handleRedeem} className="flex gap-2 w-full md:w-auto">
                        <Input 
                            placeholder="MM-XXXX-XXXX-XXXX" 
                            value={redeemInput} 
                            onChange={e => setRedeemInput(e.target.value.toUpperCase())}
                            className="h-14 md:w-64 bg-background/80 border-emerald-500/30 font-black tracking-widest text-center"
                        />
                        <Button type="submit" disabled={isRedeeming || !redeemInput.trim()} className="h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 rounded-2xl">
                            {isRedeeming ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                            REDEEM
                        </Button>
                    </form>
                </CardHeader>
            </Card>

            {/* Activity Ledger */}
            <Card className="border-primary/10 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-4 border-b bg-muted/20">
                    <CardTitle className="text-lg flex items-center justify-between uppercase italic tracking-widest">
                        <span className="flex items-center gap-2"><History className="h-5 w-5 text-primary" /> Activity Ledger</span>
                        <span className="text-[10px] font-black uppercase text-muted-foreground opacity-60">Vault Persistence v2.5</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[400px]">
                        {transactions.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {transactions.slice().reverse().map((tx, i) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05 }}
                                        key={i} 
                                        className="flex items-center justify-between p-6 hover:bg-primary/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "p-3 rounded-2xl",
                                                tx.type === 'code_redemption' ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                                            )}>
                                                {tx.type === 'code_redemption' ? <Ticket className="h-6 w-6"/> : <ArrowUpCircle className="h-6 w-6"/>}
                                            </div>
                                            <div>
                                                <p className="text-base font-black capitalize tracking-tight">{tx.type.replace('_', ' ')}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase mt-0.5">{format(parseISO(tx.date), 'MMM d, yyyy • h:mm a')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn("text-2xl font-black tracking-tighter italic", tx.amount > 0 ? "text-emerald-500" : "text-destructive")}>
                                                {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                                            </p>
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest h-5 px-2">CONFIRMED</Badge>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 opacity-20">
                                <History className="h-16 w-16 mb-4" />
                                <p className="font-black uppercase tracking-[0.3em] text-xs text-center px-10">No verified ledger entries in current session</p>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            <div className="p-8 rounded-[2.5rem] bg-gradient-to-r from-blue-500/10 via-primary/5 to-indigo-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-inner text-center sm:text-left">
                <div className="p-4 rounded-3xl bg-blue-500/20 text-blue-500 shadow-lg">
                    <ShieldCheck className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                    <h4 className="font-black text-blue-700 dark:text-blue-300 uppercase text-xs tracking-[0.2em]">Legal & Security Notice</h4>
                    <p className="text-sm text-blue-700/80 dark:text-blue-300/80 leading-relaxed font-medium max-w-2xl">
                        MindMate Vault acts as a central liquid asset bridge. All code redemptions and deposits are cryptographically verified. Once an asset is integrated, it is dedicated to your academic ascension profile and cannot be reversed.
                    </p>
                </div>
            </div>
        </div>
    );
}
