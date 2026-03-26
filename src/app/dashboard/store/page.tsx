'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdmin, type CreditPack, useUsers, type StoreItem } from '@/hooks/use-admin';
import { Loader2, ShoppingCart, Gem, History, Check, ShieldCheck, ArrowRight, ShieldAlert, Award, Star, Zap, ShieldCheck as ShieldIcon, Snowflake, Sparkles, Gift, Bird, Moon, CheckCircle, Trophy, X, TrendingUp, Crown, Minus, Plus, CreditCard, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, SignedOut } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogTrigger, AlertDialogContent } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { createRazorpayOrder, verifyRazorpayPayment } from '@/app/actions/razorpay';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

// Hardcoded for frontend init stability in dev
const RAZORPAY_PUBLIC_KEY = 'rzp_test_SVrJPgT8gQO914';

const BadgeRenderer = ({ badge }: { badge?: string }) => {
    if (!badge) return null;
    return (
        <div className={cn(
            "absolute top-0 right-0 p-2 px-3 text-[10px] font-black uppercase tracking-widest rounded-bl-lg z-20 shadow-sm",
            badge === 'popular' && "bg-orange-500 text-white",
            badge === 'new' && "bg-blue-500 text-white",
            badge === 'recommended' && "bg-green-500 text-white",
            badge === 'exclusive' && "bg-purple-600 text-white",
            badge === 'limited' && "bg-red-600 text-white animate-pulse",
            badge === 'hot' && "bg-gradient-to-r from-orange-600 to-red-600 text-white",
            badge === 'best-seller' && "bg-cyan-600 text-white",
            badge === 'jackpot' && "bg-gradient-to-r from-yellow-400 to-amber-600 text-black",
            badge === 'buy-or-regret' && "bg-black text-red-500 border-b border-l border-red-500/50 animate-pulse",
            badge === 'rare' && "bg-blue-900 text-blue-200 border-b border-l border-blue-400",
            badge === 'worth-it' && "bg-green-600 text-white shadow-[0_0_10px_rgba(22,163,74,0.5)]",
            badge === 'loot-deal' && "bg-gradient-to-br from-fuchsia-600 to-purple-800 text-white italic",
            badge === 'dev-choice' && "bg-slate-800 text-indigo-300 border-b border-l border-indigo-500",
            badge === 'legendary' && "bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-400 text-amber-900 animate-gold-shine"
        )}>
            {badge.replace(/-/g, ' ')}
        </div>
    );
};

function PurchaseSuccessDialog({ isOpen, onOpenChange, itemName }: { isOpen: boolean, onOpenChange: (open: boolean) => void, itemName: string }) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border-0 bg-transparent shadow-none p-0">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative overflow-hidden rounded-3xl bg-background border-4 border-primary/20 p-8 text-center"
                >
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: -20, x: Math.random() * 400, opacity: 1 }}
                                animate={{ 
                                    y: 500, 
                                    x: (Math.random() - 0.5) * 200 + 200,
                                    rotate: 360,
                                    opacity: 0 
                                }}
                                transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                                className={cn(
                                    "absolute h-2 w-2 rounded-full",
                                    ["bg-yellow-400", "bg-primary", "bg-blue-400", "bg-green-400", "bg-pink-400"][Math.floor(Math.random() * 5)]
                                )}
                            />
                        ))}
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center">
                            <Trophy className="h-12 w-12 text-primary animate-bounce" />
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black tracking-tight text-primary">MISSION ACCOMPLISHED!</h2>
                            <p className="text-muted-foreground font-medium">You have successfully secured the</p>
                            <div className="inline-block px-4 py-2 rounded-xl bg-muted border font-bold text-xl">
                                {itemName}
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground italic">Check your inventory in the Nexus or Profile to equip your new asset.</p>

                        <Button onClick={() => onOpenChange(false)} size="lg" className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl">
                            Awesome!
                        </Button>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}

