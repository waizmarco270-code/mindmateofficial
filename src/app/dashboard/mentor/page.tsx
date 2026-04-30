'use client';

import { useState, useEffect } from 'react';
import { useMentor, MentorSession, MentorRequest } from '@/hooks/use-mentor';
import { useAdmin, useUsers } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Users, Clock, Calendar, 
    ArrowRight, CheckCircle, 
    Lock, Timer, ShieldCheck, 
    Video, MessageSquare, Star,
    AlertTriangle, Loader2, Sparkles,
    UserCircle, Info, Share2, Copy,
    Key, Plus, Gem, Wallet, CreditCard,
    History, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInSeconds, isPast } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createRazorpayOrder } from '@/app/actions/razorpay';
import Script from 'next/script';

export default function MentorHub() {
    const { user } = useUser();
    const { sessions, requests, loading, bookSlot, submitMeetingRequest } = useMentor();
    const { isAdmin, isSuperAdmin, currentUserData } = useAdmin();
    const { addCreditsToUser } = useUsers();
    const { toast } = useToast();

    const [isRequestOpen, setIsRequestOpen] = useState(false);
    const [requestType, setRequestType] = useState<'standard' | 'guaranteed' | null>(null);
    const [requestMsg, setRequestMsg] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    if (loading) return (
        <div className="flex h-full w-full items-center justify-center p-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );

    const upcoming = sessions.filter(s => s.status !== 'ended');
    const past = sessions.filter(s => s.status === 'ended');
    const myRequests = requests.filter(r => r.userId === user?.id);

    const handleStandardRequest = async () => {
        if (!user || !currentUserData) return;
        const cost = 100;
        const hasMaster = currentUserData.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();

        if (!hasMaster && currentUserData.credits < cost) {
            toast({ variant: 'destructive', title: "Insufficient Credits", description: `You need ${cost} credits to file a petition.` });
            return;
        }

        setIsProcessing(true);
        try {
            if (!hasMaster) await addCreditsToUser(user.id, -cost);
            await submitMeetingRequest(requestMsg, 'standard');
            setIsRequestOpen(false);
            setRequestType(null);
            setRequestMsg('');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGuaranteedRequest = async () => {
        if (!user) return;
        setIsProcessing(true);
        try {
            const order = await createRazorpayOrder(49, {
                userId: user.id,
                packName: 'Guaranteed Meeting Request',
                credits: 0
            });

            const options = {
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: 'MindMate Sovereign',
                description: 'Guaranteed Briefing Request',
                order_id: order.id,
                handler: async function (response: any) {
                    await submitMeetingRequest(requestMsg, 'guaranteed', response.razorpay_payment_id);
                    setIsRequestOpen(false);
                    setRequestType(null);
                    setRequestMsg('');
                    setIsProcessing(false);
                },
                theme: { color: '#8b5cf6' },
                modal: { ondismiss: () => setIsProcessing(false) }
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (e: any) {
            toast({ variant: 'destructive', title: "Payment Signal Lost", description: e.message });
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
                        Mentor Mode
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs mt-2">
                        Protocol: High-Fidelity Micro Sessions
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => setIsRequestOpen(true)} className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest h-12 px-6 shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-4 w-4"/> Request Briefing
                    </Button>
                    {(isAdmin || isSuperAdmin) && (
                        <Button asChild variant="outline" className="rounded-2xl border-primary/20 bg-primary/5 hover:bg-primary/10 font-black uppercase text-[10px] tracking-widest h-12 px-6">
                            <Link href="/dashboard/mentor/admin">Command Center</Link>
                        </Button>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-12">
                    {/* UPCOMING SESSIONS */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h3 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-3">
                                <Calendar className="text-primary"/> Scheduled Briefings
                            </h3>
                            <Badge variant="outline" className="font-bold opacity-60">{upcoming.length} ACTIVE</Badge>
                        </div>

                        <div className="grid gap-6">
                            {upcoming.map((session, i) => (
                                <SessionCard 
                                    key={session.id} 
                                    session={session} 
                                    userId={user?.id} 
                                    onBook={() => bookSlot(session.id)}
                                    isAdmin={isAdmin || isSuperAdmin}
                                />
                            ))}
                            {upcoming.length === 0 && (
                                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-30">
                                    <Users className="h-16 w-16 mx-auto mb-4" />
                                    <p className="text-sm font-black uppercase tracking-widest">No active sessions manifest</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* USER REQUESTS LOG */}
                    <AnimatePresence>
                        {myRequests.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-12 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <History className="text-primary h-6 w-6" />
                                    <h3 className="text-xl font-black uppercase italic tracking-tight text-white">Petition History</h3>
                                </div>
                                <div className="grid gap-4">
                                    {myRequests.map(req => (
                                        <Card key={req.id} className="bg-white/[0.02] border-white/5 rounded-2xl p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    {req.type === 'guaranteed' ? <Badge className="bg-yellow-400 text-black font-black">GUARANTEED</Badge> : <Badge variant="outline" className="font-black">STANDARD</Badge>}
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                        {req.createdAt ? format(req.createdAt.toDate(), 'PPp') : 'Processing...'}
                                                    </span>
                                                </div>
                                                <Badge className={cn(
                                                    "font-black uppercase text-[10px]",
                                                    req.status === 'confirmed' ? "bg-emerald-500" : req.status === 'rejected' ? "bg-red-500" : "bg-amber-500"
                                                )}>
                                                    {req.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm font-bold text-slate-300 italic">"{req.message}"</p>
                                            {req.adminReply && (
                                                <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                                                    <p className="text-[9px] font-black uppercase text-primary mb-1 flex items-center gap-1.5"><ShieldCheck className="h-3 w-3"/> High Council Response</p>
                                                    <p className="text-xs font-medium text-slate-400">{req.adminReply}</p>
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <Card className="bg-primary/5 border-primary/20 rounded-[2.5rem] p-8">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2 mb-4">
                            <Info className="h-4 w-4" /> Usage Protocol
                        </h4>
                        <div className="space-y-4 text-xs font-medium leading-relaxed italic text-slate-400">
                            <p>"Secure your slot early. Each session is hard-capped at 5 Citizens to ensure high-fidelity interaction."</p>
                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/20 border border-white/5">
                                <Lock className="h-5 w-5 text-amber-500 shrink-0" />
                                <p>Sessions are protected by Sovereign Passcodes. Join button activates at T-Minus 0.</p>
                            </div>
                        </div>
                    </Card>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 px-4">Historical Archives</h4>
                        {past.map(session => (
                            <Card key={session.id} className="bg-black/20 border-white/5 rounded-2xl p-4 opacity-60">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-sm truncate max-w-[150px]">{session.title}</p>
                                    <Badge variant="secondary" className="text-[8px] uppercase">ENDED</Badge>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">{session.mentorName}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* REQUEST PETITION DIALOG */}
            <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
                <DialogContent className="max-w-2xl bg-slate-950 border-primary/20 rounded-[3rem] p-0 overflow-hidden shadow-2xl">
                    <div className="p-8 sm:p-12 space-y-8">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter text-white">Petition for Briefing</DialogTitle>
                            <DialogDescription className="text-sm font-medium text-slate-400">Request a dedicated micro-session for a specific tactical objective.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Briefing Topic / Mission Directive</Label>
                                <Textarea 
                                    value={requestMsg} 
                                    onChange={e => setRequestMsg(e.target.value)} 
                                    placeholder="e.g. Needs immediate guidance on Backlog Management & Fluid Mechanics..." 
                                    className="bg-black/40 border-white/10 rounded-2xl min-h-[120px] text-base"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setRequestType('standard')}
                                    className={cn(
                                        "p-6 rounded-[2rem] border-2 text-left space-y-3 transition-all",
                                        requestType === 'standard' ? "bg-primary/10 border-primary shadow-xl" : "bg-white/5 border-white/5 hover:border-white/10"
                                    )}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 rounded-2xl bg-black/20 border border-white/5"><Gem className="h-5 w-5 text-primary"/></div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase">100 CR</span>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg uppercase italic leading-none">Standard Ingress</h4>
                                        <p className="text-[9px] text-muted-foreground font-medium mt-1 leading-relaxed">High Council review required. No guarantee of fulfillment.</p>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => setRequestType('guaranteed')}
                                    className={cn(
                                        "p-6 rounded-[2rem] border-2 text-left space-y-3 transition-all relative overflow-hidden",
                                        requestType === 'guaranteed' ? "bg-yellow-400/10 border-yellow-400 shadow-xl" : "bg-white/5 border-white/5 hover:border-white/10"
                                    )}
                                >
                                    <div className="absolute top-0 right-0 p-2 bg-yellow-400 text-black font-black text-[8px] uppercase rounded-bl-xl tracking-tighter">Guaranteed</div>
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 rounded-2xl bg-black/20 border border-white/5 text-yellow-400"><CreditCard className="h-5 w-5"/></div>
                                        <span className="text-[10px] font-black text-yellow-400 uppercase">₹49</span>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg uppercase italic leading-none text-white">Sovereign Link</h4>
                                        <p className="text-[9px] text-muted-foreground font-medium mt-1 leading-relaxed">Priority Ingress. Session fulfillment is officially mandated.</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <DialogFooter className="flex flex-col sm:flex-row gap-3">
                            <DialogClose asChild><Button variant="ghost" className="rounded-xl font-bold">ABORT</Button></DialogClose>
                            <Button 
                                disabled={isProcessing || !requestType || !requestMsg.trim()} 
                                onClick={requestType === 'standard' ? handleStandardRequest : handleGuaranteedRequest}
                                className={cn(
                                    "h-16 px-10 rounded-2xl font-black text-lg uppercase italic shadow-2xl",
                                    requestType === 'guaranteed' ? "bg-yellow-400 hover:bg-yellow-500 text-black" : "bg-primary"
                                )}
                            >
                                {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <Send className="mr-2 h-5 w-5"/>}
                                {requestType === 'guaranteed' ? 'AUTHORIZE SOVEREIGN LINK' : 'FILE PETITION'}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function SessionCard({ session, userId, onBook, isAdmin }: { session: MentorSession, userId?: string, onBook: () => void, isAdmin: boolean }) {
    const { toast } = useToast();
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isLive, setIsLive] = useState(false);
    
    const isParticipant = session.participants.includes(userId || '');
    const isHost = userId === session.mentorId || isAdmin;
    const isFull = session.participants.length >= session.maxUsers;
    const startTime = session.startTime.toDate();

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const diff = differenceInSeconds(startTime, now);
            
            if (diff <= 0) {
                setIsLive(true);
                setTimeLeft('00:00:00');
                clearInterval(interval);
            } else {
                const h = Math.floor(diff / 3600);
                const m = Math.floor((diff % 3600) / 60);
                const s = diff % 60;
                setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    const handleShare = async () => {
        const shareData = {
            title: `MindMate Briefing: ${session.title}`,
            text: `Legend! You are invited to a Sovereign Mentorship Session.\n\n📚 Title: ${session.title}\n⏰ Start: ${format(startTime, 'h:mm a, MMM do')}\n🔐 Passcode: ${session.passcode || 'Contact Admin'}\n\nJoin the uplink here:`,
            url: `${window.location.origin}/dashboard/mentor/${session.id}`
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (e) {}
        } else {
            navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
            toast({ title: "Briefing Copied", description: "Strategic data stored in clipboard." });
        }
    };

    return (
        <Card className="relative overflow-hidden bg-slate-900/40 backdrop-blur-xl border-white/10 rounded-[3rem] group hover:border-primary/30 transition-all duration-500">
            <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
            <CardContent className="p-8 sm:p-10 flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="relative">
                    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                        <Video className={cn("h-10 w-10", isLive ? "text-emerald-500 animate-pulse" : "text-primary")} />
                    </div>
                    {(isParticipant || isHost) && (
                        <div className="absolute -top-3 -right-2 bg-emerald-500 text-black rounded-full p-1 border-4 border-slate-900">
                            <CheckCircle className="h-4 w-4" />
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <Badge className="bg-primary/20 text-primary border-primary/30 font-black uppercase text-[9px] tracking-widest">{session.duration} MIN SESSION</Badge>
                        <span className="text-[10px] font-black uppercase text-slate-500">Target: {session.mentorName}</span>
                    </div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white truncate">{session.title}</h3>
                    <p className="text-slate-400 font-medium text-sm line-clamp-1">{session.description}</p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 mt-6">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary opacity-40" />
                            <span className="text-xs font-black text-white italic tabular-nums">{format(startTime, 'HH:mm • MMM do')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary opacity-40" />
                            <span className={cn("text-xs font-black italic", isFull ? "text-red-500" : "text-emerald-500")}>
                                {session.participants.length} / {session.maxUsers} SEATS
                            </span>
                        </div>
                        {isParticipant && (
                            <div className="flex items-center gap-2">
                                <Key className="h-4 w-4 text-amber-500" />
                                <span className="text-xs font-black text-white tabular-nums">CODE: {session.passcode}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                    {!isLive && (
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Authorization T-Minus</p>
                            <p className="text-2xl font-black font-mono text-white tabular-nums tracking-tighter">{timeLeft}</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-2 w-full">
                        { (isParticipant || isHost) ? (
                            <Button 
                                asChild 
                                disabled={!isLive && !isHost} 
                                size="lg" 
                                className={cn(
                                    "h-16 px-10 rounded-2xl font-black text-lg uppercase italic shadow-2xl transition-all",
                                    (isLive || isHost) ? "bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/20" : "bg-white/5 text-white/20 border-white/5 cursor-not-allowed"
                                )}
                            >
                                {(isLive || isHost) ? <Link href={`/dashboard/mentor/${session.id}`}>BREACH ROOM <ArrowRight className="ml-2"/></Link> : <span>ROOM LOCKED</span>}
                            </Button>
                        ) : (
                            <Button 
                                onClick={onBook} 
                                disabled={isFull} 
                                size="lg" 
                                className={cn(
                                    "h-16 px-10 rounded-2xl font-black text-lg uppercase italic shadow-2xl transition-all",
                                    isFull ? "bg-white/5 text-white/20 border-white/5" : "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
                                )}
                            >
                                {isFull ? 'CAPACITY REACHED' : 'BOOK SLOT'}
                            </Button>
                        )}
                        
                        {(isParticipant || isHost) && (
                            <Button 
                                variant="ghost" 
                                className="text-xs font-black uppercase text-slate-500 hover:text-white"
                                onClick={handleShare}
                            >
                                <Share2 className="mr-2 h-3 w-3"/> Dispatch Invite
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
