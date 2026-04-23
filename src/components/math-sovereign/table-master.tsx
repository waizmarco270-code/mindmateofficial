'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Table as TableIcon, ArrowLeft, Play, 
    RotateCcw, Trophy, CheckCircle, XCircle,
    Zap, Gem, Clock, ShieldCheck, ChevronRight,
    Star, Info, Sparkles, Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';

interface TableMasterProps {
    onBack: () => void;
}

export function TableMaster({ onBack }: TableMasterProps) {
    const { user } = useUser();
    const { addCreditsToUser, currentUserData, markTableAsMastered } = useAdmin();
    const { toast } = useToast();
    
    const [view, setView] = useState<'selecting' | 'learning' | 'challenge' | 'result'>('selecting');
    const [selectedTable, setSelectedTable] = useState(2);
    
    // Challenge State
    const [questions, setQuestions] = useState<{ a: number, b: number }[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isProcessing, setIsProcessing] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const generateChallenge = useCallback((table: number) => {
        const pool = Array.from({ length: 10 }).map((_, i) => ({ a: table, b: i + 1 }));
        setQuestions(pool.sort(() => Math.random() - 0.5));
        setCurrentIndex(0);
        setScore(0);
        setUserInput('');
        setTimeLeft(30);
        setView('challenge');
    }, []);

    const handleComplete = useCallback(async (finalScore: number) => {
        stopTimer();
        setView('result');
        const perfect = finalScore === 10;
        const alreadyMastered = currentUserData?.masteredTables?.includes(selectedTable);

        if (perfect && !alreadyMastered && user) {
            setIsProcessing(true);
            try {
                // Reward based on table number (e.g. Table 11 = 11 Credits)
                await markTableAsMastered(user.id, selectedTable, selectedTable);
                toast({ 
                    title: "MASTERY VERIFIED", 
                    description: `+${selectedTable} Credits secured for Table ${selectedTable}.`,
                    className: "bg-green-500 text-white font-black"
                });
            } catch (e: any) {
                console.error("Mastery failed", e);
            } finally {
                setIsProcessing(false);
            }
        }
    }, [selectedTable, currentUserData, user, markTableAsMastered, toast]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (view === 'challenge' && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
            timerRef.current = interval;
        } else if (view === 'challenge' && timeLeft === 0) {
            handleComplete(score);
        }
        return () => clearInterval(interval);
    }, [view, timeLeft, score, handleComplete]);

    const handleAnswer = (e: React.FormEvent) => {
        e.preventDefault();
        const current = questions[currentIndex];
        const correct = current.a * current.b;
        
        let newScore = score;
        if (parseInt(userInput) === correct) {
            newScore = score + 1;
            setScore(newScore);
        }

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(i => i + 1);
            setUserInput('');
        } else {
            handleComplete(newScore);
        }
    };

    if (view === 'learning') {
        return (
            <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
                <Button variant="ghost" onClick={() => setView('selecting')} className="rounded-full">
                    <ArrowLeft className="mr-2 h-4 w-4"/> Back to Matrix
                </Button>
                <Card className="bg-slate-900 border-2 border-blue-500/30 rounded-[3rem] overflow-hidden">
                    <CardHeader className="text-center p-8 bg-blue-500/5">
                        <CardTitle className="text-4xl font-black italic uppercase text-white tracking-tighter">Table {selectedTable} Training</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <motion.div 
                                key={i}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center group hover:border-blue-500/50 transition-all"
                            >
                                <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">{selectedTable} × {i + 1}</p>
                                <p className="text-3xl font-black text-white italic">{selectedTable * (i + 1)}</p>
                            </motion.div>
                        ))}
                    </CardContent>
                    <CardFooter className="p-8 bg-blue-500/5 justify-center">
                        <Button size="lg" className="h-14 px-10 rounded-2xl font-black uppercase bg-blue-600 hover:bg-blue-700 shadow-xl" onClick={() => generateChallenge(selectedTable)}>
                            INITIALIZE STRIKE <Zap className="ml-2 h-5 w-5"/>
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
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className={cn("h-1.5 w-6 rounded-full transition-all", i <= currentIndex ? "bg-blue-500" : "bg-white/10")} />
                        ))}
                    </div>
                    <div className="flex items-center gap-2 font-black text-xl tabular-nums">
                        <Clock className={cn("h-5 w-5", timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-blue-400")} />
                        <span className={timeLeft <= 5 ? "text-red-500" : "text-white"}>{timeLeft}s</span>
                    </div>
                </header>

                <motion.div 
                    key={currentIndex}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="w-full max-w-xl"
                >
                    <Card className="bg-slate-900 border-2 border-blue-500/30 rounded-[3rem] overflow-hidden shadow-2xl">
                        <CardContent className="p-12 space-y-12 text-center">
                            <div className="flex items-center justify-center gap-8">
                                <span className="text-7xl font-black text-white italic">{current.a}</span>
                                <span className="text-4xl font-black text-blue-500">×</span>
                                <span className="text-7xl font-black text-white italic">{current.b}</span>
                                <span className="text-4xl font-black text-blue-500">=</span>
                            </div>
                            <form onSubmit={handleAnswer} className="space-y-6">
                                <Input 
                                    autoFocus
                                    type="number"
                                    value={userInput}
                                    onChange={e => setUserInput(e.target.value)}
                                    placeholder="?"
                                    className="h-24 text-6xl font-black text-center border-none bg-black/40 text-blue-400 placeholder:text-yellow-900 rounded-3xl"
                                />
                                <Button type="submit" className="w-full h-16 rounded-2xl font-black text-xl italic uppercase">COMMIT RESULT</Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    if (view === 'result') {
        const perfect = score === 10;
        const alreadyMastered = currentUserData?.masteredTables?.includes(selectedTable);

        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
                    <Card className={cn("border-2 rounded-[3rem] text-center p-10 overflow-hidden relative", perfect ? "border-yellow-400/50 bg-yellow-400/5" : "border-white/10 bg-slate-900")}>
                        {perfect && <div className="absolute inset-0 golden-legend-bg opacity-20 -z-10" />}
                        <div className="mx-auto w-24 h-24 rounded-full bg-black/40 flex items-center justify-center mb-6">
                            {perfect ? <Trophy className="h-12 w-12 text-yellow-400 animate-bounce" /> : <CheckCircle className="h-12 w-12 text-blue-500" />}
                        </div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">CALIBRATION COMPLETE</h2>
                        <div className="my-8 space-y-2">
                            <p className="text-7xl font-black text-white italic tracking-tighter">{score} <span className="text-2xl text-muted-foreground">/ 10</span></p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accuracy standing</p>
                        </div>
                        <div className="space-y-3">
                            {perfect && !alreadyMastered && (
                                <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-500 font-bold uppercase text-xs">
                                    Mainframe Bounty Secured: +{selectedTable} CR
                                </div>
                            )}
                            {perfect && alreadyMastered && (
                                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-500 font-bold uppercase text-xs">
                                    Mastery Verified (Registry already updated)
                                </div>
                            )}
                            <Button className="w-full h-14 rounded-2xl font-black uppercase" onClick={() => setView('selecting')}>RETURN TO MATRIX</Button>
                            <Button variant="ghost" className="w-full text-slate-400" onClick={() => generateChallenge(selectedTable)}>RE-INITIALIZE STRIKE</Button>
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
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">The Table Matrix</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Protocol: Multiplication Mastery</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 19 }).map((_, i) => {
                    const table = i + 2;
                    const isMastered = currentUserData?.masteredTables?.includes(table);
                    return (
                        <Card 
                            key={table} 
                            className={cn(
                                "bg-black/40 border-white/5 hover:border-blue-500/40 cursor-pointer group transition-all rounded-[2rem] overflow-hidden relative",
                                isMastered && "border-green-500/30 bg-green-500/5"
                            )}
                            onClick={() => { setSelectedTable(table); setView('learning'); }}
                        >
                            {isMastered && (
                                <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg">
                                    <Check className="h-4 w-4" strokeWidth={4} />
                                </div>
                            )}
                            <CardContent className="p-8 flex flex-col items-center gap-4">
                                <div className={cn(
                                    "p-3 rounded-2xl transition-transform group-hover:scale-110",
                                    isMastered ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-400"
                                )}>
                                    <TableIcon className="h-6 w-6" />
                                </div>
                                <h3 className="text-3xl font-black text-white italic">T-{table}</h3>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-blue-400">
                                    {isMastered ? 'Mastered' : 'Initialize'}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}