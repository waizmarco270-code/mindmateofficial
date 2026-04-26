
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMentor, MentorSession } from '@/hooks/use-mentor';
import { useUser } from '@clerk/nextjs';
import { useImmersive } from '@/hooks/use-immersive';
import { Loader2, ShieldX, X, MessageSquare, Info, Star, Video, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';

export default function MentorMeetingRoom() {
    const { sessionId } = useParams();
    const router = useRouter();
    const { user } = useUser();
    const { sessions, loading, submitFeedback } = useMentor();
    const { setIsImmersive } = useImmersive();

    const [session, setSession] = useState<MentorSession | null>(null);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
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
                // Check if user is participant or the mentor/admin
                // Note: We'd ideally have isAdmin/isSuperAdmin here too for full parity
                const isMentor = found.mentorId === user.id;
                setIsAuthorized(found.participants.includes(user.id) || isMentor);
                setIsEnded(found.status === 'ended');
            } else {
                setIsAuthorized(false);
            }
        }
    }, [sessions, loading, sessionId, user]);

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
                        <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500 mt-1 animate-pulse">Live Encryption Active</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full text-white/40 hover:text-white hover:bg-red-500/20" onClick={() => router.push('/dashboard/mentor')}><X/></Button>
            </div>

            <div id="jitsi-container" className="flex-1 bg-black" />
        </div>
    );
}
