
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdmin, type CreditPack, useUsers, type StoreItem } from '@/hooks/use-admin';
import { Loader2, ShoppingCart, Gem, History, Check, ShieldCheck, ArrowRight, Upload, Send, VenetianMask, Layers, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, SignedOut } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogTrigger, AlertDialogContent } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

function CreditPacksTab() {
    const { creditPacks, appSettings, loading, createPurchaseRequest } = useAdmin();
    const { isSignedIn } = useUser();
    const { toast } = useToast();
    
    const [selectedPack, setSelectedPack] = useState<CreditPack | null>(null);
    const [transactionId, setTransactionId] = useState('');
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

     const handleSubmitRequest = async () => {
        if (!selectedPack || !transactionId.trim() || !createPurchaseRequest) return;
        setIsSubmitting(true);
        try {
            await createPurchaseRequest(selectedPack, transactionId, screenshotFile);
            toast({
                title: "Request Submitted!",
                description: "Your purchase is pending approval. Credits will be added shortly.",
            });
            setSelectedPack(null);
            setTransactionId('');
            setScreenshotFile(null);
        } catch (error: any) {
             toast({ variant: 'destructive', title: "Submission Failed", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && Array.from({length:3}).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
                
                {!loading && creditPacks && creditPacks.map(pack => (
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
            </div>

             <Dialog open={!!selectedPack} onOpenChange={(open) => !open && setSelectedPack(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete Your Purchase</DialogTitle>
                        <DialogDescription>
                            Scan the QR code to pay ₹{selectedPack?.price}, then enter the transaction ID and upload a screenshot as proof.
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
                            </div>
                        )}
                        <div className="space-y-4 text-left">
                            <div className="space-y-2">
                                <Label htmlFor="transaction-id">UPI Transaction ID</Label>
                                <Input 
                                    id="transaction-id"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="Enter the 12-digit transaction ID"
                                />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="screenshot">Payment Screenshot (Optional)</Label>
                                <Input 
                                    id="screenshot"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setScreenshotFile(e.target.files ? e.target.files[0] : null)}
                                />
                            </div>
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
                    <Card key={item.id} className={cn("flex flex-col relative overflow-hidden", item.isFeatured && "border-primary")}>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">{item.name}</CardTitle>
                            <CardDescription>{item.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                             <div className="font-bold text-2xl flex items-center justify-center gap-2">
                                <Gem className="h-5 w-5 text-amber-500" />
                                <span>{item.cost.toLocaleString()}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="w-full text-lg h-12" disabled={!canAfford || isRedeeming === item.id || item.stock === 0}>
                                         {isRedeeming === item.id ? <Loader2 className="mr-2 animate-spin"/> : <ShoppingCart className="mr-2 h-5 w-5"/>}
                                        {item.stock === 0 ? "Sold Out" : "Redeem"}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm Redemption</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Redeem "{item.name}" for {item.cost} credits?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                     <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleRedeem(item)}>Confirm</AlertDialogAction>
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
                    <p className="text-muted-foreground">Top-up your credits or redeem them for exciting items.</p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/dashboard/store/history">
                        <History className="mr-2 h-4 w-4"/>
                        History
                    </Link>
                </Button>
            </div>

            <Tabs defaultValue="redeem" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="redeem">Redeem Items</TabsTrigger>
                    <TabsTrigger value="buy">Buy Credits</TabsTrigger>
                </TabsList>
                <TabsContent value="redeem" className="mt-8">
                    <RedeemItemsTab />
                </TabsContent>
                <TabsContent value="buy" className="mt-8">
                    <CreditPacksTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
