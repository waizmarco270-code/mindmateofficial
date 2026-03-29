
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdmin, type User, type BadgeType } from '@/hooks/use-admin';
import { 
    Gift, Send, Gem, VenetianMask, 
    Zap, Search, X, Loader2, Trash2,
    History, Clock, Wallet, ShieldCheck, 
    Snowflake, TrendingUp, Crown, CheckCircle,
    Package
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const availableBadges: BadgeType[] = ['vip', 'gm', 'challenger', 'early-bird', 'night-owl', 'knowledge-knight', 'streaker', 'isolater', 'iso-warrior', 'warrior', 'iso-master', 'sovereign'];

export default function GlobalGiftsPage() {
    const { users, sendGlobalGift, globalGifts, deactivateGift, deleteGlobalGift } = useAdmin();
    const { toast } = useToast();

    // Form State
    const [popupTarget, setPopupTarget] = useState<'all' | 'single'>('all');
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [popupMessage, setPopupMessage] = useState('');
    
    // Reward States
    const [rewardCredits, setRewardCredits] = useState(0);
    const [rewardScratch, setRewardScratch] = useState(0);
    const [rewardFlip, setRewardFlip] = useState(0);
    const [rewardWallet, setRewardWallet] = useState(0);
    const [rewardShields, setRewardShields] = useState(0);
    const [rewardFreezes, setRewardFreezes] = useState(0);
    const [rewardBoosters, setRewardBoosters] = useState(0);
    const [rewardMaxers, setRewardMaxers] = useState(0);
    const [rewardBadge, setRewardBadge] = useState<BadgeType | 'none'>('none');
    
    const [maxClaims, setMaxClaims] = useState(0);
    const [isSending, setIsSending] = useState(false);

    const filteredUsers = useMemo(() => {
        if (!userSearchTerm.trim()) return [];
        return users.filter(u => 
            u.displayName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            u.uid.toLowerCase() === userSearchTerm.toLowerCase() ||
            u.mindMateId?.toLowerCase() === userSearchTerm.toLowerCase()
        ).slice(0, 5);
    }, [users, userSearchTerm]);

    const handleSendGift = async () => {
        if (!popupMessage.trim()) {
            toast({ variant: 'destructive', title: "Briefing required", description: "Please enter a message for the citizens." });
            return;
        }
        if (popupTarget === 'single' && !selectedUser) {
            toast({ variant: 'destructive', title: "Select Target", description: "A specific mission requires a specific legend." });
            return;
        }

        setIsSending(true);
        try {
            await sendGlobalGift({
                message: popupMessage,
                target: popupTarget === 'all' ? 'all' : selectedUser!.uid,
                maxClaims: popupTarget === 'all' && maxClaims > 0 ? maxClaims : undefined,
                rewards: {
                    credits: rewardCredits,
                    scratch: rewardScratch,
                    flip: rewardFlip,
                    wallet: rewardWallet > 0 ? rewardWallet : undefined,
                    shields: rewardShields > 0 ? rewardShields : undefined,
                    freezes: rewardFreezes > 0 ? rewardFreezes : undefined,
                    boosters: rewardBoosters > 0 ? rewardBoosters : undefined,
                    maxers: rewardMaxers > 0 ? rewardMaxers : undefined,
                    badge: rewardBadge !== 'none' ? rewardBadge : undefined
                }
            });
            toast({ title: "Global Gift Dispatched!" });
            
            // Reset
            setPopupMessage('');
            setRewardCredits(0); setRewardScratch(0); setRewardFlip(0); setRewardWallet(0);
            setRewardShields(0); setRewardFreezes(0); setRewardBoosters(0); setRewardMaxers(0);
            setRewardBadge('none'); setMaxClaims(0); setSelectedUser(null);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 items-start">
                <Card className="lg:col-span-7 border-pink-500/20 bg-pink-500/5 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2 uppercase italic text-pink-500"><Gift className="h-8 w-8"/> Reward Deployment Terminal</CardTitle>
                        <CardDescription className="font-bold">Protocol: Universal Asset Distribution</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Ingress</Label>
                                    <div className="flex gap-2 p-1 bg-muted/50 rounded-xl border">
                                        <Button size="sm" variant={popupTarget === 'all' ? 'default' : 'ghost'} className="flex-1 font-bold uppercase text-[10px]" onClick={() => setPopupTarget('all')}>Broadcast All</Button>
                                        <Button size="sm" variant={popupTarget === 'single' ? 'default' : 'ghost'} className="flex-1 font-bold uppercase text-[10px]" onClick={() => setPopupTarget('single')}>Target Direct</Button>
                                    </div>
                                </div>

                                {popupTarget === 'single' && (
                                    <div className="space-y-2 relative">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="Search legend name or MM-ID..." className="pl-9 h-12" value={userSearchTerm} onChange={e => setUserSearchTerm(e.target.value)} />
                                        </div>
                                        {selectedUser && (
                                            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/20 animate-in zoom-in-95">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8 border"><AvatarImage src={selectedUser.photoURL}/><AvatarFallback>U</AvatarFallback></Avatar>
                                                    <p className="font-bold text-sm truncate max-w-[120px]">{selectedUser.displayName}</p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setSelectedUser(null)}><X className="h-4 w-4"/></Button>
                                            </div>
                                        )}
                                        {filteredUsers.length > 0 && !selectedUser && (
                                            <div className="absolute top-full left-0 w-full bg-background border rounded-xl mt-1 shadow-2xl z-50 overflow-hidden divide-y">
                                                {filteredUsers.map(u => (
                                                    <button key={u.uid} onClick={() => setSelectedUser(u)} className="w-full p-3 flex items-center gap-3 hover:bg-muted transition-colors text-left">
                                                        <Avatar className="h-8 w-8"><AvatarImage src={u.photoURL}/><AvatarFallback>U</AvatarFallback></Avatar>
                                                        <div><p className="text-sm font-bold">{u.displayName}</p><p className="text-[10px] text-muted-foreground uppercase">{u.mindMateId || u.uid.slice(-8)}</p></div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {popupTarget === 'all' && (
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stock Limit (Max Claims)</Label>
                                        <div className="relative">
                                            <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-50" />
                                            <Input type="number" value={maxClaims} onChange={e => setMaxClaims(Number(e.target.value))} className="pl-9 h-12 font-black" placeholder="0 = Unlimited" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mission Briefing Message</Label>
                                    <Input value={popupMessage} onChange={e => setPopupMessage(e.target.value)} placeholder="e.g., A token of gratitude for your progress!" className="h-12 font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identity Badge</Label>
                                    <Select value={rewardBadge} onValueChange={(v: any) => setRewardBadge(v)}>
                                        <SelectTrigger className="h-12 font-bold"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {availableBadges.map(b => <SelectItem key={b} value={b} className="uppercase font-bold">{b.replace(/-/g, ' ')}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-white/5" />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Credits', val: rewardCredits, set: setRewardCredits, icon: Gem, color: 'text-amber-500' },
                                { label: 'Vault ₹', val: rewardWallet, set: setRewardWallet, icon: Wallet, color: 'text-emerald-500' },
                                { label: 'Scratch', val: rewardScratch, set: setRewardScratch, icon: VenetianMask, color: 'text-primary' },
                                { label: 'Flip', val: rewardFlip, set: setRewardFlip, icon: Zap, color: 'text-indigo-500' },
                                { label: 'Shields', val: rewardShields, set: setRewardShields, icon: ShieldCheck, color: 'text-blue-400' },
                                { label: 'Freezes', val: rewardFreezes, set: setRewardFreezes, icon: Snowflake, color: 'text-cyan-400' },
                                { label: 'XP Boost', val: rewardBoosters, set: setRewardBoosters, icon: TrendingUp, color: 'text-green-400' },
                                { label: 'Ascend', val: rewardMaxers, set: setRewardMaxers, icon: Crown, color: 'text-yellow-400' }
                            ].map((item, i) => (
                                <div key={i} className="space-y-2 p-3 bg-background/40 rounded-xl border border-white/5 transition-all hover:border-white/10 group">
                                    <Label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
                                        <item.icon className={cn("h-3 w-3", item.color)}/> {item.label}
                                    </Label>
                                    <Input type="number" value={item.val} onChange={e => item.set(Number(e.target.value))} className="h-10 font-black text-center border-none bg-black/20 shadow-inner" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSendGift} disabled={isSending || !popupMessage.trim()} className="w-full h-16 bg-pink-500 hover:bg-pink-600 text-white font-black text-xl shadow-[0_0_30px_rgba(236,72,153,0.4)] rounded-2xl animate-in zoom-in-95">
                            {isSending ? <Loader2 className="animate-spin mr-2"/> : <Send className="mr-2"/>}
                            EXECUTE DISTRIBUTION PULSE
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="lg:col-span-5 h-full flex flex-col border-white/5 bg-card/20 backdrop-blur-3xl overflow-hidden">
                    <CardHeader className="pb-2 border-b border-white/5 bg-black/20">
                        <CardTitle className="text-base flex items-center gap-2 uppercase tracking-widest"><History className="h-4 w-4 text-primary"/> Historical Records</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        <ScrollArea className="h-[600px] p-4">
                            <div className="space-y-4">
                                {globalGifts.map(gift => (
                                    <div key={gift.id} className={cn("p-5 rounded-[2rem] border bg-background/40 relative group transition-all", !gift.isActive && "opacity-50 grayscale")}>
                                        <div className="flex justify-between items-start mb-3">
                                            <Badge variant={gift.isActive ? "default" : "secondary"} className="text-[8px] font-black uppercase tracking-widest">{gift.isActive ? 'Pulse Active' : 'Offline'}</Badge>
                                            <div className="flex gap-1.5">
                                                {gift.isActive && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black" onClick={() => deactivateGift(gift.id)}><X className="h-4 w-4"/></Button>}
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" onClick={() => deleteGlobalGift(gift.id)}><Trash2 className="h-4 w-4"/></Button>
                                            </div>
                                        </div>
                                        
                                        <p className="text-sm font-bold leading-tight line-clamp-3 mb-4 italic">"{gift.message}"</p>
                                        
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {gift.rewards.credits > 0 && <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500">+{gift.rewards.credits} CR</Badge>}
                                            {gift.rewards.wallet && <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-500">+₹{gift.rewards.wallet} Vault</Badge>}
                                            {gift.rewards.badge && <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-500">{gift.rewards.badge.toUpperCase()}</Badge>}
                                            {gift.rewards.shields && <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-500">{gift.rewards.shields} Aegis</Badge>}
                                        </div>

                                        <div className="space-y-2 border-t border-white/5 pt-3">
                                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest opacity-60">
                                                <span>Harvest Rate</span>
                                                <span>{gift.claimedBy?.length || 0} / {gift.maxClaims || '∞'}</span>
                                            </div>
                                            <Progress value={gift.maxClaims ? ((gift.claimedBy?.length || 0) / gift.maxClaims * 100) : 100} className="h-1" />
                                        </div>

                                        <p className="text-[8px] font-black text-muted-foreground uppercase mt-3 flex items-center gap-1"><Clock className="h-2.5 w-2.5"/> Distributed {format(gift.createdAt, 'PPp')}</p>
                                    </div>
                                ))}
                                {globalGifts.length === 0 && (
                                    <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
                                        <Gift className="h-16 w-16" />
                                        <p className="text-xs font-black uppercase tracking-widest">Archive Empty</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function Separator({ className }: { className?: string }) {
    return <div className={cn("h-px w-full", className)} />;
}
