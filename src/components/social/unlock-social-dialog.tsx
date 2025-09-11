
'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const UNLOCK_CREDITS = 20;

export function UnlockSocialDialog() {
    const { user } = useUser();
    const { currentUserData, unlockSocialFeature } = useUsers();
    const { toast } = useToast();
    const [isUnlockDialogOpen, setIsUnlockDialogOpen] = useState(false);

    const currentCredits = currentUserData?.credits ?? 0;

    const handleUnlockWithCredits = () => {
        if (user && currentCredits >= UNLOCK_CREDITS) {
            unlockSocialFeature(user.id);
            setIsUnlockDialogOpen(false);
            toast({
                title: `Social Feature Unlocked!`,
                description: `You can now connect with friends. ${UNLOCK_CREDITS} credits were used.`,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Insufficient Credits',
                description: `You need at least ${UNLOCK_CREDITS} credits to unlock this feature.`,
            });
        }
    };
    
    return (
        <>
            <div className="flex flex-col items-center justify-center h-full text-center p-8 rounded-xl bg-muted/40 border-2 border-dashed">
                <div className="p-5 rounded-full bg-primary/10 mb-4">
                    <Sparkles className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Connect & Collaborate</h1>
                <p className="text-muted-foreground mt-2 max-w-lg">Unlock the Social Hub to add friends, start conversations, and study together. This is a one-time unlock.</p>
                <Button size="lg" className="mt-6 text-lg py-7" onClick={() => setIsUnlockDialogOpen(true)}>
                    Unlock Social Hub for {UNLOCK_CREDITS} Credits
                </Button>
            </div>
            
            <Dialog open={isUnlockDialogOpen} onOpenChange={setIsUnlockDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Unlock Social Hub</DialogTitle>
                        <DialogDescription>
                            Are you sure? This is a one-time purchase for permanent access to the friend and chat system.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="my-6 space-y-4">
                        <div className="flex items-center justify-around text-center p-4 bg-muted rounded-lg">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Your Balance</p>
                                <p className="text-2xl font-bold">{currentCredits}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Unlock Cost</p>
                                <p className="text-2xl font-bold text-destructive">-{UNLOCK_CREDITS}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">New Balance</p>
                                <p className="text-2xl font-bold text-green-500">{Math.max(0, currentCredits - UNLOCK_CREDITS)}</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleUnlockWithCredits} disabled={currentCredits < UNLOCK_CREDITS}>
                            {currentCredits < UNLOCK_CREDITS ? "Not Enough Credits" : "Confirm & Unlock"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
