
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdmin, type User } from '@/hooks/use-admin';
import { 
    Gift, Send, Gem, VenetianMask, 
    Zap, Search, X, Loader2, Trash2,
    History, Clock
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function GlobalGiftsPage() {
    const { users, sendGlobalGift, globalGifts, deactivateGift, deleteGlobalGift } = useAdmin();
    const { toast } = useToast();

    // Form State
    const [popupTarget, setPopupTarget] = useState<'all' | 'single'>('all');
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [popupMessage, setPopupMessage] = useState('');
    const [popupCreditAmount, setPopupCreditAmount] = useState(0);
    const [popupScratchAmount, setPopupScratchAmount] = useState(0);
    const [popupFlipAmount, setPopupFlipAmount] = useState(0);
    const [isSending, setIsSending] = useState(false);

    const filteredUsers = useMemo(() => {
        if (!userSearchTerm.trim()) return [];
        return users.filter(u => 
            u.displayName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            u.uid.toLowerCase() === userSearchTerm.toLowerCase()
        ).slice(0, 5);
    }, [users, userSearchTerm]);

    const handleSendGift = async () => {
        if (!popupMessage.trim()) return;
        if (popupTarget === 'single' && !selectedUser) {
            toast({ variant: 'destructive', title: "Please select a user." });
            return;
        }

        setIsSending(true);
        try {
            await sendGlobalGift({
                message: popupMessage,
                target: popupTarget === 'all' ? 'all' : selectedUser!.uid,
                rewards: {
                    credits: popupCreditAmount,
                    scratch: popupScratchAmount,
                    flip: popupFlipAmount
                }
            });
            toast({ title: "Global Gift Dispatched!" });
            setPopupMessage('');
            setPopupCreditAmount(0);
            setPopupScratchAmount(0);
            setPopupFlipAmount(0);
            setSelectedUser(null);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                <Card className="lg:col-span-7 border-pink-500/20 bg-pink-500/5">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2 uppercase italic text-pink-500"><Gift/> Construct Reward Popup</CardTitle>
                        <CardDescription>Transmit a message and assets to citizens.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Audience</Label>
                            <div className="flex gap-2 p-1 bg-muted/50 rounded-xl border">
                                <Button size="sm" variant={popupTarget === 'all' ? 'default' : 'ghost'} className="flex-1 font-bold uppercase" onClick={() => setPopupTarget('all')}>Broadcast All</Button>
                                <Button size="sm" variant={popupTarget === 'single' ? 'default' : 'ghost'} className="flex-1 font-bold uppercase" onClick={() => setPopupTarget('single')}>Target Direct</Button>
                            </div>
                        </div>

                        {popupTarget === 'single' && (
                            <div className="space-y-2 relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search legend name or UID..." className="pl-9 h-12" value={userSearchTerm} onChange={e => setUserSearchTerm(e.target.value)} />
                                </div>
                                {selectedUser && (
                                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/20 animate-in zoom-in-95">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8"><AvatarImage src={selectedUser.photoURL}/><AvatarFallback>U</AvatarFallback></Avatar>
                                            <p className="font-bold text-sm">{selectedUser.displayName}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setSelectedUser(null)}><X className="h-4 w-4"/></Button>
                                    </div>
                                )}
                                {filteredUsers.length > 0 && !selectedUser && (
                                    <div className="absolute top-full left-0 w-full bg-background border rounded-xl mt-1 shadow-2xl z-50 overflow-hidden divide-y">
                                        {filteredUsers.map(u => (
                                            <button key={u.uid} onClick={() => setSelectedUser(u)} className="w-full p-3 flex items-center gap-3 hover:bg-muted transition-colors text-left">
                                                <Avatar className="h-8 w-8"><AvatarImage src={u.photoURL}/><AvatarFallback>U</AvatarFallback></Avatar>
                                                <div><p className="text-sm font-bold">{u.displayName}</p><p className="text-[10px] text-muted-foreground uppercase">{u.uid.slice(-8)}</p></div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Message</Label>
                            <Input value={popupMessage} onChange={e => setPopupMessage(e.target.value)} placeholder="e.g., A token of appreciation for your discipline!" className="h-12 font-medium" />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5"><Gem className="h-3 w-3 text-amber-500"/> Credits</Label>
                                <Input type="number" value={popupCreditAmount} onChange={e => setPopupCreditAmount(Number(e.target.value))} className="h-12 font-black text-center" />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5"><VenetianMask className="h-3 w-3 text-primary"/> Scratch</Label>
                                <Input type="number" value={popupScratchAmount} onChange={e => setPopupScratchAmount(Number(e.target.value))} className="h-12 font-black text-center" />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-indigo-500"/> Flip</Label>
                                <Input type="number" value={popupFlipAmount} onChange={e => setPopupFlipAmount(Number(e.target.value))} className="h-12 font-black text-center" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSendGift} disabled={isSending || !popupMessage.trim()} className="w-full h-14 bg-pink-500 hover:bg-pink-600 text-white font-black text-lg shadow-xl shadow-pink-500/20">
                            {isSending ? <Loader2 className="animate-spin mr-2"/> : <Send className="mr-2"/>}
                            DISPATCH GIFT PULSE
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="lg:col-span-5 h-full flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4 text-primary"/> Active Gift Transmissions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ScrollArea className="h-96 pr-4">
                            <div className="space-y-3">
                                {globalGifts.map(gift => (
                                    <div key={gift.id} className={cn("p-4 rounded-2xl border bg-muted/30 relative group", !gift.isActive && "opacity-50 grayscale")}>
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant={gift.isActive ? "default" : "secondary"} className="text-[8px] uppercase">{gift.isActive ? 'Active' : 'Expired'}</Badge>
                                            <div className="flex gap-1">
                                                {gift.isActive && <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-amber-500" onClick={() => deactivateGift(gift.id)}><X className="h-3 w-3"/></Button>}
                                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-destructive" onClick={() => deleteGlobalGift(gift.id)}><Trash2 className="h-3 w-3"/></Button>
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold leading-tight line-clamp-2">"{gift.message}"</p>
                                        <div className="flex items-center gap-3 mt-3">
                                            {gift.rewards.credits > 0 && <span className="text-[10px] font-black text-amber-500">+{gift.rewards.credits} CR</span>}
                                            {gift.rewards.scratch > 0 && <span className="text-[10px] font-black text-primary">+{gift.rewards.scratch} SC</span>}
                                            {gift.rewards.flip > 0 && <span className="text-[10px] font-black text-indigo-500">+{gift.rewards.flip} CF</span>}
                                        </div>
                                        <p className="text-[8px] font-black text-muted-foreground uppercase mt-2 flex items-center gap-1"><Clock className="h-2 w-2"/> {format(gift.createdAt, 'PPP')}</p>
                                    </div>
                                ))}
                                {globalGifts.length === 0 && <p className="text-center text-xs text-muted-foreground py-10 italic">No historical gifts found.</p>}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
