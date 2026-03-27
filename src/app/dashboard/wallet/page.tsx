
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUsers, WalletTransaction } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { Wallet, Landmark, ArrowUpCircle, ArrowDownCircle, History, ShieldCheck, Loader2, AlertTriangle, Clock, Gem, CheckCircle2, TrendingUp, Vault, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createRazorpayOrder } from '@/app/actions/razorpay';
import Script from 'next/script';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const RAZORPAY_PUBLIC_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SVrJPgT8gQO914';

export default function WalletPage() {
    const { user } = useUser();
    const { currentUserData, topUpWallet, requestWithdrawal } = useUsers();
    const { toast } = useToast();

    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');

    const balance = currentUserData?.walletBalance || 0;
    const transactions = currentUserData?.walletTransactions || [];
    const lastDepositDate = currentUserData?.lastWalletDeposit ? parseISO(currentUserData.lastWalletDeposit) : null;
    const daysSinceLastDeposit = lastDepositDate ? differenceInDays(new Date(), lastDepositDate) : 7;
    const isWithdrawLocked = daysSinceLastDeposit < 7;

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
                packName: 'Vault Top Up',
                credits: 0
            });

            const options = {
                key: RAZORPAY_PUBLIC_KEY,
                amount: order.amount,
                currency: order.currency,
                name: 'MindMate Vault',
                description: `Top up vault with ₹${numAmount}`,
                order_id: order.id,
                handler: async function (response: any) {
                    await topUpWallet(numAmount, response.razorpay_payment_id);
                    toast({ title: "Assets Secured!", description: `₹${numAmount} successfully deposited into your vault.` });
                    setAmount('');
                    setIsProcessing(false);
                },
                prefill: {
                    name: user.fullName || '',
                    email: user.primaryEmailAddress?.emailAddress || '',
                },
                theme: { color: '#8b5cf6' },
                modal: { ondismiss: () => setIsProcessing(false) }
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Vault Error", description: error.message });
            setIsProcessing(false);
        }
    };

    const handleWithdraw = async () => {
        const numAmount = parseFloat(withdrawAmount);
        if (!numAmount || numAmount < 10) {
            toast({ variant: 'destructive', title: "Invalid Amount", description: "Minimum withdrawal is ₹10." });
            return;
        }
        if (numAmount > balance) {
            toast({ variant: 'destructive', title: "Insufficient Assets" });
            return;
        }

        setIsProcessing(true);
        try {
            await requestWithdrawal(numAmount);
            toast({ title: "Transfer Initialized", description: "Liquidation request received. Verification takes 2-3 business days." });
            setWithdrawAmount('');
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Request Failed", description: error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-8 pb-20 max-w-5xl mx-auto px-4">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            
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
                    <Badge variant="outline" className="bg-background border-primary/20 text-primary px-3 py-1 font-black">STABLE v2.0</Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Balance Card */}
                <Card className="lg:col-span-7 relative overflow-hidden border-0 bg-slate-900 shadow-2xl">
                    <div className="absolute inset-0 blue-nebula-bg opacity-20" />
                    <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]" />
                    
                    <CardHeader className="relative z-10">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Total Liquid Value</CardTitle>
                            <div className="h-8 w-12 bg-white/10 rounded-md border border-white/10 flex items-center justify-center font-black text-[10px] text-white/50">VISA</div>
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10 pt-4 pb-12">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-blue-400/80">₹</span>
                            <span className="text-7xl font-black tracking-tighter text-white [text-shadow:0_0_20px_rgba(255,255,255,0.2)]">
                                {balance.toLocaleString()}
                            </span>
                        </div>
                        <div className="mt-8 grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground uppercase">Status</p>
                                <p className="text-sm font-bold text-emerald-400">VERIFIED</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground uppercase">Network</p>
                                <p className="text-sm font-bold text-white">NEXUS MAINNET</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground uppercase">Last Activity</p>
                                <p className="text-sm font-bold text-white">
                                    {transactions.length > 0 ? format(parseISO(transactions[transactions.length - 1].date), 'dd/MM/yy') : 'NONE'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-primary to-purple-500" />
                </Card>

                {/* Quick Actions Card */}
                <Card className="lg:col-span-5 border-primary/10 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Asset Ingress
                        </CardTitle>
                        <CardDescription>Instant top-up via Secure Payment Gateway.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-2">
                            {[10, 50, 100].map(val => (
                                <Button 
                                    key={val} 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setAmount(String(val))} 
                                    className="flex-1 rounded-xl font-bold hover:bg-primary/10 hover:text-primary transition-all"
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
                                    className="h-14 text-2xl font-black pl-10 rounded-2xl bg-muted/30 border-primary/10 focus-visible:ring-primary/30"
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-primary/50">₹</span>
                            </div>
                            <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 group" onClick={handleTopUp} disabled={isProcessing || !amount}>
                                {isProcessing ? <Loader2 className="animate-spin" /> : <ArrowUpCircle className="mr-2 h-6 w-6 group-hover:scale-110 transition-transform"/>}
                                SECURE DEPOSIT
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Withdrawal Control */}
                <Card className={cn("lg:col-span-5 relative overflow-hidden", isWithdrawLocked && "opacity-80")}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ArrowDownCircle className="h-5 w-5 text-rose-500" />
                                Liquidation
                            </CardTitle>
                            {isWithdrawLocked && <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 font-bold">LOCKED</Badge>}
                        </div>
                        <CardDescription>Withdraw funds to original source.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isWithdrawLocked ? (
                            <div className="space-y-4 p-6 rounded-2xl bg-muted/50 border-2 border-dashed border-primary/10">
                                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-muted-foreground">
                                    <span>Vault Maturity</span>
                                    <span>{((daysSinceLastDeposit / 7) * 100).toFixed(0)}%</span>
                                </div>
                                <Progress value={(daysSinceLastDeposit / 7) * 100} className="h-3 rounded-full" />
                                <div className="flex items-start gap-3 mt-4 text-xs leading-relaxed text-muted-foreground">
                                    <Lock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                    <p>Withdrawal capability is locked for <strong>7 days</strong> post-deposit to ensure network stability. <br/><span className="text-primary font-bold">Available in {7 - daysSinceLastDeposit} days.</span></p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="relative">
                                    <Input 
                                        type="number" 
                                        placeholder="Min ₹10" 
                                        value={withdrawAmount} 
                                        onChange={e => setWithdrawAmount(e.target.value)}
                                        className="h-14 text-2xl font-black pl-10 rounded-2xl"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-rose-500/50">₹</span>
                                </div>
                                <Button variant="secondary" className="w-full h-14 rounded-2xl font-black text-lg border border-primary/10" onClick={handleWithdraw} disabled={isProcessing || !withdrawAmount}>
                                    {isProcessing ? <Loader2 className="animate-spin" /> : <ArrowDownCircle className="mr-2 h-6 w-6"/>}
                                    INITIATE TRANSFER
                                </Button>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase text-center tracking-widest">Compliance Verification: 48-72 Hours</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Real-time Ledger */}
                <Card className="lg:col-span-7 flex flex-col border-primary/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center justify-between">
                            <span className="flex items-center gap-2"><History className="h-5 w-5 text-primary" /> Immutable Ledger</span>
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Live Sync</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ScrollArea className="h-[280px]">
                            {transactions.length > 0 ? (
                                <div className="space-y-3 pr-4">
                                    {transactions.slice().reverse().map((tx, i) => (
                                        <motion.div 
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            key={i} 
                                            className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-white/5 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "p-3 rounded-xl shadow-inner",
                                                    tx.type === 'topup' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                                )}>
                                                    {tx.type === 'topup' ? <ArrowUpCircle className="h-5 w-5"/> : <ArrowDownCircle className="h-5 w-5"/>}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black capitalize tracking-tight">{tx.type.replace('_', ' ')}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{format(parseISO(tx.date), 'MMM d, h:mm a')}</p>
                                                </div>
                                            </div>
                                            <p className={cn(
                                                "font-black text-lg tracking-tighter",
                                                tx.amount > 0 ? "text-emerald-500" : "text-rose-500"
                                            )}>
                                                {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-48 opacity-30 text-center">
                                    <History className="h-12 w-12 mb-2" />
                                    <p className="font-bold uppercase tracking-widest text-xs">No entries found</p>
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-500/10 via-primary/5 to-indigo-500/10 border border-blue-500/20 flex items-start gap-4 shadow-inner">
                <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-500 border border-blue-500/20">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h4 className="font-bold text-blue-700 dark:text-blue-300 uppercase text-xs tracking-widest">Protocol: Vault Security v2.4</h4>
                    <p className="text-sm text-blue-700/80 dark:text-blue-300/80 leading-relaxed font-medium">
                        Your MindMate Vault is protected by end-to-end encryption. Funds stored here are dedicated to your academic growth and can be used for zero-fee purchases across the Nexus Emporium.
                    </p>
                </div>
            </div>
        </div>
    );
}
