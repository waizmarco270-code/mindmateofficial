
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUsers, WalletTransaction } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { Wallet, Landmark, ArrowUpCircle, History, ShieldCheck, Loader2, TrendingUp, Vault } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createRazorpayOrder } from '@/app/actions/razorpay';
import Script from 'next/script';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

// Environment variable for public key, though we now prefer the synced key from order
const RAZORPAY_PUBLIC_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SVrJPgT8gQO914';

export default function WalletPage() {
    const { user } = useUser();
    const { currentUserData, topUpWallet } = useUsers();
    const { toast } = useToast();

    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

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
                key: order.keyId, // USE THE SYNCED KEY FROM SERVER
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
                    <Badge variant="outline" className="bg-background border-primary/20 text-primary px-3 py-1 font-black">STABLE v2.5</Badge>
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
                            <div className="h-8 w-12 bg-white/10 rounded-md border border-white/10 flex items-center justify-center font-black text-[10px] text-white/50">NEXUS</div>
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10 pt-4 pb-12">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-blue-400/80">₹</span>
                            <span className="text-7xl font-black tracking-tighter text-white [text-shadow:0_0_20px_rgba(255,255,255,0.2)]">
                                {balance.toLocaleString()}
                            </span>
                        </div>
                        <div className="mt-8 grid grid-cols-3 gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            <div><p>Status</p><p className="text-emerald-400 text-sm">ACTIVE</p></div>
                            <div><p>Network</p><p className="text-white text-sm">MAINNET</p></div>
                            <div><p>Tier</p><p className="text-white text-sm">LEGEND</p></div>
                        </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-primary to-purple-500" />
                </Card>

                {/* Deposit Card */}
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
                                    className="flex-1 rounded-xl font-bold"
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

            {/* Real-time Ledger */}
            <Card className="border-primary/10">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                        <span className="flex items-center gap-2"><History className="h-5 w-5 text-primary" /> Activity Ledger</span>
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Vault Sync</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[300px]">
                        {transactions.length > 0 ? (
                            <div className="space-y-3 pr-4">
                                {transactions.slice().reverse().map((tx, i) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={i} 
                                        className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-white/5"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                                                <ArrowUpCircle className="h-5 w-5"/>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black capitalize tracking-tight">{tx.type.replace('_', ' ')}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase">{format(parseISO(tx.date), 'MMM d, h:mm a')}</p>
                                            </div>
                                        </div>
                                        <p className="font-black text-lg tracking-tighter text-emerald-500">
                                            +₹{tx.amount}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 opacity-30">
                                <History className="h-12 w-12 mb-2" />
                                <p className="font-bold uppercase tracking-widest text-xs">No entries found</p>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-500/10 via-primary/5 to-indigo-500/10 border border-blue-500/20 flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-500">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h4 className="font-bold text-blue-700 dark:text-blue-300 uppercase text-xs tracking-widest">Legal Notice</h4>
                    <p className="text-sm text-blue-700/80 dark:text-blue-300/80 leading-relaxed font-medium">
                        MindMate is a digital learning platform. Credits and Vault balances are dedicated assets for in-app services. To ensure security, all deposits are one-way and can only be used for unlocking premium academic content.
                    </p>
                </div>
            </div>
        </div>
    );
}
