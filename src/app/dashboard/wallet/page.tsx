
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUsers, WalletTransaction } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { Wallet, Landmark, ArrowUpCircle, ArrowDownCircle, History, ShieldCheck, Loader2, AlertTriangle, Clock, Gem, CheckCircle2, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createRazorpayOrder } from '@/app/actions/razorpay';
import Script from 'next/script';
import { Badge } from '@/components/ui/badge';

// Hardcoded for frontend init stability in dev
const RAZORPAY_PUBLIC_KEY = 'rzp_test_SVrJPgT8gQO914';

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
                packName: 'Wallet Top Up',
                credits: 0
            });

            const options = {
                key: RAZORPAY_PUBLIC_KEY,
                amount: order.amount,
                currency: order.currency,
                name: 'MindMate Wallet',
                description: `Top up wallet with ₹${numAmount}`,
                order_id: order.id,
                handler: async function (response: any) {
                    await topUpWallet(numAmount, response.razorpay_payment_id);
                    toast({ title: "Funds Secured!", description: `₹${numAmount} added to your MindMate Wallet.` });
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
            toast({ variant: 'destructive', title: "Order Failed", description: error.message });
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
            toast({ variant: 'destructive', title: "Insufficient Funds" });
            return;
        }

        setIsProcessing(true);
        try {
            await requestWithdrawal(numAmount);
            toast({ title: "Withdrawal Requested", description: "Your request is being processed. It may take 2-3 business days." });
            setWithdrawAmount('');
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Request Failed", description: error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-8 pb-20 max-w-4xl mx-auto">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <Wallet className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">MindMate Vault</h1>
                    <p className="text-muted-foreground font-medium">Your personal digital safe for discipline and growth.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Balance Card */}
                <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                            Available Balance
                            <ShieldCheck className="h-4 w-4 text-primary" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="text-6xl font-black tracking-tighter text-primary">₹{balance.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            Funds are secured and accessible anytime.
                        </p>
                    </CardContent>
                </Card>

                {/* Quick Top Up */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Add Funds</CardTitle>
                        <CardDescription>Instant top-up via UPI or Cards.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            {[10, 50, 100].map(val => (
                                <Button key={val} variant="outline" size="sm" onClick={() => setAmount(String(val))} className="flex-1">
                                    ₹{val}
                                </Button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input 
                                type="number" 
                                placeholder="Enter amount" 
                                value={amount} 
                                onChange={e => setAmount(e.target.value)}
                                className="h-12 text-lg font-bold"
                            />
                            <Button className="h-12 px-6 font-bold" onClick={handleTopUp} disabled={isProcessing}>
                                {isProcessing ? <Loader2 className="animate-spin" /> : <ArrowUpCircle className="mr-2 h-5 w-5"/>}
                                Top Up
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Withdrawal Section */}
                <Card className={cn(isWithdrawLocked && "opacity-80")}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Withdraw Funds</CardTitle>
                            {isWithdrawLocked && <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">Locked</Badge>}
                        </div>
                        <CardDescription>Transfer balance back to your source account.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isWithdrawLocked ? (
                            <div className="space-y-3 p-4 rounded-xl bg-muted/50 border border-dashed">
                                <p className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                    <Clock className="h-4 w-4"/> Maturity Timer
                                </p>
                                <Progress value={(daysSinceLastDeposit / 7) * 100} className="h-2" />
                                <p className="text-xs text-muted-foreground">
                                    Withdrawal is enabled <strong>7 days</strong> after your last deposit to ensure fund stability. 
                                    <br/>Remaining: <strong>{7 - daysSinceLastDeposit} days</strong>.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Input 
                                        type="number" 
                                        placeholder="Min ₹10" 
                                        value={withdrawAmount} 
                                        onChange={e => setWithdrawAmount(e.target.value)}
                                        className="h-12 text-lg font-bold"
                                    />
                                    <Button variant="secondary" className="h-12 px-6 font-bold" onClick={handleWithdraw} disabled={isProcessing}>
                                        {isProcessing ? <Loader2 className="animate-spin" /> : <ArrowDownCircle className="mr-2 h-5 w-5"/>}
                                        Withdraw
                                    </Button>
                                </div>
                                <p className="text-[10px] text-muted-foreground italic text-center">Requests are processed manually within 48-72 hours.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* History Section */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <History className="h-5 w-5 text-muted-foreground" />
                            Vault History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ScrollArea className="h-48">
                            {transactions.length > 0 ? (
                                <div className="space-y-2">
                                    {transactions.slice().reverse().map((tx, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-full",
                                                    tx.type === 'topup' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                                )}>
                                                    {tx.type === 'topup' ? <ArrowUpCircle className="h-4 w-4"/> : <ArrowDownCircle className="h-4 w-4"/>}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold capitalize">{tx.type.replace('_', ' ')}</p>
                                                    <p className="text-[10px] text-muted-foreground">{format(parseISO(tx.date), 'MMM d, h:mm a')}</p>
                                                </div>
                                            </div>
                                            <p className={cn(
                                                "font-black text-sm",
                                                tx.amount > 0 ? "text-green-500" : "text-red-500"
                                            )}>
                                                {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-sm text-muted-foreground py-10 italic">No transactions recorded yet.</p>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-start gap-4 shadow-inner">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-500">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h4 className="font-bold text-blue-700 dark:text-blue-300">Vault Security Protocol</h4>
                    <p className="text-sm text-blue-700/80 dark:text-blue-300/80 leading-relaxed">
                        MindMate uses enterprise-grade encryption. Your funds are only used for isolation staking and study tools. All withdrawals are verified against the original payment source.
                    </p>
                </div>
            </div>
        </div>
    );
}
