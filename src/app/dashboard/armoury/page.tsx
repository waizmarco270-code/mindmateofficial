
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser, SignedOut } from '@clerk/nextjs';
import { useAdmin } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, ShieldCheck, Zap, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { LoginWall } from '@/components/ui/login-wall';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface MasterCreditPackage {
    id: '1-day' | '3-day' | '7-day' | '15-day' | '30-day' | 'permanent';
    name: string;
    durationDays: number; // Use Infinity for permanent
    price: number;
    description: string;
}

export const masterCreditPackages: MasterCreditPackage[] = [
    { id: '1-day', name: '1 Day Pass', durationDays: 1, price: 19, description: 'A quick boost of power.' },
    { id: '3-day', name: '3 Day Pass', durationDays: 3, price: 29, description: 'Perfect for a weekend sprint.' },
    { id: '7-day', name: '7 Day Pass', durationDays: 7, price: 49, description: 'Rule the leaderboard for a week.' },
    { id: '15-day', name: '15 Day Pass', durationDays: 15, price: 69, description: 'Dominate for half a month.' },
    { id: '30-day', name: '30 Day Pass', durationDays: 30, price: 99, description: 'Ultimate power for a full month.' },
    { id: 'permanent', name: 'Permanent Access', durationDays: 365 * 100, price: 299, description: 'Become a MindMate legend, forever.' }, // Using 100 years for permanent
];

function PurchaseDialog({
  pkg,
  upiId,
  qrCodeUrl,
  onSubmit,
}: {
  pkg: MasterCreditPackage;
  upiId: string;
  qrCodeUrl: string;
  onSubmit: (pkg: MasterCreditPackage, transactionId: string) => void;
}) {
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
      if (!transactionId.trim()) {
          alert("Please enter a valid Transaction ID.");
          return;
      }
      setIsSubmitting(true);
      await onSubmit(pkg, transactionId);
      setIsSubmitting(false);
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Purchase {pkg.name}</DialogTitle>
        <DialogDescription>
          Scan the QR code or use the UPI ID to complete the payment of ₹{pkg.price}, then enter the transaction ID below.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-6 text-center">
        {qrCodeUrl ? (
          <Image
            src={qrCodeUrl}
            alt="UPI QR Code"
            width={250}
            height={250}
            className="mx-auto rounded-lg border-4 border-primary"
          />
        ) : (
          <div className="h-64 w-64 bg-muted rounded-lg flex items-center justify-center mx-auto">
            <p className="text-muted-foreground">QR Code not set by Admin.</p>
          </div>
        )}
        <div className="space-y-2">
            <Label>UPI ID:</Label>
            <p className="text-lg font-bold font-mono p-2 bg-muted rounded-md">{upiId || "Not set by Admin"}</p>
        </div>
         <div className="space-y-2 text-left">
            <Label htmlFor="transactionId">Transaction ID / UPI Reference No.</Label>
            <Input
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter the 12-digit transaction ID"
                disabled={isSubmitting}
            />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit} disabled={!transactionId.trim() || isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <ShieldCheck className="mr-2"/>}
          Submit for Verification
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}


export default function ArmouryPage() {
    const { isSignedIn } = useUser();
    const { appSettings, currentUserData, submitMasterCardRequest, pendingMasterCardRequest } = useAdmin();
    const { toast } = useToast();
    const [selectedPackage, setSelectedPackage] = useState<MasterCreditPackage | null>(null);

    const upiId = appSettings?.upiId || "";
    const qrCodeUrl = appSettings?.qrCodeUrl || "";
    const isPurchaseDisabled = !upiId || !qrCodeUrl;

    const hasActiveMasterCard = currentUserData?.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();

    const handleSubmitRequest = async (pkg: MasterCreditPackage, transactionId: string) => {
        try {
            await submitMasterCardRequest(pkg, transactionId);
            toast({
                title: "Request Submitted!",
                description: "Your purchase is pending verification. Access will be granted shortly."
            });
            setSelectedPackage(null); // Close the dialog
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Submission Failed',
                description: error.message
            });
        }
    };
    
    if (hasActiveMasterCard) {
        return (
             <div className="flex h-full w-full items-center justify-center p-4">
                <Card className="w-full max-w-md text-center border-green-500/50">
                    <CardHeader>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                            <CheckCircle className="h-10 w-10 text-green-500" />
                        </div>
                        <CardTitle className="text-2xl">Master Card Active</CardTitle>
                        <CardDescription>
                           You already have an active Master Card. Enjoy your unlimited access!
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }
    
    if (pendingMasterCardRequest) {
         return (
             <div className="flex h-full w-full items-center justify-center p-4">
                <Card className="w-full max-w-md text-center border-amber-500/50">
                    <CardHeader>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
                            <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
                        </div>
                        <CardTitle className="text-2xl">Purchase Pending</CardTitle>
                        <CardDescription>
                           Your request for the <span className="font-bold text-primary">{pendingMasterCardRequest.packageName}</span> is being verified. Please be patient.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="relative">
                 <SignedOut>
                    <LoginWall 
                        title="Unlock The Armoury"
                        description="Sign up to purchase Master Cards and gain legendary status with unlimited access."
                    />
                </SignedOut>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-primary" />
                    The Armoury
                    </h1>
                    <p className="text-muted-foreground">Equip yourself with the ultimate power. Purchase a Master Card for unlimited access.</p>
                </div>
                 {isPurchaseDisabled && (
                    <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-destructive">Purchases Currently Unavailable</h4>
                                <p className="text-sm text-destructive/80">
                                    The admin has not configured the payment details yet. Please check back later.
                                </p>
                            </div>
                        </div>
                    </div>
                 )}
            </div>

            <Dialog open={!!selectedPackage} onOpenChange={() => setSelectedPackage(null)}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {masterCreditPackages.map((pkg) => (
                         <DialogTrigger asChild key={pkg.id}>
                            <Card className="flex flex-col text-center hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                                <CardHeader>
                                    <div className="flex justify-center mb-4">
                                        <div className="p-4 rounded-full bg-primary/10 border-4 border-primary/20">
                                            <Zap className="h-8 w-8 text-primary"/>
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                                    <CardDescription>{pkg.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex items-center justify-center">
                                    <p className="text-5xl font-bold tracking-tighter">₹{pkg.price}</p>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full" disabled={!isSignedIn || isPurchaseDisabled} onClick={() => setSelectedPackage(pkg)}>
                                        <ShieldCheck className="mr-2"/> Purchase
                                    </Button>
                                </CardFooter>
                            </Card>
                         </DialogTrigger>
                    ))}
                </div>
                 {selectedPackage && <PurchaseDialog pkg={selectedPackage} upiId={upiId} qrCodeUrl={qrCodeUrl} onSubmit={handleSubmitRequest} />}
            </Dialog>
        </div>
    )
}
