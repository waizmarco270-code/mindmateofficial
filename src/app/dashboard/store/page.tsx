
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdmin, type CreditPack, useUsers, type StoreItem } from '@/hooks/use-admin';
import { Loader2, ShoppingCart, Gem, History, Check, ShieldCheck, ArrowRight, ShieldAlert, Award } from 'lucide-react';
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

function CreditPacksTab() {
    const { creditPacks, loading } = useAdmin();
    const { user, isSignedIn } = useUser();
    const { toast } = useToast();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const handleBuyPack = async (pack: CreditPack) => {
        if (!isSignedIn || !user) return;
        
        setIsProcessing(pack.id);
        try {
            // 1. Create Order via Server Action
            const order = await createRazorpayOrder(pack.price);

            // 2. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'MindMate',
                description: `Purchase ${pack.name}`,
                order_id: order.id,
                handler: async function (response: any) {
                    // 3. Verify on Server on Success
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
                        // Fix for the "Loading..." tab: Redirect the parent window
                        // This forces the browser to focus back on the app
                        window.location.href = '/dashboard/store/history';
                    } else {
                        toast({
                            variant: 'destructive',
                            title: "Verification Failed",
                            description: verification.error || "Could not verify payment.",
                        });
                        setIsProcessing(null);
                    }
                },
                prefill: {
                    name: user.fullName || '',
                    email: user.primaryEmailAddress?.emailAddress || '',
                },
                theme: {
                    color: '#8b5cf6', // Primary purple
                },
                modal: {
                    ondismiss: function() {
                        setIsProcessing(null);
                    },
                    // Helps with mobile browser behavior
                    escape: false,
                    backdropclose: false
                },
                // Prevents some "stuck" states in certain UPI flows
                retry: {
                    enabled: false
                }
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
                    <Card key={pack.id} className="flex flex-col relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="text-center relative z-10">
                            <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/20">
                                <Gem className="h-8 w-8"/>
                            </div>
                            <CardTitle className="text-2xl">{pack.name}</CardTitle>
                            <p className="text-5xl font-bold tracking-tighter text-primary mt-2">{pack.credits.toLocaleString()}</p>
                            <CardDescription className="font-medium">Credits</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1" />
                        <CardFooter className="relative z-10">
                            <Button 
                                className="w-full text-lg h-12"
                                onClick={() => handleBuyPack(pack)}
                                disabled={!isSignedIn || isProcessing === pack.id}
                            >
                                {isProcessing === pack.id ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <ShoppingCart className="mr-2 h-5 w-5"/>
                                )}
                                Buy for ₹{pack.price}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
            
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your payments are secure. We use <strong>Razorpay</strong> to process transactions safely and award credits instantly to your account.
                </p>
            </div>
        </div>
    );
}

function RedeemItemsTab() {
    const { storeItems, loading, redeemStoreItem } = useAdmin();
    const { currentUserData } = useUsers();
    const { toast } = useToast();
    const [isRedeeming, setIsRedeeming] = useState<string | null>(null);
    const hasMasterCard = currentUserData?.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();

    const handleRedeem = async (item: StoreItem) => {
        setIsRedeeming(item.id);
        try {
            await redeemStoreItem(item);
            toast({
                title: "Item Redeemed!",
                description: `"${item.name}" has been added to your account.`,
                className: "bg-green-500/10 border-green-500/50"
            });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Redemption Failed", description: error.message });
        } finally {
            setIsRedeeming(null);
        }
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && Array.from({length:3}).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
             {!loading && storeItems && storeItems.map(item => {
                 const canAfford = hasMasterCard || (currentUserData?.credits ?? 0) >= item.cost;
                 return (
                    <Card key={item.id} className={cn("flex flex-col relative overflow-hidden", item.isFeatured && "border-primary shadow-lg shadow-primary/10")}>
                        {item.isFeatured && (
                            <div className="absolute top-0 right-0 p-2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-bl-lg">
                                <Award className="h-3 w-3 inline mr-1" /> Featured
                            </div>
                        )}
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">{item.name}</CardTitle>
                            <CardDescription className="min-h-[40px]">{item.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                             <div className="font-bold text-3xl flex items-center justify-center gap-2 text-amber-500">
                                <Gem className="h-6 w-6" />
                                <span>{item.cost.toLocaleString()}</span>
                            </div>
                            <p className="text-center text-xs text-muted-foreground mt-2">
                                Stock: {item.stock > 0 ? item.stock : <span className="text-destructive font-bold">SOLD OUT</span>}
                            </p>
                        </CardContent>
                        <CardFooter>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="w-full text-lg h-12" variant={item.stock === 0 ? "secondary" : "default"} disabled={!canAfford || isRedeeming === item.id || item.stock === 0}>
                                         {isRedeeming === item.id ? <Loader2 className="mr-2 animate-spin"/> : <ShoppingCart className="mr-2 h-5 w-5"/>}
                                        {item.stock === 0 ? "Sold Out" : "Redeem Now"}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm Redemption</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Redeem "{item.name}" for {item.cost} credits? This will instantly add {item.quantity} {item.type.replace('-', ' ')} to your inventory.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                     <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleRedeem(item)}>Confirm & Redeem</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
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
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <ShoppingCart className="h-8 w-8 text-primary"/>
                        MindMate Store
                    </h1>
                    <p className="text-muted-foreground">Automated payments via Razorpay. Get credits instantly!</p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/dashboard/store/history">
                        <History className="mr-2 h-4 w-4"/>
                        Order History
                    </Link>
                </Button>
            </div>

            <Tabs defaultValue="buy" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="buy">Buy Credits</TabsTrigger>
                    <TabsTrigger value="redeem">Redeem Items</TabsTrigger>
                </TabsList>
                <TabsContent value="buy" className="mt-8">
                    <CreditPacksTab />
                </TabsContent>
                <TabsContent value="redeem" className="mt-8">
                    <RedeemItemsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
