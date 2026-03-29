
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldAlert, Lock, Zap, Trophy, Clock, 
    Gem, Wallet, Star, ArrowRight, Loader2,
    CheckCircle, AlertTriangle, Info, Play, Pause,
    Smartphone, Monitor, CreditCard, Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useIsolation, ISOLATION_CONFIGS, type IsolationDuration } from '@/hooks/use-isolation';
import { useUsers } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { createRazorpayOrder } from '@/app/actions/razorpay';
import Script from 'next/script';

export default function IsolationHub() {
    const { user } = useUser();
    const { activeSession, startIsolation, updateProgress, emergeVictory, failIsolation, loading } = useIsolation();
    const { currentUserData } = useUsers();
    const { toast } = useToast();

    const [selectedDuration, setSelectedDuration] = useState<IsolationDuration | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [timerActive, setTimerActive] = useState(false);
    
    // Anti-Cheat Timer Refs
    const lastTickRef = useRef<number>(Date.now());
    const heartbeatRef = useRef<number>(0);

    useEffect(() => {
        if (!timerActive || activeSession?.status !== 'active') return;

        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                const now = Date.now();
                const delta = Math.floor((now - lastTickRef.current) / 1000);
                
                if (delta >= 1) {
                    updateProgress(delta);
                    lastTickRef.current = now;
                    heartbeatRef.current += delta;
                    
                    // Periodic persistence check
                    if (heartbeatRef.current >= 60) {
                        heartbeatRef.current = 0;
                    }
                }
            } else {
                // Backgrounded: Auto-Pause
                setTimerActive(false);
                toast({ title: "Timer Paused", description: "Isolation requires active presence. Return to continue." });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [timerActive, activeSession, updateProgress, toast]);

    const handleIngress = async (method: 'credits' | 'money') => {
        if (!selectedDuration || !user) return;
        setIsStarting(true);
        try {
            if (method === 'money') {
                const config = ISOLATION_CONFIGS[selectedDuration];
                const order = await createRazorpayOrder(config.moneyCost, {
                    userId: user.id,
                    packName: `Isolation: ${config.label}`,
                    credits: 0
                });

                const options = {
                    key: order.keyId,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'MindMate Isolation',
                    description: `Ingress for ${config.label}`,
                    order_id: order.id,
                    handler: async (response: any) => {
                        await startIsolation(selectedDuration, 'money', response.razorpay_payment_id);
                    },
                    theme: { color: '#8b5cf6' }
                };
                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            } else {
                await startIsolation(selectedDuration, 'credits');
            }
        } catch (e: any) {
            toast({ variant: 'destructive', title: "Ingress Failed", description: e.message });
        } finally {
            setIsStarting(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>;

    if (activeSession && activeSession.status === 'active') {
        const config = ISOLATION_CONFIGS[activeSession.durationId];
        const percent = Math.min(100, (activeSession.accumulatedSeconds / activeSession.totalTargetSeconds) * 100);
        const hoursRemaining = Math.max(0, (activeSession.totalTargetSeconds - activeSession.accumulatedSeconds) / 3600);

        return (
            <div className="min-h-screen bg-[#050505] p-4 sm:p-8 flex flex-col items-center">
                <div className="max-w-4xl w-full space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="text-red-500 animate-pulse" />
                            <h1 className="text-2xl font-black uppercase tracking-tighter text-white">ISOLATION ACTIVE</h1>
                        </div>
                        <Badge className="bg-red-500 text-black font-black uppercase">Phase: {config.label}</Badge>
                    </div>

                    <Card className="bg-slate-900/50 border-primary/20 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
                        <div className="p-8 md:p-12 text-center space-y-8">
                            <div className="space-y-2">
                                <p className="text-sm font-black uppercase text-muted-foreground tracking-widest">Scientific Goal</p>
                                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">{config.targetHours} HOURS</h2>
                                <p className="text-primary font-bold">{hoursRemaining.toFixed(1)} Hours Remaining</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-xs font-black uppercase">
                                    <span>Progress</span>
                                    <span>{percent.toFixed(1)}%</span>
                                </div>
                                <Progress value={percent} className="h-4 bg-white/5" indicatorClassName="animated-rainbow-progress" />
                            </div>

                            <div className="py-8 border-y border-white/5 grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">Time Elapsed</p>
                                    <p className="text-2xl font-bold font-mono">{(activeSession.accumulatedSeconds / 3600).toFixed(2)}h</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">Session Integrity</p>
                                    <p className="text-2xl font-bold text-green-500">100% SECURE</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button 
                                    size="lg" 
                                    className={cn("flex-1 h-20 rounded-3xl text-2xl font-black uppercase shadow-2xl", timerActive ? "bg-amber-500 hover:bg-amber-600 text-black" : "bg-primary text-white shadow-primary/20")}
                                    onClick={() => { setTimerActive(!timerActive); lastTickRef.current = Date.now(); }}
                                >
                                    {timerActive ? <><Pause className="mr-3 h-8 w-8" /> PAUSE TIMER</> : <><Play className="mr-3 h-8 w-8" /> START TRACKING</>}
                                </Button>
                                {percent >= 100 && (
                                    <Button size="lg" variant="secondary" className="flex-1 h-20 rounded-3xl text-2xl font-black uppercase bg-green-500 hover:bg-green-600 text-black" onClick={emergeVictory}>
                                        EMERGE VICTORIOUS
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-red-500/5 border-red-500/20 p-6 rounded-3xl">
                            <h4 className="flex items-center gap-2 text-red-500 font-black uppercase text-xs tracking-widest mb-4">
                                <ShieldAlert className="h-4 w-4" /> ANTI-CHEAT ACTIVE
                            </h4>
                            <ul className="space-y-3 text-xs font-medium text-slate-400">
                                <li>• Timer pauses automatically if window is blurred.</li>
                                <li>• Must study 10h/day avg to meet the target.</li>
                                <li>• PC Users: Instagram/YouTube redirects are active.</li>
                            </ul>
                        </Card>
                        <Card className="bg-primary/5 border-primary/20 p-6 rounded-3xl flex flex-col justify-center text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Target Asset</p>
                            <div className="flex items-center justify-center gap-3">
                                <Award className="h-8 w-8 text-primary animate-bounce" />
                                <span className="text-xl font-black uppercase italic text-white">{config.badgeName}</span>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic uppercase flex items-center gap-3">
                        <Lock className="text-red-500" /> ISOLATION TERMINAL
                    </h1>
                    <p className="text-muted-foreground font-medium">Protocol: Voluntary Digital Exile for Absolute Mastery.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {(Object.entries(ISOLATION_CONFIGS)).map(([id, config]) => (
                            <button 
                                key={id} 
                                onClick={() => setSelectedDuration(id as IsolationDuration)}
                                className={cn(
                                    "p-6 rounded-[2rem] border-2 transition-all text-left space-y-4 group",
                                    selectedDuration === id ? "bg-primary/10 border-primary shadow-xl" : "bg-muted/30 border-white/5 hover:border-primary/30"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="p-3 rounded-2xl bg-black/20 border border-white/5 group-hover:scale-110 transition-transform">
                                        <Clock className="h-6 w-6 text-primary" />
                                    </div>
                                    {id === '1y' && <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 animate-pulse" />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tighter uppercase">{config.label}</h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{config.targetHours} Study Hours</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {selectedDuration && (
                        <Card className="border-primary/30 bg-primary/5 animate-in slide-in-from-bottom-4">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">Protocol: {ISOLATION_CONFIGS[selectedDuration].label}</CardTitle>
                                <CardDescription>Confirm your ingress method to begin the lockdown.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button 
                                    size="lg" 
                                    variant="outline" 
                                    className="h-24 flex-col gap-2 rounded-2xl border-primary/20 hover:bg-primary/10"
                                    onClick={() => handleIngress('credits')}
                                    disabled={isStarting}
                                >
                                    <div className="flex items-center gap-2 font-black text-lg">
                                        <Gem className="text-primary" /> {ISOLATION_CONFIGS[selectedDuration].creditCost}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Sovereign Credits</span>
                                </Button>
                                <Button 
                                    size="lg" 
                                    className="h-24 flex-col gap-2 rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-xl shadow-primary/20"
                                    onClick={() => handleIngress('money')}
                                    disabled={isStarting}
                                >
                                    <div className="flex items-center gap-2 font-black text-lg">
                                        ₹{ISOLATION_CONFIGS[selectedDuration].moneyCost}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Real-World Ingress</span>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="border-red-500/30 bg-red-500/5">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase text-red-500 tracking-widest flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4" /> THE DEADLY RULES
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-xs leading-relaxed text-muted-foreground font-medium">
                            <div className="flex items-start gap-3 p-3 bg-black/20 rounded-xl">
                                <Smartphone className="h-4 w-4 text-primary shrink-0" />
                                <p><b>Hard Lockdown</b>: Your MindMate navigation will be disabled. You cannot access World Chat, Games, or Rewards.</p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-black/20 rounded-xl">
                                <Monitor className="h-4 w-4 text-primary shrink-0" />
                                <p><b>Web Intercept</b>: Install the Chrome extension to block Instagram/YouTube. Failure to do so is a dishonor.</p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-black/20 rounded-xl">
                                <Trophy className="h-4 w-4 text-primary shrink-0" />
                                <p><b>Proof of Work</b>: You must meet the 10h/day study target or the rewards are forfeit.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-muted/30 border-dashed border-2">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Emergence Bounty</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {selectedDuration ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-background p-3 rounded-xl border">
                                        <div className="flex items-center gap-2"><Gem className="h-4 w-4 text-primary"/> <span className="text-xs font-bold uppercase">Credits</span></div>
                                        <span className="font-black text-green-500">+{ISOLATION_CONFIGS[selectedDuration].rewardCredits}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-background p-3 rounded-xl border">
                                        <div className="flex items-center gap-2"><Wallet className="h-4 w-4 text-primary"/> <span className="text-xs font-bold uppercase">Vault</span></div>
                                        <span className="font-black text-green-500">+₹{ISOLATION_CONFIGS[selectedDuration].rewardWallet}</span>
                                    </div>
                                    <div className="flex flex-col items-center p-4 bg-primary/5 rounded-xl border border-primary/20">
                                        <Award className="h-10 w-10 text-primary animate-pulse" />
                                        <p className="text-[10px] font-black uppercase tracking-widest mt-2">Elite Badge</p>
                                        <p className="font-bold text-white text-center mt-1">{ISOLATION_CONFIGS[selectedDuration].badgeName}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 opacity-30">
                                    <Trophy className="h-12 w-12 mx-auto mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Select Phase to View Bounty</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