function CreditPacksTab({ onSuccess }: { onSuccess: (name: string) => void }) {
    const { creditPacks, loading } = useAdmin();
    const { user, isSignedIn } = useUser();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    const handleUpdateQuantity = (packId: string, delta: number) => {
        setQuantities(prev => {
            const current = prev[packId] || 1;
            const newVal = Math.max(1, Math.min(10, current + delta));
            return { ...prev, [packId]: newVal };
        });
    };

    const handleBuyPack = async (pack: CreditPack) => {
        if (!isSignedIn || !user) return;
        
        const qty = quantities[pack.id] || 1;
        const totalAmount = pack.price * qty;
        const totalCredits = pack.credits * qty;

        setIsProcessing(pack.id);
        try {
            const order = await createRazorpayOrder(totalAmount, {
                userId: user.id,
                packName: `${pack.name} (x${qty})`,
                credits: totalCredits
            });

            const options = {
                key: RAZORPAY_PUBLIC_KEY,
                amount: order.amount,
                currency: order.currency,
                name: 'MindMate',
                description: `Purchase ${pack.name} x${qty}`,
                order_id: order.id,
                handler: async function (response: any) {
                    const verification = await verifyRazorpayPayment(
                        user.id,
                        user.fullName || 'User',
                        `${pack.name} (x${qty})`,
                        totalCredits,
                        response.razorpay_order_id,
                        response.razorpay_payment_id,
                        response.razorpay_signature
                    );

                    if (verification.success) {
                        onSuccess(`${pack.name} (x${qty})`);
                    } else {
                        toast({ variant: 'destructive', title: "Verification Failed", description: verification.error || "Could not verify payment." });
                    }
                    setIsProcessing(null);
                },
                prefill: {
                    name: user.fullName || '',
                    email: user.primaryEmailAddress?.emailAddress || '',
                },
                theme: { color: '#8b5cf6' },
                modal: { 
                    ondismiss: () => setIsProcessing(null), 
                    escape: false, 
                    backdropclose: false 
                },
                retry: { enabled: false }
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Order Failed", description: error.message });
            setIsProcessing(null);
        }
    };

    return (
        <div className="space-y-8">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && Array.from({length:3}).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
                {!loading && creditPacks && creditPacks.map(pack => {
                    const qty = quantities[pack.id] || 1;
                    const totalCredits = pack.credits * qty;
                    const totalPrice = pack.price * qty;

                    return (
                        <Card key={pack.id} className="flex flex-col relative overflow-hidden group border-primary/20 bg-gradient-to-br from-card to-muted/30 hover:border-primary/50 transition-all duration-300">
                            <BadgeRenderer badge={pack.badge} />
                            <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(to_bottom,white_5%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardHeader className="text-center relative z-10">
                                <div className="mx-auto mb-4 h-20 w-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-white shadow-xl shadow-amber-500/20 group-hover:scale-110 transition-transform">
                                    <Gem className="h-10 w-10 drop-shadow-lg"/>
                                </div>
                                <CardTitle className="text-2xl font-black tracking-tight">{pack.name}</CardTitle>
                                <div className="flex flex-col mt-2">
                                    <span className="text-5xl font-black tracking-tighter text-primary">{totalCredits.toLocaleString()}</span>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Credits</span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col items-center gap-4 relative z-10">
                                <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-xl border border-white/5">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-10 w-10 rounded-lg hover:bg-primary/10" 
                                        onClick={() => handleUpdateQuantity(pack.id, -1)} 
                                        disabled={qty <= 1}
                                    >
                                        <Minus className="h-4 w-4"/>
                                    </Button>
                                    <span className="font-black text-xl w-8 text-center">{qty}</span>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-10 w-10 rounded-lg hover:bg-primary/10" 
                                        onClick={() => handleUpdateQuantity(pack.id, 1)} 
                                        disabled={qty >= 10}
                                    >
                                        <Plus className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </CardContent>
                            <CardFooter className="relative z-10 pt-0">
                                <Button 
                                    className="w-full text-lg h-14 font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all"
                                    onClick={() => handleBuyPack(pack)}
                                    disabled={!isSignedIn || isProcessing === pack.id}
                                >
                                    {isProcessing === pack.id ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : (
                                        <Zap className="mr-2 h-5 w-5 fill-current"/>
                                    )}
                                    Buy for ₹{totalPrice}
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </div>
    );
}

function ArtifactsTab({ onSuccess }: { onSuccess: (name: string) => void }) {
    const { storeItems, loading, redeemStoreItem, processStoreItemPayment } = useAdmin();
    const { currentUserData } = useUsers();
    const { user } = useUser();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const hasMasterCard = currentUserData?.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();

    const artifactItems = storeItems ? storeItems.filter(i => ['penalty-shield', 'streak-freeze', 'alpha-glow', 'clan-xp-booster', 'clan-level-max', 'scratch-card', 'card-flip'].includes(i.type)) : [];

    const handleUpdateQuantity = (itemId: string, delta: number) => {
        setQuantities(prev => ({
            ...prev,
            [itemId]: Math.max(1, (prev[itemId] || 1) + delta)
        }));
    };

    const handleBuyWithMethod = async (item: StoreItem, method: 'razorpay' | 'wallet') => {
        if (!user) return;
        const qty = quantities[item.id] || 1;
        const totalPrice = item.price! * qty;

        if (method === 'wallet' && (currentUserData?.walletBalance || 0) < totalPrice) {
            toast({ variant: 'destructive', title: "Insufficient Funds", description: "Top up your wallet to continue." });
            return;
        }

        setIsProcessing(item.id);
        try {
            if (method === 'razorpay') {
                const order = await createRazorpayOrder(totalPrice, { userId: user.id, packName: `${item.name} (x${qty})`, credits: 0 });
                const options = {
                    key: RAZORPAY_PUBLIC_KEY,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'MindMate Nexus',
                    description: `Purchase ${item.name} x${qty}`,
                    order_id: order.id,
                    handler: async function (response: any) {
                        await processStoreItemPayment(item, qty, response.razorpay_payment_id, 'razorpay');
                        onSuccess(`${item.name} (x${qty})`);
                        setIsProcessing(null);
                    },
                    prefill: { name: user.fullName || '', email: user.primaryEmailAddress?.emailAddress || '' },
                    theme: { color: '#8b5cf6' },
                    modal: { ondismiss: () => setIsProcessing(null) }
                };
                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            } else {
                await processStoreItemPayment(item, qty, `wall-${Date.now()}`, 'wallet');
                onSuccess(`${item.name} (x${qty})`);
                setIsProcessing(null);
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Purchase Failed", description: error.message });
            setIsProcessing(null);
        }
    };

    const handleRedeemWithCredits = async (item: StoreItem) => {
        const qty = quantities[item.id] || 1;
        setIsProcessing(item.id);
        try {
            await redeemStoreItem(item, qty);
            onSuccess(`${item.name} (x${qty})`);
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Redemption Failed", description: error.message });
        } finally {
            setIsProcessing(null);
        }
    };

    const getIcon = (type: string) => {
        switch(type) {
            case 'penalty-shield': return <ShieldIcon className="h-10 w-10 text-blue-400" />;
            case 'streak-freeze': return <Snowflake className="h-10 w-10 text-cyan-400" />;
            case 'alpha-glow': return <Sparkles className="h-10 w-10 text-fuchsia-400" />;
            case 'clan-xp-booster': return <TrendingUp className="h-10 w-10 text-emerald-400" />;
            case 'clan-level-max': return <Crown className="h-10 w-10 text-yellow-400 animate-gold-shine" />;
            case 'scratch-card': return <Gift className="h-10 w-10 text-orange-400" />;
            case 'card-flip': return <Zap className="h-10 w-10 text-indigo-400" />;
            default: return <Star className="h-10 w-10 text-amber-400" />;
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && Array.from({length:3}).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
             {!loading && artifactItems.map(item => {
                 const isMoney = item.paymentType === 'money';
                 const qty = quantities[item.id] || 1;
                 const totalCredits = item.cost * qty;
                 const totalPrice = item.price ? item.price * qty : 0;
                 const canAfford = isMoney ? true : (hasMasterCard || (currentUserData?.credits ?? 0) >= totalCredits);
                 
                 return (
                    <Card key={item.id} className={cn("flex flex-col relative overflow-hidden group border-2 transition-all duration-300", item.isFeatured ? "border-primary/40 shadow-lg shadow-primary/10" : "border-muted")}>
                        <BadgeRenderer badge={item.badge} />
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 p-4 rounded-full bg-muted group-hover:scale-110 transition-transform">
                                {getIcon(item.type)}
                            </div>
                            <CardTitle className="text-2xl font-bold">{item.name}</CardTitle>
                            <CardDescription className="min-h-[40px] px-4">{item.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col items-center gap-4">
                             <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-xl">
                                <Button variant="ghost" size="icon" onClick={() => handleUpdateQuantity(item.id, -1)} disabled={qty <= 1}><Minus/></Button>
                                <span className="font-black text-xl w-8 text-center">{qty}</span>
                                <Button variant="ghost" size="icon" onClick={() => handleUpdateQuantity(item.id, 1)} disabled={qty >= 10}><Plus/></Button>
                             </div>

                             <div className="font-black text-4xl flex items-center justify-center gap-2 text-amber-500 tracking-tighter">
                                {isMoney ? <span>₹{totalPrice}</span> : <><Gem className="h-8 w-8" /><span>{totalCredits.toLocaleString()}</span></>}
                            </div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Stock: {item.stock > 0 ? item.stock : <span className="text-destructive">SOLD OUT</span>}</p>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2">
                            {isMoney ? (
                                <div className="grid grid-cols-2 gap-2 w-full">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" className="font-bold border-primary/20" disabled={isProcessing === item.id || item.stock < qty}>
                                                <Wallet className="mr-2 h-4 w-4"/> Wallet
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Confirm Wallet Purchase</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to spend ₹{totalPrice} from your MindMate Wallet to secure {qty} units of {item.name}?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleBuyWithMethod(item, 'wallet')}>Confirm Purchase</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <Button className="font-bold" onClick={() => handleBuyWithMethod(item, 'razorpay')} disabled={isProcessing === item.id || item.stock < qty}>
                                        <CreditCard className="mr-2 h-4 w-4"/> Pay
                                    </Button>
                                </div>
                            ) : (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className="w-full text-lg h-14 font-bold rounded-xl" disabled={!canAfford || isProcessing === item.id || item.stock < qty}>
                                             {isProcessing === item.id ? <Loader2 className="mr-2 animate-spin"/> : <ShoppingCart className="mr-2 h-5 w-5"/>}
                                            {item.stock < qty ? "Sold Out" : `Secure x${qty}`}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Bulk Acquisition</AlertDialogTitle>
                                            <AlertDialogDescription>Secure {qty} units of "{item.name}" for {totalCredits} credits?</AlertDialogDescription>
                                        </AlertDialogHeader>
                                         <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleRedeemWithCredits(item)}>Confirm</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </CardFooter>
                    </Card>
                 )
            })}
        </div>
    )
}

function BadgesTab({ onSuccess }: { onSuccess: (name: string) => void }) {
    const { storeItems, loading, redeemStoreItem, processStoreItemPayment } = useAdmin();
    const { currentUserData } = useUsers();
    const { user } = useUser();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const hasMasterCard = currentUserData?.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();

    const badgeItems = storeItems ? storeItems.filter(i => ['early-bird', 'night-owl', 'knowledge-knight'].includes(i.type)) : [];

    const handleBuyWithMethod = async (item: StoreItem, method: 'razorpay' | 'wallet') => {
        if (!user) return;
        const qty = 1; // Force quantity to 1 for badges
        const price = item.price!;

        if (method === 'wallet' && (currentUserData?.walletBalance || 0) < price) {
            toast({ variant: 'destructive', title: "Insufficient Funds" });
            return;
        }

        setIsProcessing(item.id);
        try {
            if (method === 'razorpay') {
                const order = await createRazorpayOrder(price, { userId: user.id, packName: `${item.name}`, credits: 0 });
                const options = {
                    key: RAZORPAY_PUBLIC_KEY,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'MindMate Identity',
                    description: `Unlock ${item.name}`,
                    order_id: order.id,
                    handler: async function (response: any) {
                        await processStoreItemPayment(item, qty, response.razorpay_payment_id, 'razorpay');
                        onSuccess(`${item.name}`);
                        setIsProcessing(null);
                    },
                    prefill: { name: user.fullName || '', email: user.primaryEmailAddress?.emailAddress || '' },
                    theme: { color: '#8b5cf6' },
                    modal: { ondismiss: () => setIsProcessing(null) }
                };
                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            } else {
                await processStoreItemPayment(item, qty, `wall-${Date.now()}`, 'wallet');
                onSuccess(`${item.name}`);
                setIsProcessing(null);
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Failed", description: error.message });
            setIsProcessing(null);
        }
    };

    const handleRedeemWithCredits = async (item: StoreItem) => {
        const qty = 1; // Force quantity to 1
        setIsProcessing(item.id);
        try {
            await redeemStoreItem(item, qty);
            onSuccess(`${item.name}`);
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Failed", description: error.message });
        } finally {
            setIsProcessing(null);
        }
    };

    const renderBadgePreview = (type: string) => {
        switch(type) {
            case 'early-bird': return <div className="scale-150 py-4"><span className="early-bird-badge"><Bird className="h-3 w-3" /> EARLY BIRD</span></div>;
            case 'night-owl': return <div className="scale-150 py-4"><span className="night-owl-badge"><Moon className="h-3 w-3" /> NIGHT OWL</span></div>;
            case 'knowledge-knight': return <div className="scale-150 py-4"><span className="knowledge-knight-badge"><ShieldIcon className="h-3 w-3" /> KNIGHT</span></div>;
            default: return <Award className="h-16 w-16 text-amber-400" />;
        }
    }

    const hasBadge = (type: string) => {
        if (!currentUserData) return false;
        if (type === 'early-bird') return currentUserData.isEarlyBird;
        if (type === 'night-owl') return currentUserData.isNightOwl;
        if (type === 'knowledge-knight') return currentUserData.isKnowledgeKnight;
        return false;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!loading && badgeItems.map(item => {
                 const isMoney = item.paymentType === 'money';
                 const owned = hasBadge(item.type);
                 const totalCredits = item.cost;
                 const totalPrice = item.price ? item.price : 0;
                 const canAfford = isMoney ? true : (hasMasterCard || (currentUserData?.credits ?? 0) >= totalCredits);
                 
                 return (
                    <Card key={item.id} className={cn("flex flex-col relative overflow-hidden group border-2 transition-all duration-300", 
                        owned ? "border-green-500/50 bg-green-500/5 opacity-80" : item.isFeatured ? "border-primary/40 shadow-lg shadow-primary/10" : "border-muted"
                    )}>
                        <BadgeRenderer badge={item.badge} />
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-6 flex items-center justify-center min-h-[80px]">{renderBadgePreview(item.type)}</div>
                            <CardTitle className="text-2xl font-bold">{item.name}</CardTitle>
                            <CardDescription className="min-h-[40px] px-4">{item.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col items-center justify-center gap-4">
                             {owned ? (
                                <div className="flex flex-col items-center gap-2 text-green-500">
                                    <CheckCircle className="h-10 w-10" />
                                    <span className="font-bold uppercase tracking-widest text-xs">Unlocked</span>
                                </div>
                             ) : (
                                <>
                                    <div className="font-black text-4xl flex items-center justify-center gap-2 text-amber-500 tracking-tighter">
                                        {isMoney ? <span>₹{totalPrice}</span> : <><Gem className="h-8 w-8" /><span>{totalCredits.toLocaleString()}</span></>}
                                    </div>
                                    <p className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-widest">Limited Edition</p>
                                </>
                             )}
                        </CardContent>
                        <CardFooter>
                            {owned ? (
                                <Button className="w-full" variant="outline" disabled>Owned</Button>
                            ) : isMoney ? (
                                <div className="grid grid-cols-2 gap-2 w-full">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" onClick={() => {}} disabled={isProcessing === item.id}><Wallet className="mr-2 h-4 w-4"/> Wallet</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Identity Acquisition</AlertDialogTitle>
                                                <AlertDialogDescription>Unlock {item.name} for ₹{totalPrice} using your MindMate Wallet?</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleBuyWithMethod(item, 'wallet')}>Confirm</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <Button onClick={() => handleBuyWithMethod(item, 'razorpay')} disabled={isProcessing === item.id}><CreditCard className="mr-2 h-4 w-4"/> Pay</Button>
                                </div>
                            ) : (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className="w-full text-lg h-14 font-bold rounded-xl" disabled={!canAfford || isProcessing === item.id}>
                                             {isProcessing === item.id ? <Loader2 className="mr-2 animate-spin"/> : <ShoppingCart className="mr-2 h-5 w-5"/>}
                                            {item.stock <= 0 ? "Sold Out" : `Secure Access`}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Identity Claim</AlertDialogTitle>
                                            <AlertDialogDescription>Unlock "{item.name}" for {totalCredits} credits?</AlertDialogDescription>
                                        </AlertDialogHeader>
                                         <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleRedeemWithCredits(item)}>Confirm</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </CardFooter>
                    </Card>
                 )
            })}
        </div>
    )
}

export default function StorePage() {
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [purchasedItemName, setPurchasedItemName] = useState('');

    const handlePurchaseSuccess = (name: string) => {
        setPurchasedItemName(name);
        setSuccessDialogOpen(true);
    };

    return (
        <div className="space-y-8">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            
            <PurchaseSuccessDialog isOpen={successDialogOpen} onOpenChange={setSuccessDialogOpen} itemName={purchasedItemName} />

            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3 text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">
                        <ShoppingCart className="h-10 w-10"/> Nexus Emporium
                    </h1>
                    <p className="text-muted-foreground font-medium">Equip your study journey with premium credits and legendary artifacts.</p>
                </div>
                <Button asChild variant="outline" className="rounded-full px-6 border-primary/20 hover:bg-primary/5">
                    <Link href="/dashboard/store/history"><History className="mr-2 h-4 w-4 text-primary"/> Transaction Log</Link>
                </Button>
            </div>

            <Tabs defaultValue="buy" className="w-full">
                <div className="flex justify-center mb-8">
                    <TabsList className="grid w-full max-w-xl grid-cols-4 h-14 p-1 bg-muted/50 rounded-2xl border">
                        <TabsTrigger value="buy" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">Credits</TabsTrigger>
                        <TabsTrigger value="artifacts" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">Artifacts</TabsTrigger>
                        <TabsTrigger value="badges" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">Badges</TabsTrigger>
                        <TabsTrigger value="luck" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs sm:text-sm">Luck</TabsTrigger>
                    </TabsList>
                </div>
                
                <TabsContent value="buy" className="animate-in fade-in-50 duration-500">
                    <CreditPacksTab onSuccess={handlePurchaseSuccess} />
                </TabsContent>
                <TabsContent value="artifacts" className="animate-in fade-in-50 duration-500">
                    <ArtifactsTab onSuccess={handlePurchaseSuccess} />
                </TabsContent>
                <TabsContent value="badges" className="animate-in fade-in-50 duration-500">
                    <BadgesTab onSuccess={handlePurchaseSuccess} />
                </TabsContent>
                <TabsContent value="luck" className="animate-in fade-in-50 duration-500">
                    <div className="text-center py-20 space-y-4">
                        <Gift className="h-16 w-16 text-primary mx-auto opacity-20" />
                        <h3 className="text-xl font-bold text-muted-foreground">Looking for Scratch Cards?</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">They are now available in bulk in the <strong>Artifacts</strong> tab!</p>
                        <Button asChild variant="secondary"><Link href="/dashboard/reward">Go to Reward Zone</Link></Button>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-start gap-4 shadow-inner">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-500"><ShieldCheck className="h-6 w-6" /></div>
                <div>
                    <h4 className="font-bold text-blue-700 dark:text-blue-300">Nexus Security Protocol</h4>
                    <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mt-1">
                        All transactions are encrypted. You can now use your <strong>MindMate Wallet</strong> balance for instant zero-fee purchases of paid artifacts and badges.
                    </p>
                </div>
            </div>
        </div>
    );
}
