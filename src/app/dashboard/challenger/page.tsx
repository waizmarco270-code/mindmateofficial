
'use client';

import { useState } from 'react';
import { useChallenges, CHALLENGE_CONFIGS, type ActiveChallenge } from '@/hooks/use-challenges';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Swords, Trophy, Clock, Heart, 
    ShieldAlert, Zap, Loader2, Play, 
    ArrowRight, Sparkles, AlertTriangle, X,
    Skull, Gem, Flame, Medal, Award,
    CheckCircle
} from 'lucide-react';
import { useAdmin } from '@/hooks/use-admin';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChallengerPage } from '@/components/challenger/challenger-page';
import { motion } from 'framer-motion';
import { badgeMeta } from '@/components/leaderboard/shared/badge-renderer';
import { Badge } from '@/components/ui/badge';

export default function ChallengerHub() {
    const { activeChallenge, loading, startChallenge, performCheckIn, failChallenge, resetChallenge } = useChallenges();
    const { currentUserData } = useAdmin();
    
    const [selectedConfig, setSelectedConfig] = useState<typeof CHALLENGE_CONFIGS[0] | null>(null);
    const [checkInTime, setCheckInTime] = useState('05:00');
    const [lifelines, setLifelines] = useState(0);
    const [isInitializing, setIsInitializing] = useState(false);

    if (loading) return (
        <div className="flex h-full w-full items-center justify-center p-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );

    if (activeChallenge) {
        return <ChallengerPage config={activeChallenge} />;
    }

    const handleStart = async () => {
        if (!selectedConfig) return;
        setIsInitializing(true);
        try {
            await startChallenge(selectedConfig.id, checkInTime, lifelines);
        } finally {
            setIsInitializing(false);
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            <div className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center border-2 border-primary/20 shadow-2xl">
                    <Swords className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent uppercase italic">
                    CHALLENGER ZONE
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                    Protocol: High-Stakes Discipline. Free entry. Lethal penalties. Legendary rewards.
                </p>
            </div>

            {!selectedConfig ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {CHALLENGE_CONFIGS.map((config) => (
                        <Card key={config.id} className="relative overflow-hidden group hover:border-primary/40 transition-all duration-500 bg-slate-900/40 backdrop-blur-xl rounded-[3rem] border-2 border-white/5">
                            <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                            <CardHeader className="p-8 pb-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                        <Trophy className={cn("h-8 w-8", config.duration === 21 ? "text-yellow-400" : "text-slate-300")} />
                                    </div>
                                    <Badge className={cn("text-white font-black uppercase tracking-widest text-[10px]", config.tagColor)}>{config.tag}</Badge>
                                </div>
                                <CardTitle className="text-3xl font-black italic uppercase tracking-tight">{config.title}</CardTitle>
                                <CardDescription className="text-base text-slate-400 font-medium">{config.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/20">
                                        <p className="text-[10px] font-black uppercase text-green-500/60 tracking-widest mb-1">Bounty</p>
                                        <p className="text-2xl font-black text-white">+{config.reward} CR</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
                                        <p className="text-[10px] font-black uppercase text-red-500/60 tracking-widest mb-1">Penalty</p>
                                        <p className="text-2xl font-black text-white">-{config.penalty} CR</p>
                                    </div>
                                </div>
                                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 flex flex-col items-center text-center gap-3">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Asset Reward</p>
                                    <div className="scale-125">{badgeMeta[config.badgeToUnlock as any]?.badge}</div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-8 pt-0">
                                <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-xl" onClick={() => setSelectedConfig(config)}>
                                    SELECT PROTOCOL <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card className="max-w-2xl mx-auto border-primary/20 bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                        <CardHeader className="p-8 sm:p-12 border-b border-white/5 bg-white/5">
                            <Button variant="ghost" size="sm" className="w-fit mb-6 text-slate-400 hover:text-white" onClick={() => setSelectedConfig(null)}>
                                <X className="mr-2 h-4 w-4"/> ABORT SELECTION
                            </Button>
                            <CardTitle className="text-4xl font-black italic uppercase text-primary tracking-tighter">Configure Mission: {selectedConfig.title}</CardTitle>
                            <CardDescription className="text-lg font-medium text-slate-300">Set your daily check-in hour and secure lifelines.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 sm:p-12 space-y-8">
                            <div className="space-y-4">
                                <Label className="text-xs font-black uppercase tracking-widest text-primary">Tactical Check-in Time</Label>
                                <Input 
                                    type="time" 
                                    value={checkInTime} 
                                    onChange={e => setCheckInTime(e.target.value)} 
                                    className="h-16 text-4xl font-black text-center bg-black/40 border-primary/20 rounded-2xl"
                                />
                                <p className="text-xs text-muted-foreground italic text-center">"The relay window opens 10 minutes prior to this hour daily."</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-black uppercase tracking-widest text-primary">Mission Lifelines (Max 3)</Label>
                                    <span className="text-[10px] font-black uppercase text-amber-500">300 CR / Unit</span>
                                </div>
                                <div className="flex gap-4">
                                    {[0, 1, 2, 3].map(val => (
                                        <Button 
                                            key={val} 
                                            variant={lifelines === val ? 'default' : 'outline'} 
                                            className="flex-1 h-14 rounded-2xl text-lg font-black border-white/10"
                                            onClick={() => setLifelines(val)}
                                        >
                                            {val === 0 ? 'None' : <><Heart className={cn("mr-1 h-4 w-4 fill-current", lifelines === val ? "text-white" : "text-red-500")} /> {val}</>}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/20">
                                <h4 className="flex items-center gap-2 text-red-500 font-black uppercase text-xs tracking-widest mb-3">
                                    <ShieldAlert className="h-4 w-4" /> SOVEREIGN RULES
                                </h4>
                                <ul className="space-y-3 text-xs font-medium text-slate-300 leading-relaxed">
                                    <li className="flex items-start gap-2"><div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" /> <span>You must tap "TRANSMIT PRESENCE" within the 10-minute window daily.</span></li>
                                    <li className="flex items-start gap-2"><div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" /> <span>Missing the window consumes 1 Lifeline. If 0 lifelines, mission fails immediately.</span></li>
                                    <li className="flex items-start gap-2"><div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" /> <span>Failure executes a <b className="text-red-500">-{selectedConfig.penalty} Credit</b> penalty from the mainframe.</span></li>
                                </ul>
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 sm:p-12 pt-0">
                            <Button 
                                className="w-full h-16 rounded-2xl font-black text-xl shadow-2xl shadow-primary/20 group"
                                onClick={handleStart}
                                disabled={isInitializing}
                            >
                                {isInitializing ? <Loader2 className="animate-spin mr-2"/> : <Zap className="mr-2 fill-current"/>}
                                INITIALIZE MISSION <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
