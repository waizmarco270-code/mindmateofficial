
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, ArrowLeft, Play, RotateCcw, Trophy, 
    CheckCircle, XCircle, Gem, Clock, 
    ShieldCheck, ChevronRight, Square, 
    Cuboid, History, Info, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';

interface RootMasterProps {
    onBack: () => void;
}

const REWARD = 10;

export function RootMaster({ onBack }: RootMasterProps) {
    const { addCreditsToUser } = useAdmin();
    const { toast } = useToast();
    
    const [view, setView] = useState<'selecting' | 'learning' | 'challenge' | 'result'>('selecting');
    const [mode, setMode] = useState<'square' | 'cube'>('square');
    
    // Challenge State
    const [questions, setQuestions] = useState<{ base: number, power: number, answer: number }[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(45);
    const [isProcessing, setIsProcessing] = useState(false);

    const generateChallenge = useCallback((type: 'square' | 'cube') => {
        const max = type === 'square' ? 30 : 25;
        const p = type === 'square' ? 2 : 3;
        const pool = Array.from({ length: 12 }).map(() => {
            const base = Math.floor(Math.random() * max) + 1;
            return { base, power: p, answer: Math.pow(base, p) };
        });
        setQuestions(pool);
        setCurrentIndex(0);
        setScore(0);
        setUserInput('');
        setTimeLeft(45);
        setMode(type);
        setView('challenge');
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (view === 'challenge' && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (view === 'challenge' && timeLeft === 0) {
            setView('result');
        }
        return () => clearInterval(interval);
    }, [view, timeLeft]);

    const handleAnswer = (e: React.FormEvent) => {
        e.preventDefault();
        const current = questions[currentIndex];

        if (parseInt(userInput) === current.answer) {
            setScore(s => s + 1);
        }

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(i => i + 1);
            setUserInput('');
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        setView('result');
        if (score >= 11) {
            setIsProcessing(true);
            await addCreditsToUser(REWARD);
            toast({ title: "ASCENSION DETECTED!", description: `+${REWARD} Credits awarded for Root Forge mastery.` });
            setIsProcessing(false);
        }
    };

    if (view === 'learning') {
        const range = mode === 'square' ? 30 : 25;
        const p = mode === 'square' ? 2 : 3;
        return (
            <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
                <header className="flex justify-between items-center">
                    <Button variant="ghost" onClick={() => setView('selecting')} className="rounded-full">
                        <ArrowLeft className="mr-2 h-4 w-4"/> Back to Forge
                    </Button>
                    <div className="flex gap-2 p-1 bg-muted/50 rounded-xl border">
                        <Button size="sm" variant={mode === 'square' ? 'default' : 'ghost'} className="rounded-lg font-black uppercase text-[10px]" onClick={() => setMode('square')}>Squares</Button>
                        <Button size="sm" variant={mode === 'cube' ? 'default' : 'ghost'} className="rounded-lg font-black uppercase text-[10px]" onClick={() => setMode('cube')}>Cubes</Button>
                    </div>
                </header>
                <Card className="bg-slate-900 border-2 border-yellow-500/30 rounded-[3rem] overflow-hidden">
                    <CardHeader className="text-center p-8 bg-yellow-500/5">
                        <CardTitle className="text-4xl font-black italic uppercase text-white tracking-tighter">{mode === 'square' ? 'Square' : 'Cube'} Atlas</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <ScrollArea className="h-96">
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pr-4">
                                {Array.from({ length: range }).map((_, i) => {
                                    const num = i + 1;
                                    return (
                                        <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center hover:border-yellow-500/50 transition-all">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase">{num}{p === 2 ? '²' : '³'}</p>
                                            <p className="text-2xl font-black text-white italic">{Math.pow(num, p)}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="p-8 bg-yellow-500/5 justify-center">
                        <Button size="lg" className="h-16 px-12 rounded-2xl font-black uppercase bg-yellow-400 hover:bg-yellow-500 text-black shadow-xl" onClick={() => generateChallenge(mode)}>
                            START CHALLENGE <Zap className="ml-2 h-6 w-6"/>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (view === 'challenge') {
        const current = questions[currentIndex];
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
                <header className="w-full max-w-md flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
                    <div className="flex gap-2">
                        {Array.from({ length: questions.length }).map((_, i) => (
                            <div key={i} className={cn("h-1.5 w-4 rounded-full transition-all", i <= currentIndex ? "bg-yellow-400" : "bg-white/10")} />
                        ))}
                    </div>
                    <div className="flex items-center gap-2 font-black text-xl tabular-nums">
                        <Clock className={cn("h-5 w-5", timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-yellow-400")} />
                        <span className={timeLeft <= 10 ? "text-red-500" : "text-white"}>{timeLeft}s</span>
                    </div>
                </header>

                <motion.div 
                    key={currentIndex}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-xl"
                >
                    <Card className="bg-slate-900 border-2 border-yellow-500/30 rounded-[3rem] overflow-hidden shadow-2xl">
                        <CardContent className="p-12 space-y-12 text-center">
                            <div className="relative">
                                <span className="text-9xl font-black text-white italic tracking-tighter">{current.base}</span>
                                <span className="absolute -top-4 ml-2 text-4xl font-black text-yellow-400">{current.power}</span>
                            </div>
                            <form onSubmit={handleAnswer} className="space-y-6">
                                <Input 
                                    autoFocus
                                    type="number"
                                    value={userInput}
                                    onChange={e => setUserInput(e.target.value)}
                                    placeholder="?"
                                    className="h-24 text-6xl font-black text-center border-none bg-black/40 text-yellow-400 placeholder:text-yellow-900 rounded-3xl"
                                />
                                <Button type="submit" className="w-full h-16 rounded-2xl font-black text-xl italic uppercase bg-yellow-400 hover:bg-yellow-500 text-black">CALIBRATE POWER</Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    if (view === 'result') {
        const perfect = score === questions.length;
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
                    <Card className={cn("border-2 rounded-[3rem] text-center p-10 overflow-hidden relative", perfect ? "border-yellow-400/50 bg-yellow-400/5" : "border-white/10 bg-slate-900")}>
                        {perfect && <div className="absolute inset-0 golden-legend-bg opacity-20 -z-10" />}
                        <div className="mx-auto w-24 h-24 rounded-full bg-black/40 flex items-center justify-center mb-6">
                            {perfect ? <Sparkles className="h-12 w-12 text-yellow-400 animate-pulse" /> : <ShieldCheck className="h-12 w-12 text-yellow-400" />}
                        </div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">FORGE CYCLE ENDED</h2>
                        <div className="my-8 space-y-2">
                            <p className="text-7xl font-black text-white italic tracking-tighter">{score} <span className="text-2xl text-muted-foreground">/ {questions.length}</span></p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Calculated Fidelity</p>
                        </div>
                        <div className="space-y-3">
                            {perfect && (
                                <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 font-bold uppercase text-xs">
                                    Sovereign Reward Claimed: +10 CR
                                </div>
                            )}
                            <Button className="w-full h-14 rounded-2xl font-black uppercase bg-yellow-400 hover:bg-yellow-500 text-black" onClick={() => setView('selecting')}>RETURN TO NEXUS</Button>
                            <Button variant="ghost" className="w-full text-slate-400" onClick={() => generateChallenge(mode)}>RE-INITIALIZE FORGE</Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-6">
                    <Button variant="outline" size="icon" onClick={onBack} className="rounded-full border-white/10">
                        <ArrowLeft className="h-4 w-4"/>
                    </Button>
                    <div>
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">Power & Root Forge</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400">Protocol: Rapid Escalation</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <Card 
                    className="bg-black/40 border-yellow-500/20 cursor-pointer group hover:bg-yellow-500/10 transition-all rounded-[3rem] overflow-hidden"
                    onClick={() => { setMode('square'); setView('learning'); }}
                >
                    <CardContent className="p-12 flex flex-col items-center gap-6 text-center">
                        <div className="p-6 rounded-3xl bg-yellow-500/10 text-yellow-400 group-hover:scale-110 transition-transform">
                            <Square className="h-12 w-12" />
                        </div>
                        <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">Square Forge</h3>
                        <p className="text-slate-400 font-medium text-sm leading-relaxed">Master squares from 1 to 30. Optimize your mental processing speed.</p>
                    </CardContent>
                </Card>

                <Card 
                    className="bg-black/40 border-yellow-500/20 cursor-pointer group hover:bg-yellow-500/10 transition-all rounded-[3rem] overflow-hidden"
                    onClick={() => { setMode('cube'); setView('learning'); }}
                >
                    <CardContent className="p-12 flex flex-col items-center gap-6 text-center">
                        <div className="p-6 rounded-3xl bg-yellow-500/10 text-yellow-400 group-hover:scale-110 transition-transform">
                            <Cuboid className="h-12 w-12" />
                        </div>
                        <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">Cube Forge</h3>
                        <p className="text-slate-400 font-medium text-sm leading-relaxed">Master cubes from 1 to 25. Conquer the third-dimensional scale.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
