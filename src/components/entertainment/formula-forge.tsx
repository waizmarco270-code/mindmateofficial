'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, Trophy, Heart, Play, 
    RotateCcw, ShieldCheck, Gem, 
    ArrowLeft, Info, HelpCircle, 
    CheckCircle2, XCircle, History,
    Sparkles, ChevronRight, Loader2,
    ShieldAlert, AlertTriangle, 
    Atom, Variable, Sigma, FlaskConical,
    Search, Lightbulb, Beaker
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser, SignedOut } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LoginWall } from '../ui/login-wall';
import { Badge } from '@/components/ui/badge';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription, 
    DialogFooter 
} from '@/components/ui/dialog';

interface Formula {
    id: string;
    title: string;
    description: string;
    shards: string[]; // e.g. ["F", "=", "m", "a"]
    category: 'physics' | 'math' | 'chemistry';
}

const FORMULA_DATA: Formula[] = [
    // MATH
    { id: 'm1', title: 'Area of Circle', description: 'Fundamental geometry law.', shards: ['A', '=', 'π', 'r', '²'], category: 'math' },
    { id: 'm2', title: 'Pythagorean Theorem', description: 'Relationship in right triangles.', shards: ['a', '²', '+', 'b', '²', '=', 'c', '²'], category: 'math' },
    { id: 'm3', title: 'Quadratic Solution', description: 'Solving for roots of x.', shards: ['x', '=', '(', '-', 'b', '±', '√', '(', 'b', '²', '-', '4', 'a', 'c', ')', ')', '/', '(', '2', 'a', ')'], category: 'math' },
    { id: 'm4', title: 'Euler\'s Identity', description: 'The most beautiful equation.', shards: ['e', '^', '(', 'i', 'π', ')', '+', '1', '=', '0'], category: 'math' },
    
    // PHYSICS
    { id: 'p1', title: 'Newton\'s 2nd Law', description: 'Law of Force and Acceleration.', shards: ['F', '=', 'm', 'a'], category: 'physics' },
    { id: 'p2', title: 'Mass-Energy Equivalence', description: 'Einstein\'s breakthrough.', shards: ['E', '=', 'm', 'c', '²'], category: 'physics' },
    { id: 'p3', title: 'Universal Gravitation', description: 'Attractive force between masses.', shards: ['F', '=', 'G', 'm₁', 'm₂', '/', 'r', '²'], category: 'physics' },
    { id: 'p4', title: 'Schrödinger Equation', description: 'The heart of quantum mechanics.', shards: ['i', 'ℏ', '∂', 'ψ', '/', '∂', 't', '=', 'Ĥ', 'ψ'], category: 'physics' },
    { id: 'p5', title: 'Time Dilation', description: 'Relative time slowing.', shards: ['Δ', 't\'', '=', 'Δ', 't', '/', '√', '(', '1', '-', 'v', '²', '/', 'c', '²', ')'], category: 'physics' },
    
    // CHEMISTRY
    { id: 'c1', title: 'Ideal Gas Law', description: 'State of a hypothetical ideal gas.', shards: ['P', 'V', '=', 'n', 'R', 'T'], category: 'chemistry' },
    { id: 'c2', title: 'pH Calculation', description: 'Acidity of a solution.', shards: ['p', 'H', '=', '-', 'l', 'o', 'g', '[', 'H', '⁺', ']'], category: 'chemistry' },
    { id: 'c3', title: 'Gibbs Free Energy', description: 'Predicting spontaneity.', shards: ['Δ', 'G', '=', 'Δ', 'H', '-', 'T', 'Δ', 'S'], category: 'chemistry' },
];

const MAX_LIVES = 3;
const HINT_COST = 5;

