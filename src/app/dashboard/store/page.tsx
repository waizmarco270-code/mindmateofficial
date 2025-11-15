
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdmin, CreditPack, useUsers } from '@/hooks/use-admin';
import { Loader2, ShoppingCart, Gem, History, Check, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, SignedOut } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';
import Link from 'next/link';

export default function StorePage() {
    const { user, isSignedIn } = useUser();
    const { creditPacks, purchaseCredits, loading } = useAdmin();
    const { currentUserData } = useUsers();
    const { toast } = useToast();
    const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

    const handlePurchase = async (pack: CreditPack) => {
        if (!user) return;
        setIsPurchasing(pack.id);
        try {
            await purchaseCredits(user.id, pack);
            toast({
                title: "Purchase Successful!",
                description: `You've received ${pack.credits} credits. Your balance is now ${ (currentUserData?.credits ?? 0) + pack.credits }.`,
                className: "bg-green-500/10 border-green-500/50"
            });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Purchase Failed", description: error.message });
        } finally {
            setIsPurchasing(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <ShoppingCart className="h-8 w-8 text-primary"/>
                        MindMate Store
                    </h1>
                    <p className="text-muted-foreground">Top-up your credits to unlock premium features and rewards.</p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/dashboard/store/history">
                        <History className="mr-2 h-4 w-4"/>
                        Purchase History
                    </Link>
                </Button>
            </div>

            <div className="relative">
                <SignedOut>
                    <LoginWall title="Sign In to Access Store" description="Create a free account to purchase credits and unlock premium content."/>
                </SignedOut>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading && Array.from({length:3}).map((_, i) => <Card key={i} className="h-64 animate-pulse bg-muted"/>)}
                    
                    {!loading && creditPacks.map(pack => (
                        <Card key={pack.id} className="flex flex-col">
                            <CardHeader className="text-center">
                                <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-white">
                                    <Gem className="h-8 w-8"/>
                                </div>
                                <CardTitle className="text-2xl">{pack.name}</CardTitle>
                                <p className="text-5xl font-bold tracking-tighter text-primary">{pack.credits.toLocaleString()}</p>
                                <CardDescription>Credits</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1" />
                            <CardFooter>
                                <Button 
                                    className="w-full text-lg h-12"
                                    onClick={() => handlePurchase(pack)}
                                    disabled={isPurchasing === pack.id || !isSignedIn}
                                >
                                    {isPurchasing === pack.id ? <Loader2 className="animate-spin mr-2"/> : <ShoppingCart className="mr-2 h-5 w-5"/>}
                                    Buy for ₹{pack.price}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                    {!loading && creditPacks.length === 0 && (
                        <Card className="md:col-span-2 lg:col-span-3 text-center py-16">
                            <CardContent>
                                <p>No credit packs available at the moment. Please check back later.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <Card className="bg-green-500/10 border-green-500/20">
                <CardHeader className="flex flex-row items-center gap-4">
                    <ShieldCheck className="h-8 w-8 text-green-600 flex-shrink-0"/>
                    <div>
                         <CardTitle className="text-green-700 dark:text-green-300">Safe & Secure</CardTitle>
                         <CardDescription className="text-green-800/80 dark:text-green-400/80">
                            Our payment system is a placeholder. No real money will be charged. This is for demonstration purposes only.
                         </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
}

