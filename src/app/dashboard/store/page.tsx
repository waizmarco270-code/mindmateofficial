
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdmin, type CreditPack, useUsers, type StoreItem } from '@/hooks/use-admin';
import { Loader2, ShoppingCart, Gem, History, Check, ShieldCheck, ArrowRight, ShieldAlert, Award, Star, Zap, ShieldCheck as ShieldIcon, Snowflake, Sparkles, Gift } from 'lucide-react';
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

function CreditPacksTab() {
    const { creditPacks, loading } = useAdmin();
    const { user, isSignedIn } = useUser();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const handleBuyPack = async (pack: CreditPack) => {
        if (!isSignedIn || !user) return;
        
        setIsProcessing(pack.id);
        try {
            const order = await createRazorpayOrder(pack.price);
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'MindMate',
                description: `Purchase ${pack.name}`,
                order_id: order.id,
                handler: async function (response: any) {
                    const verification = await verifyRazorpayPayment(
                        user.id,
                        user.fullName || 'User',
                        pack.name,
                        pack.credits,
                        response.razorpay_order_id,
                        response.razorpay_payment_id,
                        response.razorpay_signature
                    );

                    if (verification.success) {
                        toast({
                            title: "Payment Successful!",
                            description: `${pack.credits} credits have been added to your account.`,
                            className: "bg-green-500/10 border-green-500/50"
                        });
                        window.location.replace('/dashboard/store/history');
                    } else {
                        toast({ variant: 'destructive', title: "Verification Failed", description: verification.error || "Could not verify payment." });
                        setIsProcessing(null);
                    }
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
                
                {!loading && creditPacks && creditPacks.map(pack => (
                    <Card key={pack.id} className="flex flex-col relative overflow-hidden group border-primary/20 bg-gradient-to-br from-card to-muted/30 hover:border-primary/50 transition-all duration-300">
                        {pack.badge && (
                            <div className={cn(
                                "absolute top-0 right-0 p-2 text-[10px] font-bold uppercase tracking-widest rounded-bl-lg z-20",
                                pack.badge === 'popular' && "bg-orange-500 text-white",
                                pack.badge === 'new' && "bg-blue-500 text-white",
                                pack.badge === 'recommended' && "bg-green-500 text-white"
                            )}>
                                {pack.badge}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(to_bottom,white_5%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="text-center relative z-10">
                            <div className="mx-auto mb-4 h-20 w-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-white shadow-xl shadow-amber-500/20 group-hover:scale-110 transition-transform">
                                <Gem className="h-10 w-10 drop-shadow-lg"/>
                            </div>
                            <CardTitle className="text-2xl font-black tracking-tight">{pack.name}</CardTitle>
                            <div className="flex flex-col mt-2">
                                <span className="text-5xl font-black tracking-tighter text-primary">{pack.credits.toLocaleString()}</span>
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">MindMate Credits</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1" />
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
                                Buy for ₹{pack.price}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function ArtifactsTab() {
    const { storeItems, loading, redeemStoreItem, processStoreItemPayment } = useAdmin();
    const { currentUserData } = useUsers();
    const { user } = useUser();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const hasMasterCard = currentUserData?.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();

    const artifactItems = storeItems ? storeItems.filter(i => ['penalty-shield', 'streak-freeze', 'alpha-glow'].includes(i.type)) : [];

    const handleBuyWithMoney = async (item: StoreItem) => {
        if (!user) return;
        setIsProcessing(item.id);
        try {
            const order = await createRazorpayOrder(item.price!);
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'MindMate Artifact',
                description: `Purchase ${item.name}`,
                order_id: order.id,
                handler: async function (response: any) {
                    await processStoreItemPayment(item, response.razorpay_payment_id);
                    toast({
                        title: "Artifact Secured!",
                        description: `"${item.name}" added to your Nexus Inventory.`,
                        className: "bg-green-500/10 border-green-500/50"
                    });
                    setIsProcessing(null);
                },
                prefill: {
                    name: user.fullName || '',
                    email: user.primaryEmailAddress?.emailAddress || '',
                },
                theme: { color: '#8b5cf6' },
                modal: { ondismiss: () => setIsProcessing(null) }
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Order Failed", description: error.message });
            setIsProcessing(null);
        }
    };

    const handleRedeemWithCredits = async (item: StoreItem) => {
        setIsProcessing(item.id);
        try {
            await redeemStoreItem(item);
            toast({
                title: "Artifact Secured!",
                description: `"${item.name}" added to your Nexus Inventory.`,
                className: "bg-green-500/10 border-green-500/50"
            });
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
            default: return <Star className="h-10 w-10 text-amber-400" />;
        }
    }
    
    if (!loading && artifactItems.length === 0) {
        return (
            <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-muted/20">
                <ShieldIcon className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold text-muted-foreground">The Vault is Empty</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                    Go to the <strong>Dev Panel</strong> to create artifacts.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && Array.from({length:3}).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
             {!loading && artifactItems.map(item => {
                 const isMoney = item.paymentType === 'money';
                 const canAfford = isMoney ? true : (hasMasterCard || (currentUserData?.credits ?? 0) >= item.cost);
                 
                 return (
                    <Card key={item.id} className={cn("flex flex-col relative overflow-hidden group border-2", item.isFeatured ? "border-primary/40 shadow-lg shadow-primary/10" : "border-muted")}>
                        {item.badge && (
                            <div className={cn(
                                "absolute top-0 right-0 p-2 text-[10px] font-bold uppercase tracking-widest rounded-bl-lg z-20",
                                item.badge === 'popular' && "bg-orange-500 text-white",
                                item.badge === 'new' && "bg-blue-500 text-white",
                                item.badge === 'recommended' && "bg-green-500 text-white"
                            )}>
                                {item.badge}
                            </div>
                        )}
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 p-4 rounded-full bg-muted group-hover:scale-110 transition-transform">
                                {getIcon(item.type)}
                            </div>
                            <CardTitle className="text-2xl font-bold">{item.name}</CardTitle>
                            <CardDescription className="min-h-[40px] px-4">{item.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col items-center justify-center">
                             <div className="font-black text-4xl flex items-center justify-center gap-2 text-amber-500 tracking-tighter">
                                {isMoney ? (
                                    <span>₹{item.price}</span>
                                ) : (
                                    <>
                                        <Gem className="h-8 w-8" />
                                        <span>{item.cost.toLocaleString()}</span>
                                    </>
                                )}
                            </div>
                            <p className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-widest">
                                Stock: {item.stock > 0 ? item.stock : <span className="text-destructive">EXHAUSTED</span>}
                            </p>
                        </CardContent>
                        <CardFooter>
                            {isMoney ? (
                                <Button className="w-full text-lg h-14 font-bold rounded-xl" onClick={() => handleBuyWithMoney(item)} disabled={isProcessing === item.id || item.stock === 0}>
                                    {isProcessing === item.id ? <Loader2 className="mr-2 animate-spin"/> : <Zap className="mr-2 h-5 w-5 fill-current"/>}
                                    {item.stock === 0 ? "Sold Out" : `Buy for ₹${item.price}`}
                                </Button>
                            ) : (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className="w-full text-lg h-14 font-bold rounded-xl" variant={item.stock === 0 ? "secondary" : "default"} disabled={!canAfford || isProcessing === item.id || item.stock === 0}>
                                             {isProcessing === item.id ? <Loader2 className="mr-2 animate-spin"/> : <ShoppingCart className="mr-2 h-5 w-5"/>}
                                            {item.stock === 0 ? "Sold Out" : "Secure Artifact"}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Acquire Nexus Artifact</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Do you wish to secure "{item.name}" for {item.cost} credits?
                                            </AlertDialogDescription>
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
    return (
        <div className="space-y-8">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <ShoppingCart className="h-10 w-10 text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"/>
                        Nexus Emporium
                    </h1>
                    <p className="text-muted-foreground font-medium">Equip your study journey with premium credits and legendary artifacts.</p>
                </div>
                <Button asChild variant="outline" className="rounded-full px-6 border-primary/20 hover:bg-primary/5">
                    <Link href="/dashboard/store/history">
                        <History className="mr-2 h-4 w-4 text-primary"/>
                        Transaction Log
                    </Link>
                </Button>
            </div>

            <Tabs defaultValue="buy" className="w-full">
                <div className="flex justify-center mb-8">
                    <TabsList className="grid w-full max-w-lg grid-cols-3 h-14 p-1 bg-muted/50 rounded-2xl border">
                        <TabsTrigger value="buy" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">Credits</TabsTrigger>
                        <TabsTrigger value="artifacts" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">Artifacts</TabsTrigger>
                        <TabsTrigger value="luck" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs sm:text-sm">Luck (Reward)</TabsTrigger>
                    </TabsList>
                </div>
                
                <TabsContent value="buy" className="animate-in fade-in-50 duration-500">
                    <CreditPacksTab />
                </TabsContent>
                <TabsContent value="artifacts" className="animate-in fade-in-50 duration-500">
                    <ArtifactsTab />
                </TabsContent>
                <TabsContent value="luck" className="animate-in fade-in-50 duration-500">
                    <div className="text-center py-20 space-y-4">
                        <Gift className="h-16 w-16 text-primary mx-auto opacity-20" />
                        <h3 className="text-xl font-bold text-muted-foreground">Looking for Scratch Cards or Card Flips?</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">These are part of the <strong>Reward Zone</strong> logic, and you can also find them in the <strong>Artifacts</strong> tab if available for purchase.</p>
                        <Button asChild variant="secondary">
                            <Link href="/dashboard/reward">Go to Reward Zone</Link>
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-start gap-4 shadow-inner">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-500">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                    <h4 className="font-bold text-blue-700 dark:text-blue-300">Nexus Security Protocol</h4>
                    <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mt-1">
                        All transactions are encrypted and processed via <strong>Razorpay</strong>. Credits and artifacts are bound to your unique MindMate ID and awarded instantly upon verification.
                    </p>
                </div>
            </div>
        </div>
    );
}
