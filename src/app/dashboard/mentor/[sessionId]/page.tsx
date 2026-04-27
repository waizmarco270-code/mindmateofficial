
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMentor, MentorSession } from '@/hooks/use-mentor';
import { useUser } from '@clerk/nextjs';
import { useImmersive } from '@/hooks/use-immersive';
import { 
    Loader2, ShieldX, X, MessageSquare, 
    Info, Star, Video, CheckCircle, 
    Lock, Key, Zap, ShieldAlert,
    ChevronRight, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export default function MentorMeetingRoom() {
    const { sessionId } = useParams();
    const router = useRouter();
    const { user } = useUser();
    const { sessions, loading, submitFeedback } = useMentor();
    const { setIsImmersive } = useImmersive();
    const { toast } = useToast();

    const [session, setSession] = useState<MentorSession | null>(null);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [passcodeEntered, setPasscodeEntered] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isEnded, setIsEnded] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setIsImmersive(true);
        return () => setIsImmersive(false);
    }, [setIsImmersive]);

    useEffect(() => {
        if (!loading && user) {
            const found = sessions.find(s => s.id === sessionId);
            if (found) {
                setSession(found);
                const isMentor = found.mentorId === user.id;
                setIsAuthorized(found.participants.includes(user.id) || isMentor);
                setIsEnded(found.status === 'ended');
                
                // Mentors bypass passcode entry
                if (isMentor) setIsUnlocked(true);
            } else {
                setIsAuthorized(false);
            }
        }
    }, [sessions, loading, sessionId, user]);

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (passcodeEntered.toUpperCase() === session?.passcode) {
            setIsUnlocked(true);
            toast({ title: "AUTHORIZATION SECURED", description: "Mission Uplink Established.", className: "bg-emerald-600 text-white" });
        } else {
            toast({ variant: 'destructive', title: "ACCESS DENIED", description: "Invalid Sovereign Passcode." });
            setPasscodeEntered('');
        }
    };

    const handleFeedback = async () => {
        if (!rating || !sessionId) return;
        setIsSubmitting(true);
        try {
            await submitFeedback(sessionId as string, rating, feedback);
            router.replace('/dashboard/mentor');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || isAuthorized === null) return (
        <div className="flex h-screen w-screen items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="font-black uppercase tracking-[0.4em] text-[10px] text-white opacity-40">Authenticating Signal...</p>
            </div>
        </div>
    );

    if (!isAuthorized) return (
        <div className="flex h-screen w-screen items-center justify-center bg-black p-8">
            <Card className="max-w-md w-full border-red-600/50 bg-red-950/20 text-center p-8">
                <ShieldX className="h-16 w-16 text-red-600 mx-auto mb-6" />
                <h2 className="text-3xl font-black text-white uppercase italic">ACCESS DENIED</h2>
                <p className="text-slate-300 mt-4 font-medium">You are not registered in the participants registry for this mission.</p>
                <Button className="mt-8 w-full" onClick={() => router.push('/dashboard/mentor')}>Abort Entry</Button>
            </Card>
        </div>
    );

    if (isEnded) return (
        <div className="flex h-screen w-screen items-center justify-center bg-black p-8">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-xl w-full">
                <Card className="border-primary/20 bg-slate-900 rounded-[3rem] overflow-hidden">
                    <CardHeader className="text-center p-10 bg-primary/5 border-b border-white/5">
                        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                        <CardTitle className="text-3xl font-black uppercase italic text-white">Session Completed</CardTitle>
                        <CardDescription className="text-lg font-bold">Protocol concluded. Your feedback is requested.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 space-y-8">
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Operational Rating</p>
                            <div className="flex gap-4">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button key={s} onClick={() => setRating(s)} className={cn("transition-all duration-300 transform hover:scale-125", rating >= s ? "text-yellow-400" : "text-slate-700")}>
                                        <Star className="h-10 w-10 fill-current" />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Intelligence Report</Label>
                            <Textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="What did you learn today?" className="bg-black/40 border-white/10 rounded-2xl min-h-[120px]" />
                        </div>
                    </CardContent>
                    <CardFooter className="p-10 pt-0 flex gap-4">
                        <Button variant="ghost" className="flex-1 font-bold" onClick={() => router.replace('/dashboard/mentor')}>SKIP</Button>
                        <Button className="flex-2 h-14 px-8 rounded-2xl font-black uppercase bg-primary shadow-xl" disabled={!rating || isSubmitting} onClick={handleFeedback}>
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'SUBMIT REPORT'}
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );

    if (!isUnlocked) return (
        <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 bg-grid-white/5 opacity-10 pointer-events-none" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md relative z-10">
                <Card className="border-amber-500/30 bg-slate-900/50 backdrop-blur-3xl rounded-[3rem] shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden">
                    <CardHeader className="text-center p-8 sm:p-10 border-b border-white/5">
                        <div className="mx-auto w-20 h-20 bg-amber-500/10 rounded-[2rem] border-2 border-amber-500/20 flex items-center justify-center mb-6">
                            <Lock className="h-10 w-10 text-amber-500 animate-pulse" />
                        </div>
                        <CardTitle className="text-3xl font-black uppercase italic tracking-tighter">Shielded Uplink</CardTitle>
                        <CardDescription className="text-sm font-bold uppercase tracking-widest text-slate-400 mt-1">Identity Verified • Code Required</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 sm:p-10 space-y-8">
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center italic text-xs text-slate-400">
                                "The briefing theatre for <b>{session?.title}</b> is locked. Enter the Sovereign Passcode sent to your registry."
                            </div>
                            <form onSubmit={handleUnlock} className="space-y-6">
                                <div className="space-y-2 text-center">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Operational Passcode</Label>
                                    <Input 
                                        autoFocus
                                        value={passcodeEntered}
                                        onChange={e => setPasscodeEntered(e.target.value.toUpperCase())}
                                        placeholder="XXXXXX"
                                        className="h-16 text-center text-4xl font-black tracking-[0.5em] bg-black/40 border-amber-500/20 rounded-2xl focus-visible:ring-amber-500/30"
                                        maxLength={6}
                                    />
                                </div>
                                <Button className="w-full h-16 rounded-2xl font-black text-xl italic bg-amber-500 hover:bg-amber-600 text-black shadow-xl">
                                    BREACH PROTOCOL <ChevronRight className="ml-2 h-6 w-6"/>
                                </Button>
                            </form>
                        </div>
                        
                        <div className="pt-4 border-t border-white/5">
                            <Button variant="ghost" onClick={() => router.push('/dashboard/mentor')} className="w-full text-slate-500 hover:text-white font-bold text-xs uppercase tracking-widest">
                                <ArrowLeft className="mr-2 h-4 w-4"/> ABORT INGRESS
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );

    return (
        <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
            <Script src="https://meet.jit.si/external_api.js" onLoad={() => {
                const domain = 'meet.jit.si';
                const options = {
                    roomName: session?.roomId,
                    width: '100%',
                    height: '100%',
                    parentNode: document.querySelector('#jitsi-container'),
                    userInfo: {
                        displayName: user?.fullName || 'Active Legend'
                    },
                    interfaceConfigOverwrite: {
                        TOOLBAR_BUTTONS: [
                            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                            'factions', 'hangup', 'chat', 'raisehand',
                            'videoquality', 'filmstrip', 'shortcuts',
                            'tileview', 'videobackgroundblur', 'help', 'mute-everyone',
                            'security'
                        ],
                        SHOW_JITSI_WATERMARK: false,
                        MOBILE_APP_PROMO: false
                    },
                    configOverwrite: {
                        disableDeepLinking: true,
                        prejoinPageEnabled: false
                    }
                };
                new (window as any).JitsiMeetExternalAPI(domain, options);
            }} />
            
            <div className="p-4 bg-[#1f2c34] flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Video className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h4 className="font-black text-white uppercase italic tracking-tighter leading-none">{session?.title}</h4>
                        <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500 mt-1 animate-pulse">Sovereign Uplink Secure</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full text-white/40 hover:text-white hover:bg-red-500/20" onClick={() => router.push('/dashboard/mentor')}><X/></Button>
            </div>

            <div id="jitsi-container" className="flex-1 bg-black" />
        </div>
    );
}