export function FormulaForge() {
    const { user, isSignedIn } = useUser();
    const { currentUserData, updateGameHighScore, addCreditsToUser } = useUsers();
    const { toast } = useToast();

    const [gameState, setGameState] = useState<'selecting' | 'playing' | 'gameOver' | 'won'>('selecting');
    const [currentFormula, setCurrentFormula] = useState<Formula | null>(null);
    const [deck, setDeck] = useState<Formula[]>([]);
    const [shards, setShards] = useState<{ id: string, val: string }[]>([]);
    const [assembly, setAssembly] = useState<{ id: string, val: string }[]>([]);
    const [lives, setLives] = useState(MAX_LIVES);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(45);
    const [showGuide, setShowGuide] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (currentUserData?.gameHighScores?.formulaForge) {
            setHighScore(currentUserData.gameHighScores.formulaForge);
        }
    }, [currentUserData]);

    const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

    const setupMission = useCallback((category: 'physics' | 'math' | 'chemistry' | 'mixed') => {
        const pool = FORMULA_DATA.filter(f => category === 'mixed' ? true : f.category === category);
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        
        setDeck(shuffled);
        prepareFormula(shuffled[shuffled.length - 1]);
        setLives(MAX_LIVES);
        setScore(0);
        setGameState('playing');
    }, []);

    const prepareFormula = (formula: Formula) => {
        setCurrentFormula(formula);
        const jumbled = formula.shards.map((s, i) => ({ id: `shard-${i}-${Math.random()}`, val: s }))
            .sort(() => Math.random() - 0.5);
        setShards(jumbled);
        setAssembly([]);
        setTimeLeft(Math.max(15, 60 - score * 2)); // Faster timers as you progress
    };

    const handleShardClick = (shard: { id: string, val: string }) => {
        if (gameState !== 'playing' || !currentFormula) return;

        const nextExpectedIndex = assembly.length;
        const expectedVal = currentFormula.shards[nextExpectedIndex];

        if (shard.val === expectedVal) {
            // SUCCESSFUL FORGE
            const newAssembly = [...assembly, shard];
            setAssembly(newAssembly);
            setShards(prev => prev.filter(s => s.id !== shard.id));

            if (newAssembly.length === currentFormula.shards.length) {
                // FORMULA COMPLETE
                stopTimer();
                const newScore = score + 1;
                setScore(newScore);
                toast({ title: "CORE STABILIZED", description: `Structure verified: ${currentFormula.title}`, className: "bg-green-600 text-white" });
                
                const nextDeck = [...deck];
                nextDeck.pop();
                if (nextDeck.length === 0) {
                    setGameState('won');
                } else {
                    setDeck(nextDeck);
                    setTimeout(() => prepareFormula(nextDeck[nextDeck.length - 1]), 1000);
                }
            }
        } else {
            // BREACH
            const newLives = lives - 1;
            setLives(newLives);
            toast({ variant: 'destructive', title: "FORGE BREACH", description: `"${shard.val}" is structurally unsound at this sequence point.` });
            
            if (newLives <= 0) {
                stopTimer();
                setGameState('gameOver');
            }
        }
    };

    const handleHint = async () => {
        if (!user || !currentFormula || isProcessing) return;
        const hasMaster = currentUserData?.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();
        
        if (!hasMaster && currentUserData.credits < HINT_COST) {
            toast({ variant: 'destructive', title: "INSUFFICIENT CREDITS", description: "Securing a hint requires 5 Credits." });
            return;
        }

        setIsProcessing(true);
        try {
            if (!hasMaster) await addCreditsToUser(user.id, -HINT_COST);
            
            const nextVal = currentFormula.shards[assembly.length];
            const hintShard = shards.find(s => s.val === nextVal);
            
            if (hintShard) {
                // Briefly flash the correct shard
                const el = document.getElementById(hintShard.id);
                if (el) {
                    el.classList.add('ring-4', 'ring-yellow-400', 'animate-bounce');
                    setTimeout(() => el.classList.remove('ring-4', 'ring-yellow-400', 'animate-bounce'), 2000);
                }
                toast({ title: "NEURAL PULSE ACTIVE", description: `Target detected: "${nextVal}"` });
            }
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (gameState === 'playing' && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        stopTimer();
                        setLives(l => {
                            const nl = l - 1;
                            if (nl <= 0) setGameState('gameOver');
                            return nl;
                        });
                        toast({ variant: 'destructive', title: "CORE MELTDOWN", description: "Time limit exceeded. Reactor breached." });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return stopTimer;
    }, [gameState, currentFormula, toast]);

    const handleGameOver = () => {
        if (score > highScore) {
            setHighScore(score);
            if (user) updateGameHighScore(user.id, 'formulaForge', score);
        }
        setGameState('gameOver');
    };

    if (gameState === 'selecting') {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <header className="text-center space-y-4">
                    <div className="mx-auto w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center border-2 border-primary/20 shadow-[0_0_50px_rgba(139,92,246,0.2)]">
                        <Atom className="h-12 w-12 text-primary animate-spin-slow" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">The Formula Forge</h1>
                    <p className="text-slate-400 font-medium max-w-xl mx-auto text-lg leading-relaxed">The Core has fractured. Reassemble the fundamental laws of reality before total system collapse occurs.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    <SignedOut>
                        <LoginWall title="Initialize Reactor" description="Sign up to become a Sovereign Engineer and earn credits for law reassembly." />
                    </SignedOut>
                    <CategoryButton icon={Sigma} label="Logic Nexus" desc="Math & Geometry" color="border-blue-500/20" onClick={() => setupMission('math')} />
                    <CategoryButton icon={FlaskConical} label="Matter Core" desc="Atomic Chemistry" color="border-emerald-500/20" onClick={() => setupMission('chemistry')} />
                    <CategoryButton icon={Zap} label="Force Reactor" desc="Theoretical Physics" color="border-rose-500/20" onClick={() => setupMission('physics')} />
                </div>

                <div className="flex justify-center">
                    <Button variant="ghost" onClick={() => setShowGuide(true)} className="rounded-full text-slate-500 hover:text-white transition-colors">
                        <HelpCircle className="mr-2 h-4 w-4"/> View Operation Protocols
                    </Button>
                </div>

                <Dialog open={showGuide} onOpenChange={setShowGuide}>
                    <DialogContent className="max-w-lg bg-slate-950 border-primary/20 rounded-[2.5rem]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase italic text-white flex items-center gap-2"><Beaker className="text-primary"/> Operation Protocols</DialogTitle>
                        </DialogHeader>
                        <div className="py-6 space-y-4 text-sm text-slate-300 font-medium leading-relaxed">
                            <p>1. <b className="text-primary">The Directive</b>: A scientific law name will appear. You must identify its mathematical structure.</p>
                            <p>2. <b className="text-primary">Forge Input</b>: Click the scattered shards in the correct sequence to build the formula.</p>
                            <p>3. <b className="text-primary">Stabilization</b>: You must complete the assembly before the timer hits zero.</p>
                            <p>4. <b className="text-primary">Breach</b>: Wrong sequences or timeouts consume 1 Heart. 3 breaches ends the mission.</p>
                            <p>5. <b className="text-primary">Pulse Hint</b>: Stuck? Spend 5 Credits for a Neural Pulse to find the next shard.</p>
                        </div>
                        <DialogFooter>
                            <Button className="w-full h-12 font-black uppercase rounded-xl" onClick={() => setShowGuide(false)}>Authorized</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-40">
            <header className="flex flex-col sm:flex-row justify-between items-center bg-black/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/5 gap-6">
                <div className="flex items-center gap-6">
                    <Button variant="ghost" size="icon" onClick={() => setGameState('selecting')} className="rounded-full bg-white/5 hover:bg-white/10"><ArrowLeft/></Button>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Reactor Phase</p>
                        <h2 className="text-3xl font-black italic uppercase text-white tabular-nums">Level: {score}</h2>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mainframe Peak</p>
                        <p className="text-3xl font-black italic text-white tabular-nums">{highScore}</p>
                    </div>
                    <div className="flex gap-2">
                        {[...Array(MAX_LIVES)].map((_, i) => (
                            <motion.div key={i} animate={{ scale: i < lives ? 1 : 0.8, opacity: i < lives ? 1 : 0.1 }}>
                                <Heart className={cn("h-8 w-8 transition-all", i < lives ? "text-red-500 fill-red-500 drop-shadow-[0_0_10px_#ef4444]" : "text-white/10")} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {gameState === 'playing' && currentFormula && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                        {/* THE DIRECTIVE CARD */}
                        <div className="flex justify-center px-4">
                            <Card className="w-full max-w-2xl bg-slate-900 border-2 border-primary/30 shadow-[0_0_60px_rgba(139,92,246,0.1)] rounded-[3rem] overflow-hidden">
                                <CardHeader className="text-center p-8 pb-4 bg-primary/5">
                                    <Badge className="w-fit mx-auto mb-4 bg-primary/20 text-primary border-primary/30 uppercase font-black tracking-widest text-[9px]">{currentFormula.category} Protocol</Badge>
                                    <CardTitle className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow-sm">{currentFormula.title}</CardTitle>
                                    <CardDescription className="text-lg font-bold text-slate-400 mt-2">"{currentFormula.description}"</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="flex flex-wrap justify-center gap-2 sm:gap-4 min-h-[100px] p-6 rounded-[2.5rem] bg-black/40 border-2 border-dashed border-white/5 shadow-inner">
                                        <AnimatePresence>
                                            {assembly.map((shard, i) => (
                                                <motion.div 
                                                    key={shard.id}
                                                    initial={{ scale: 0, y: 20 }}
                                                    animate={{ scale: 1, y: 0 }}
                                                    className="h-12 sm:h-16 px-4 sm:px-6 rounded-2xl bg-primary text-white font-black text-2xl sm:text-4xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)] border-t-2 border-white/20"
                                                >
                                                    {shard.val}
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        {assembly.length === 0 && <p className="text-slate-700 font-black uppercase text-sm tracking-[0.4em] self-center">Dock Shards Below</p>}
                                    </div>

                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden shadow-inner">
                                            <motion.div 
                                                className={cn("h-full transition-all duration-1000", timeLeft <= 5 ? "bg-red-500" : "bg-primary")}
                                                initial={{ width: '100%' }}
                                                animate={{ width: `${(timeLeft / 45) * 100}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 font-mono font-black text-2xl tabular-nums">
                                            <Clock className={cn("h-6 w-6", timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-primary")} />
                                            <span className={timeLeft <= 5 ? "text-red-500" : "text-white"}>{formatTime(timeLeft)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* THE FORGE (SCATTERED SHARDS) */}
                        <div className="max-w-4xl mx-auto px-4">
                            <div className="flex flex-wrap justify-center gap-3 sm:gap-5">
                                <AnimatePresence>
                                    {shards.map((shard) => (
                                        <motion.button
                                            key={shard.id}
                                            id={shard.id}
                                            initial={{ scale: 0, rotate: -10 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleShardClick(shard)}
                                            className="h-16 sm:h-20 min-w-[64px] sm:min-w-[80px] px-4 sm:px-6 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-3xl sm:text-5xl font-black text-white shadow-lg transition-all"
                                        >
                                            {shard.val}
                                        </motion.button>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <Button variant="outline" onClick={handleHint} disabled={isProcessing} className="h-14 px-8 rounded-2xl border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-500 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl">
                                {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <Lightbulb className="mr-2 h-4 w-4"/>}
                                NEURAL PULSE (-5 CR)
                            </Button>
                        </div>
                    </motion.div>
                )}

                {gameState === 'gameOver' && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center space-y-8 px-4">
                        <div className="p-8 rounded-full bg-red-500/10 border-4 border-red-500 animate-pulse shadow-[0_0_50px_rgba(220,38,38,0.3)]">
                            <ShieldAlert className="h-20 w-20 text-red-600" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">CORE COLLAPSE</h2>
                            <p className="text-xl font-medium text-slate-400 uppercase tracking-widest">Protocol terminated at score {score}.</p>
                        </div>
                        <Button size="lg" className="h-16 px-12 rounded-2xl font-black text-xl italic bg-red-600 hover:bg-red-700 shadow-2xl" onClick={() => setGameState('selecting')}>RE-INITIALIZE REACTOR</Button>
                    </motion.div>
                )}

                {gameState === 'won' && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center space-y-8 px-4">
                        <div className="p-8 rounded-[3rem] bg-yellow-400/10 border-4 border-yellow-400 shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                            <Trophy className="h-24 w-24 text-yellow-400 animate-bounce" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">GRAND ARCHITECT</h2>
                            <p className="text-xl font-medium text-slate-400 uppercase tracking-widest">The universal mainframe is now stable.</p>
                        </div>
                        <div className="p-8 rounded-[2.5rem] bg-green-500/10 border-2 border-green-500/30">
                            <p className="text-xs font-black uppercase tracking-[0.4em] text-green-500 mb-2">Registry Record</p>
                            <p className="text-6xl font-black text-white italic tabular-nums">{score} PTS</p>
                        </div>
                        <Button size="lg" className="h-16 px-12 rounded-2xl font-black text-xl italic shadow-2xl shadow-primary/20" onClick={() => setGameState('selecting')}>CLAIM BOUNTY & EXIT</Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
            `}</style>
        </div>
    );
}

function CategoryButton({ icon: Icon, label, desc, color, onClick }: any) {
    return (
        <Card 
            className={cn("bg-black/40 border-2 cursor-pointer group hover:bg-primary/10 transition-all duration-500 rounded-[3rem] overflow-hidden", color)}
            onClick={onClick}
        >
            <CardContent className="p-10 flex flex-col items-center text-center gap-6 relative">
                <div className="absolute inset-0 bg-grid-white/5 opacity-5" />
                <div className="p-5 rounded-3xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform group-hover:border-primary/50 group-hover:bg-primary/20 shadow-xl relative z-10">
                    <Icon className="h-10 w-10 text-primary" />
                </div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">{label}</h3>
                    <p className="text-slate-500 font-medium text-sm mt-1">{desc}</p>
                </div>
                <Button variant="ghost" className="mt-4 font-black uppercase text-[10px] tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                    Initialize Protocol <ChevronRight className="ml-2 h-4 w-4"/>
                </Button>
            </CardContent>
        </Card>
    );
}

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
