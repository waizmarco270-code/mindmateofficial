
'use client';

import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useAdmin, useUsers } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { type LockableFeature } from '@/lib/features';
import { Sparkles } from 'lucide-react';

interface FeatureUnlockDialogProps {
    feature: LockableFeature;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function FeatureUnlockDialog({ feature, isOpen, onOpenChange }: FeatureUnlockDialogProps) {
    const { user } = useUser();
    const { currentUserData, unlockFeatureForUser } = useUsers();
    const { featureLocks } = useAdmin();
    const { toast } = useToast();

    const cost = featureLocks?.[feature.id]?.cost ?? feature.defaultCost;

    const handleUnlock = async () => {
        if (!user || !currentUserData) return;

        if (currentUserData.credits < cost) {
            toast({ variant: 'destructive', title: 'Insufficient Credits' });
            return;
        }

        try {
            await unlockFeatureForUser(user.id, feature.id, cost);
            toast({
                title: 'Feature Unlocked!',
                description: `You can now access ${feature.name}.`,
            });
            onOpenChange(false);
        } catch (error) {
            console.error('Unlock failed', error);
            toast({ variant: 'destructive', title: 'Unlock Failed', description: 'Please try again.' });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-primary/10 rounded-full">
                            <Sparkles className="h-10 w-10 text-primary" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-2xl font-bold">Unlock "{feature.name}"</DialogTitle>
                    <DialogDescription className="text-center">
                        Gain permanent access to this feature.
                    </DialogDescription>
                </DialogHeader>
                <div className="my-6 space-y-4">
                    <div className="flex items-center justify-around text-center p-4 bg-muted rounded-lg">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Your Balance</p>
                            <p className="text-2xl font-bold">{currentUserData?.credits ?? 0}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Unlock Cost</p>
                            <p className="text-2xl font-bold text-destructive">-{cost}</p>
                        </div>
                    </div>
                </div>
                <DialogFooter className="flex-col gap-2">
                    <Button onClick={handleUnlock} className="w-full" disabled={(currentUserData?.credits ?? 0) < cost}>
                        Confirm & Unlock for {cost} Credits
                    </Button>
                     <DialogClose asChild>
                        <Button variant="outline" className="w-full">Cancel</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
