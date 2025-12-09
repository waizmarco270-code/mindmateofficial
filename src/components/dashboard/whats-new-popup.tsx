
'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AppSettings } from '@/hooks/use-admin';
import { Gift } from 'lucide-react';

interface WhatsNewPopupProps {
    settings: AppSettings | null;
}

export function WhatsNewPopup({ settings }: WhatsNewPopupProps) {
    const [lastSeenId, setLastSeenId] = useLocalStorage<string | null>('lastMaintenanceIdSeen', null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (settings?.lastMaintenanceId && settings.lastMaintenanceId !== lastSeenId && settings.whatsNewMessage) {
            setIsOpen(true);
        }
    }, [settings, lastSeenId]);

    const handleClose = () => {
        setIsOpen(false);
        if (settings?.lastMaintenanceId) {
            setLastSeenId(settings.lastMaintenanceId);
        }
    };

    if (!settings?.whatsNewMessage) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-primary/10 rounded-full">
                            <Gift className="h-10 w-10 text-primary" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-2xl font-bold">What's New in MindMate!</DialogTitle>
                </DialogHeader>
                <div className="my-6 space-y-4 max-h-80 overflow-y-auto">
                    <p className="whitespace-pre-wrap">{settings.whatsNewMessage}</p>
                </div>
                <DialogFooter>
                    <Button onClick={handleClose} className="w-full">Got it!</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
