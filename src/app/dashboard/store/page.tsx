

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdmin, type CreditPack, useUsers } from '@/hooks/use-admin';
import { Loader2, ShoppingCart, Gem, History, Check, ShieldCheck, ArrowRight, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, SignedOut } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export default function StorePage() {
    const { user, isSignedIn } = useUser();
    const { creditPacks, appSettings, loading, createPurchaseRequest } = useAdmin();
    const { toast } = useToast();
    
    const [selectedPack, setSelectedPack] = useState<CreditPack | null>(null);
    const [transactionId, setTransactionId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitRequest = async () => {
        if (!selectedPack || !transactionId.trim() || !user) return;
        setIsSubmitting(true);
        try {
            if (!createPurchaseRequest) {
                throw new Error("Purchase functionality is not available.");
            }
            await createPurchaseRequest(selectedPack, transactionId);
            toast({
                title: "Request Submitted!",
                description: "Your purchase is pending approval. Credits will be added shortly.",
            });
            setSelectedPack(null);
            setTransactionId('');
        } catch (error: any) {
             toast({ variant: 'destructive', title: "Submission Failed", description: error.message });
        } finally {
            setIsSubmitting(false);
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
                    {loading && Array.from({length:3}).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
                    
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
                                    onClick={() => setSelectedPack(pack)}
                                    disabled={!isSignedIn}
                                >
                                    <ShoppingCart className="mr-2 h-5 w-5"/>
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
                         <CardTitle className="text-green-700 dark:text-green-300">Safe & Secure Payments</CardTitle>
                         <CardDescription className="text-green-800/80 dark:text-green-400/80">
                            Payments are processed manually via UPI. Your request will be approved by an admin after verification.
                         </CardDescription>
                    </div>
                </CardHeader>
            </Card>

            <Dialog open={!!selectedPack} onOpenChange={(open) => !open && setSelectedPack(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete Your Purchase</DialogTitle>
                        <DialogDescription>
                            Scan the QR code to pay ₹{selectedPack?.price}, then enter the transaction ID below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-6 text-center">
                        {appSettings?.upiQrCode ? (
                             <div className="flex justify-center p-4 bg-white rounded-lg border">
                                <Image src={appSettings.upiQrCode} alt="UPI QR Code" width={256} height={256} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-lg">
                                <p className="text-muted-foreground">QR Code not available.</p>
                                <p className="text-sm text-muted-foreground">Please contact admin.</p>
                            </div>
                        )}
                        <div className="space-y-2 text-left">
                            <Label htmlFor="transaction-id">UPI Transaction ID</Label>
                            <Input 
                                id="transaction-id"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="Enter the 12-digit transaction ID"
                            />
                        </div>
                    </div>
                     <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedPack(null)}>Cancel</Button>
                        <Button onClick={handleSubmitRequest} disabled={isSubmitting || !transactionId.trim()}>
                            {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <Send className="mr-2 h-4 w-4"/>}
                             Submit for Approval
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
