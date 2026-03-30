
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Check, X, Trophy, Crown, ShieldAlert } from 'lucide-react';

interface PrivacyDialogProps {
    isOpen: boolean;
    onOpenChange: (o: boolean) => void;
    isPrivate: boolean;
    onToggle: (val: boolean) => void;
}

export function PrivacyDialog({ isOpen, onOpenChange, isPrivate, onToggle }: PrivacyDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-primary/20">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-2xl font-black uppercase italic">
                        <Eye className="text-primary h-8 w-8"/> Phantom Mode Protocols
                    </DialogTitle>
                    <DialogDescription className="text-base font-medium">Decide how you want to manifest within the MindMate ecosystem.</DialogDescription>
                </DialogHeader>
                
                <div className="py-8 space-y-8">
                    <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/50 border-2 border-primary/10 shadow-inner">
                        <div className="space-y-1">
                            <h4 className="text-lg font-black uppercase italic">Active Stealth</h4>
                            <p className="text-sm text-muted-foreground font-medium">Hide your tactical stats from the public registry.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{isPrivate ? 'HIDDEN' : 'VISIBLE'}</span>
                            <Switch checked={isPrivate} onCheckedChange={onToggle} />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4 p-6 rounded-[2rem] bg-green-500/5 border border-green-500/20">
                            <h5 className="font-black uppercase text-xs tracking-widest text-green-600 flex items-center gap-2">
                                <Check className="h-4 w-4"/> Advantages
                            </h5>
                            <ul className="space-y-3 text-xs font-bold text-green-700 dark:text-green-300">
                                <li className="flex items-start gap-2"><Trophy className="h-4 w-4 shrink-0"/> Inspire other legends.</li>
                                <li className="flex items-start gap-2"><Crown className="h-4 w-4 shrink-0"/> Required for GM status.</li>
                            </ul>
                        </div>

                        <div className="space-y-4 p-6 rounded-[2rem] bg-destructive/5 border border-destructive/20">
                            <h5 className="font-black uppercase text-xs tracking-widest text-destructive flex items-center gap-2">
                                <X className="h-4 w-4"/> Risks
                            </h5>
                            <ul className="space-y-3 text-xs font-bold text-destructive/80">
                                <li className="flex items-start gap-2"><Eye className="h-4 w-4 shrink-0"/> Stats are visible to all.</li>
                                <li className="flex items-start gap-2"><ShieldAlert className="h-4 w-4 shrink-0"/> Exposed to competition.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button className="w-full h-14 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20">CONFIRM PROTOCOLS</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
