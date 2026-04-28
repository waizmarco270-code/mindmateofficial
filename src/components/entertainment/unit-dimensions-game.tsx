'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, Trophy, Heart, Play, 
    RotateCcw, ShieldCheck, Gem, 
    ArrowLeft, ArrowRight, Info, HelpCircle, 
    CheckCircle2, XCircle, History,
    Sparkles, ChevronRight, Loader2,
    ShieldAlert, AlertTriangle, 
    Ruler, Scale, Thermometer, Clock,
    Atom, Sigma, FlaskConical,
    Lightbulb, Beaker, Search,
    Maximize, Minimize, Box, 
    Settings, Plus, Minus, Check,
    BookOpen, Trash2, X, ShieldX,
    Target, Skull, Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser, SignedOut } from '@clerk/nextjs';
import { useUsers, useAdmin } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LoginWall } from '../ui/login-wall';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription, 
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';

interface PhysicalQuantity {
    name: string;
    dimension: string; // Internal standard: "M^1 L^1 T^-2"
    display: string;   // UI standard: "[M L T⁻²]"
    category: 'Mechanics' | 'Heat & Thermo' | 'Electromagnetism' | 'Optics' | 'Modern Physics' | 'General';
}

const QUANTITY_DATA: PhysicalQuantity[] = [
    // MECHANICS
    { name: 'Force', dimension: 'M^1 L^1 T^-2', display: '[M L T⁻²]', category: 'Mechanics' },
    { name: 'Work / Energy', dimension: 'M^1 L^2 T^-2', display: '[M L² T⁻²]', category: 'Mechanics' },
    { name: 'Power', dimension: 'M^1 L^2 T^-3', display: '[M L² T⁻³]', category: 'Mechanics' },
    { name: 'Linear Momentum', dimension: 'M^1 L^1 T^-1', display: '[M L T⁻¹]', category: 'Mechanics' },
    { name: 'Impulse', dimension: 'M^1 L^1 T^-1', display: '[M L T⁻¹]', category: 'Mechanics' },
    { name: 'Pressure / Stress', dimension: 'M^1 L^-1 T^-2', display: '[M L⁻¹ T⁻²]', category: 'Mechanics' },
    { name: 'Density', dimension: 'M^1 L^-3', display: '[M L⁻³]', category: 'Mechanics' },
    { name: 'Surface Tension', dimension: 'M^1 T^-2', display: '[M T⁻²]', category: 'Mechanics' },
    { name: 'Viscosity', dimension: 'M^1 L^-1 T^-1', display: '[M L⁻¹ T⁻¹]', category: 'Mechanics' },
    { name: 'Angular Momentum', dimension: 'M^1 L^2 T^-1', display: '[M L² T⁻¹]', category: 'Mechanics' },
    { name: 'Moment of Inertia', dimension: 'M^1 L^2', display: '[M L²]', category: 'Mechanics' },
    { name: 'Gravitational Constant', dimension: 'M^-1 L^3 T^-2', display: '[M⁻¹ L³ T⁻²]', category: 'Mechanics' },
    { name: 'Elasticity Modulus', dimension: 'M^1 L^-1 T^-2', display: '[M L⁻¹ T⁻²]', category: 'Mechanics' },
    { name: 'Surface Energy', dimension: 'M^1 T^-2', display: '[M T⁻²]', category: 'Mechanics' },
    { name: 'Thrust', dimension: 'M^1 L^1 T^-2', display: '[M L T⁻²]', category: 'Mechanics' },
    { name: 'Strain', dimension: '', display: '[M⁰ L⁰ T⁰]', category: 'Mechanics' },
    { name: 'Torque', dimension: 'M^1 L^2 T^-2', display: '[M L² T⁻²]', category: 'Mechanics' },
    { name: 'Velocity', dimension: 'L^1 T^-1', display: '[L T⁻¹]', category: 'Mechanics' },
    { name: 'Acceleration', dimension: 'L^1 T^-2', display: '[L T⁻²]', category: 'Mechanics' },
    { name: 'Angular Velocity', dimension: 'T^-1', display: '[T⁻¹]', category: 'Mechanics' },
    { name: 'Angular Acceleration', dimension: 'T^-2', display: '[T⁻²]', category: 'Mechanics' },
    { name: 'Wavelength', dimension: 'L^1', display: '[L]', category: 'Mechanics' },
    { name: 'Frequency', dimension: 'T^-1', display: '[T⁻¹]', category: 'Mechanics' },

    // ELECTROMAGNETISM
    { name: 'Electric Charge', dimension: 'T^1 A^1', display: '[T A]', category: 'Electromagnetism' },
    { name: 'Electric Potential / EMF', dimension: 'M^1 L^2 T^-3 A^-1', display: '[M L² T⁻³ A⁻¹]', category: 'Electromagnetism' },
    { name: 'Resistance', dimension: 'M^1 L^2 T^-3 A^-2', display: '[M L² T⁻³ A⁻²]', category: 'Electromagnetism' },
    { name: 'Capacitance', dimension: 'M^-1 L^-2 T^4 A^2', display: '[M⁻¹ L⁻² T⁴ A²]', category: 'Electromagnetism' },
    { name: 'Magnetic Field (B)', dimension: 'M^1 T^-2 A^-1', display: '[M T⁻² A⁻¹]', category: 'Electromagnetism' },
    { name: 'Magnetic Flux', dimension: 'M^1 L^2 T^-2 A^-1', display: '[M L² T⁻² A⁻¹]', category: 'Electromagnetism' },
    { name: 'Inductance', dimension: 'M^1 L^2 T^-2 A^-2', display: '[M L² T⁻² A⁻²]', category: 'Electromagnetism' },
    { name: 'Conductivity', dimension: 'M^-1 L^-3 T^3 A^2', display: '[M⁻¹ L⁻³ T³ A²]', category: 'Electromagnetism' },
    { name: 'Permittivity (ε₀)', dimension: 'M^-1 L^-3 T^4 A^2', display: '[M⁻¹ L⁻³ T⁴ A²]', category: 'Electromagnetism' },
    { name: 'Permeability (μ₀)', dimension: 'M^1 L^1 T^-2 A^-2', display: '[M L T⁻² A⁻²]', category: 'Electromagnetism' },
    { name: 'Electric Dipole Moment', dimension: 'L^1 T^1 A^1', display: '[L T A]', category: 'Electromagnetism' },
    { name: 'Current Density', dimension: 'L^-2 A^1', display: '[L⁻² A]', category: 'Electromagnetism' },
    { name: 'Reactance', dimension: 'M^1 L^2 T^-3 A^-2', display: '[M L² T⁻³ A⁻²]', category: 'Electromagnetism' },

    // HEAT & THERMO
    { name: 'Temperature', dimension: 'K^1', display: '[K]', category: 'Heat & Thermo' },
    { name: 'Heat Energy', dimension: 'M^1 L^2 T^-2', display: '[M L² T⁻²]', category: 'Heat & Thermo' },
    { name: 'Specific Heat Capacity', dimension: 'L^2 T^-2 K^-1', display: '[L² T⁻² K⁻¹]', category: 'Heat & Thermo' },
    { name: 'Latent Heat', dimension: 'L^2 T^-2', display: '[L² T⁻²]', category: 'Heat & Thermo' },
    { name: 'Thermal Conductivity', dimension: 'M^1 L^1 T^-3 K^-1', display: '[M L T⁻³ K⁻¹]', category: 'Heat & Thermo' },
    { name: 'Gas Constant (R)', dimension: 'M^1 L^2 T^-2 K^-1', display: '[M L² T⁻² K⁻¹]', category: 'Heat & Thermo' },
    { name: 'Boltzmann Constant (k)', dimension: 'M^1 L^2 T^-2 K^-1', display: '[M L² T⁻² K⁻¹]', category: 'Heat & Thermo' },
    { name: 'Stefan-Boltzmann Constant', dimension: 'M^1 T^-3 K^-4', display: '[M T⁻³ K⁻⁴]', category: 'Heat & Thermo' },
    { name: 'Wien\'s Constant', dimension: 'L^1 K^1', display: '[L K]', category: 'Heat & Thermo' },
    { name: 'Entropy', dimension: 'M^1 L^2 T^-2 K^-1', display: '[M L² T⁻² K⁻¹]', category: 'Heat & Thermo' },

    // MODERN PHYSICS
    { name: 'Planck\'s Constant (h)', dimension: 'M^1 L^2 T^-1', display: '[M L² T⁻¹]', category: 'Modern Physics' },
    { name: 'Rydberg Constant', dimension: 'L^-1', display: '[L⁻¹]', category: 'Modern Physics' },
    { name: 'Decay Constant', dimension: 'T^-1', display: '[T⁻¹]', category: 'Modern Physics' },
    { name: 'Half Life', dimension: 'T^1', display: '[T]', category: 'Modern Physics' },
    { name: 'Binding Energy', dimension: 'M^1 L^2 T^-2', display: '[M L² T⁻²]', category: 'Modern Physics' },

    // OPTICS
    { name: 'Power of Lens', dimension: 'L^-1', display: '[L⁻¹]', category: 'Optics' },
    { name: 'Refractive Index', dimension: '', display: '[M⁰ L⁰ T⁰]', category: 'Optics' },
    { name: 'Intensity of Light', dimension: 'M^1 T^-3', display: '[M T⁻³]', category: 'Optics' },
    { name: 'Luminous Flux', dimension: 'M^1 L^2 T^-3', display: '[M L² T⁻³]', category: 'Optics' },
];

const DIMENSION_BASES = ['M', 'L', 'T', 'A', 'K', 'mol', 'cd'];
const MAX_LIVES = 3;

export function UnitDimensionsGame() {
    const { user, isSignedIn } = useUser();
    const { currentUserData, updateGameHighScore, addCreditsToUser, claimUnitDimensionsMilestone } = useUsers();
    const { toast } = useToast();

    const [view, setView] = useState<'hub' | 'learning' | 'challenge' | 'gameOver' | 'won'>('hub');
    const [challengeMode, setChallengeMode] = useState<'easy' | 'hard'>('easy');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentQty, setCurrentQty] = useState<PhysicalQuantity | null>(null);
    const [deck, setDeck] = useState<PhysicalQuantity[]>([]);
    
    // Constructor State
    const [components, setComponents] = useState<{ base: string, power: number }[]>([]);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [lives, setLives] = useState(MAX_LIVES);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isCheatingDialogOpen, setIsCheatingDialogOpen] = useState(false);
    const [isClaiming, setIsClaiming] = useState<string | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimerRef = useRef<() => void>();

    // Sync High Score
    useEffect(() => {
        const scoreKey = challengeMode === 'easy' ? 'unitDimensionsEasy' : 'unitDimensionsHard';
        if (currentUserData?.gameHighScores?.[scoreKey]) {
            setHighScore(currentUserData.gameHighScores[scoreKey]!);
        } else {
            setHighScore(0);
        }
    }, [currentUserData, challengeMode]);

    // ANTI-CHEAT
    useEffect(() => {
        const handleVisibility = () => {
            if (view === 'challenge' && document.visibilityState === 'hidden') {
                stopTimer();
                setIsCheatingDialogOpen(true);
                setView('hub');
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [view]);

    const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

    const saveHighScore = useCallback(() => {
        const scoreKey = challengeMode === 'easy' ? 'unitDimensionsEasy' : 'unitDimensionsHard';
        if (score > highScore) {
            setHighScore(score);
            if (user) updateGameHighScore(user.id, scoreKey, score);
        }
    }, [score, highScore, user, challengeMode, updateGameHighScore]);

    const handleBreach = useCallback((msg: string) => {
        const newLives = lives - 1;
        setLives(newLives);
        toast({ variant: 'destructive', title: "DIMENSIONAL FRACTURE", description: msg });
        
        if (newLives <= 0) {
            stopTimer();
            saveHighScore();
            setView('gameOver');
        } else if (currentQty) {
            setTimeLeft(Math.max(15, 45 - score));
            setComponents([]);
            startTimerRef.current?.(); // Call via ref to avoid circularity
        }
    }, [lives, score, currentQty, toast, saveHighScore]);

    const startTimer = useCallback(() => {
        stopTimer();
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    stopTimer();
                    handleBreach("Temporal breach! Time limit exceeded.");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [handleBreach]);

    useEffect(() => {
        startTimerRef.current = startTimer;
    }, [startTimer]);

    const prepareQuestion = useCallback((qty: PhysicalQuantity) => {
        setCurrentQty(qty);
        setComponents([]);
        setTimeLeft(Math.max(15, 45 - score)); 
        startTimer();
    }, [score, startTimer]);

    const startChallenge = useCallback((mode: 'easy' | 'hard') => {
        let pool = [...QUANTITY_DATA];
        if (mode === 'hard') {
            pool = pool.sort(() => Math.random() - 0.5);
        } else {
            const order = ['Mechanics', 'Heat & Thermo', 'Electromagnetism', 'Optics', 'Modern Physics', 'General'];
            pool = pool.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
        }
        
        setDeck(pool);
        setChallengeMode(mode);
        setScore(0);
        setLives(MAX_LIVES);
        setView('challenge');
        prepareQuestion(pool[0]);
    }, [prepareQuestion]);

    const addComponent = (base: string) => {
        if (components.length >= 6) return;
        setComponents([...components, { base, power: 1 }]);
    };

    const removeComponent = (index: number) => {
        setComponents(components.filter((_, i) => i !== index));
    };

    const adjustPower = (index: number, delta: number) => {
        const newComps = [...components];
        newComps[index].power = Math.max(-4, Math.min(4, newComps[index].power + delta));
        setComponents(newComps);
    };

    const handleSuccess = useCallback(() => {
        stopTimer();
        const newScore = score + 1;
        setScore(newScore);
        toast({ title: "STRUCTURE SECURED", description: `Verified: ${currentQty?.name}`, className: "bg-green-600 text-white" });

        const nextIndex = deck.indexOf(currentQty!) + 1;
        if (nextIndex >= deck.length) {
            saveHighScore();
            setView('won');
        } else {
            prepareQuestion(deck[nextIndex]);
        }
    }, [score, currentQty, deck, toast, saveHighScore, prepareQuestion]);

    const validateConstruction = () => {
        if (!currentQty) return;

        const sortedComponents = [...components]
            .filter(c => c.power !== 0)
            .sort((a, b) => DIMENSION_BASES.indexOf(a.base) - DIMENSION_BASES.indexOf(b.base));
        
        const builtStr = sortedComponents
            .map(c => `${c.base}^${c.power}`)
            .join(' ');

        if (builtStr === currentQty.dimension) {
            handleSuccess();
        } else {
            handleBreach(`Structural misalignment detected.`);
        }
    };

    const handleClaim = async (milestoneKey: string, reward: number) => {
        if (!user || isClaiming) return;
        setIsClaiming(milestoneKey);
        try {
            await claimUnitDimensionsMilestone(user.id, milestoneKey, reward);
            toast({ title: "BOUNTY SECURED!", description: `+${reward} Credits added to your mainframe.` });
        } catch (e: any) {
            toast({ variant: 'destructive', title: "Claim Failed", description: e.message });
        } finally {
            setIsClaiming(null);
        }
    };

    useEffect(() => {
        if (view === 'challenge' && timeLeft > 0) {
            // Already handled by startTimer
        }
        return stopTimer;
    }, [view]);

    if (view === 'learning') {
        return (
            <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <Button variant="ghost" onClick={() => setView('hub')} className="rounded-full">
                        <ArrowLeft className="mr-2 h-4 w-4"/> Back to Hub
                    </Button>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Filter registry..." 
                            className="pl-9 bg-muted/30 border-primary/10 h-10 rounded-xl"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {QUANTITY_DATA.filter(q => q.name.toLowerCase().includes(searchTerm.toLowerCase())).map((q, i) => (
                        <Card key={i} className="bg-card/40 border-primary/5 hover:border-primary/20 transition-all group overflow-hidden">
                            <CardHeader className="p-4 bg-primary/5 border-b border-white/5">
                                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest">{q.category}</Badge>
                                <CardTitle className="text-base font-bold text-foreground mt-2">{q.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 flex items-center justify-center bg-black/10">
                                <p className="text-2xl font-black text-primary font-mono tracking-tighter italic">{q.display}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (view === 'challenge' && currentQty) {
        return (
            <div className="min-h-[80vh] flex flex-col space-y-8 max-w-5xl mx-auto pb-40">
                <header className="flex justify-between items-center bg-black/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-xl">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Reactor Stability</p>
                            <div className="flex gap-1.5 mt-1">
                                {[...Array(MAX_LIVES)].map((_, i) => (
                                    <Heart key={i} className={cn("h-5 w-5", i < lives ? "text-red-500 fill-red-500" : "text-white/10")} />
                                ))}
                            </div>
                        </div>
                        <Separator orientation="vertical" className="h-10 bg-white/10" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Forge</p>
                            <p className="text-2xl font-black italic text-white tabular-nums">{score}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mainframe Peak</p>
                        <p className="text-2xl font-black italic text-yellow-400 tabular-nums">{highScore}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Temporal Clock</p>
                        <p className={cn("text-3xl font-black italic tabular-nums", timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-white")}>{timeLeft}s</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-4">
                        <Card className="bg-slate-900 border-2 border-primary/30 rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="text-center p-8 bg-primary/5">
                                <Badge variant="outline" className="mx-auto mb-4 bg-primary/20 text-primary border-primary/30 uppercase font-black tracking-widest text-[9px]">Target Quantity</Badge>
                                <CardTitle className="text-4xl font-black italic uppercase tracking-tighter text-white">{currentQty.name}</CardTitle>
                                <CardDescription className="text-xs font-bold text-slate-400 mt-2">{currentQty.category}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6 text-center">
                                <div className="p-6 rounded-2xl bg-black/40 border-2 border-dashed border-white/5 shadow-inner min-h-[100px] flex flex-wrap justify-center gap-2">
                                    <AnimatePresence>
                                        {components.map((c, i) => (
                                            <motion.button key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }} onClick={() => removeComponent(i)} className="relative h-12 w-10 rounded-lg bg-primary text-white font-black text-sm flex items-center justify-center">
                                                {c.base}<sup>{c.power}</sup>
                                            </motion.button>
                                        ))}
                                    </AnimatePresence>
                                    {components.length === 0 && <p className="text-slate-700 font-bold uppercase text-[10px] tracking-widest self-center">Reactor Core Idle</p>}
                                </div>
                                <Button onClick={validateConstruction} className="w-full h-16 rounded-2xl text-lg font-black uppercase italic shadow-2xl">VERIFY STRUCTURE</Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-8">
                        <Card className="bg-card/30 backdrop-blur-xl border-white/5 rounded-[2.5rem] p-8 space-y-10">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Inject Base Dimensions</h4>
                                <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                                    {DIMENSION_BASES.map(base => (
                                        <Button key={base} variant="outline" onClick={() => addComponent(base)} className="h-14 rounded-xl font-black text-lg bg-black/20 hover:bg-primary/20">{base}</Button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Calibrate Powers</h4>
                                <div className="space-y-3">
                                    {components.map((c, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                                            <div className="flex items-center gap-4"><div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center font-black text-primary">{c.base}</div><p className="text-xl font-black text-white italic">P: {c.power}</p></div>
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => adjustPower(i, -1)} className="rounded-lg h-9 w-9 bg-white/5"><Minus/></Button>
                                                <Button size="icon" variant="ghost" onClick={() => adjustPower(i, 1)} className="rounded-lg h-9 w-9 bg-white/5"><Plus/></Button>
                                                <Button size="icon" variant="ghost" onClick={() => removeComponent(i)} className="rounded-lg h-9 w-9 text-red-500"><Trash2/></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-40 relative">
            <header className="text-center space-y-4">
                <div className="mx-auto w-24 h-24 rounded-[2.5rem] bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-2xl backdrop-blur-md">
                    <Ruler className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">Units & Dimensions</h1>
                <p className="text-slate-400 font-medium max-w-2xl mx-auto text-lg leading-relaxed">Master the structural DNA of the universe. Decode and construct the dimensional identities of 100+ physical quantities.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-6xl mx-auto px-4 relative z-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ProtocolCard 
                            icon={BookOpen} label="Learning" desc="Registry of 100+ physical quantities."
                            color="text-emerald-400" bg="bg-emerald-500/5" onClick={() => setView('learning')}
                        />
                        <ProtocolCard 
                            icon={Zap} label="Tactical (Easy)" desc="Ordered sequence. Build your path."
                            color="text-sky-400" bg="bg-sky-500/5" onClick={() => startChallenge('easy')}
                        />
                        <ProtocolCard 
                            icon={ShieldAlert} label="Sovereign (Hard)" desc="Absolute Randomness. Master level."
                            color="text-rose-400" bg="bg-rose-500/5" onClick={() => startChallenge('hard')}
                        />
                    </div>

                    <Card className="bg-slate-900/60 border-primary/10 rounded-[3rem] overflow-hidden">
                        <CardHeader className="p-8 border-b border-white/5">
                            <CardTitle className="text-2xl font-black uppercase italic flex items-center gap-3">
                                <Target className="text-primary"/> Milestone Roadmap
                            </CardTitle>
                            <CardDescription className="font-bold">Protocol: Proof of Mastery Bounties</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <MilestoneSection 
                                    title="Easy Mode Mastery"
                                    items={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(m => ({
                                        key: `easy-${m}`,
                                        label: `Registry Peak: ${m}`,
                                        reward: m * 5,
                                        isReached: (currentUserData?.gameHighScores?.unitDimensionsEasy || 0) >= m,
                                        isClaimed: currentUserData?.unitDimensionsMilestonesClaimed?.includes(`easy-${m}`)
                                    }))}
                                    onClaim={handleClaim}
                                    isClaiming={isClaiming}
                                />
                                <MilestoneSection 
                                    title="Hard Mode Sovereign"
                                    items={[
                                        { key: 'hard-50', label: 'Advanced Core (50)', reward: 2500, isReached: (currentUserData?.gameHighScores?.unitDimensionsHard || 0) >= 50, isClaimed: currentUserData?.unitDimensionsMilestonesClaimed?.includes('hard-50') },
                                        { key: 'hard-100', label: 'Sovereign Core (100)', reward: 5000, isReached: (currentUserData?.gameHighScores?.unitDimensionsHard || 0) >= 100, isClaimed: currentUserData?.unitDimensionsMilestonesClaimed?.includes('hard-100') }
                                    ]}
                                    onClaim={handleClaim}
                                    isClaiming={isClaiming}
                                    isLegendary
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-card/40 border-white/5 rounded-[2.5rem] p-8">
                        <CardHeader className="p-0 mb-6"><CardTitle className="text-xs font-black uppercase tracking-[0.4em] text-primary">Your Standings</CardTitle></CardHeader>
                        <div className="space-y-4">
                            <StandingItem label="Tactical Peak" val={currentUserData?.gameHighScores?.unitDimensionsEasy || 0} color="text-sky-400" />
                            <StandingItem label="Sovereign Peak" val={currentUserData?.gameHighScores?.unitDimensionsHard || 0} color="text-rose-400" />
                        </div>
                    </Card>

                    <Card className="border-red-500/20 bg-red-500/5 rounded-[2.5rem] p-8">
                        <div className="flex items-start gap-3">
                            <ShieldX className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-500/80 leading-relaxed italic">
                                "The Lab is monitored. Any tab-switching or focus loss will terminate the forge cycle immediately."
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            <Dialog open={isCheatingDialogOpen} onOpenChange={setIsCheatingDialogOpen}>
                <DialogContent className="border-red-600/50 bg-red-950/95 backdrop-blur-2xl rounded-[2.5rem]">
                    <DialogHeader>
                        <div className="flex justify-center mb-6"><div className="p-6 bg-red-600/20 rounded-full border-4 border-red-600 animate-pulse"><ShieldX className="h-16 w-16 text-red-600" /></div></div>
                        <DialogTitle className="text-center text-3xl font-black uppercase italic text-white tracking-tighter">PROTOCOL VIOLATED</DialogTitle>
                        <DialogDescription className="text-center text-lg font-bold text-red-200 mt-2">YOU WERE CAUGHT CHEATING!</DialogDescription>
                    </DialogHeader>
                    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4 text-sm text-slate-300">
                        <p className="font-bold text-red-400 uppercase tracking-widest text-center">Anti-Cheat Sentinel Report:</p>
                        <ul className="list-disc list-inside space-y-2"><li>Signal lost due to tab switching or backgrounding.</li><li>Session terminated immediately.</li><li>No rewards granted for corrupted cycles.</li></ul>
                        <p className="italic text-center text-xs opacity-60">"Legends win through focus, not through manipulation."</p>
                    </div>
                    <DialogFooter className="pt-4"><DialogClose asChild><Button className="w-full h-14 bg-white text-black font-black text-xl rounded-2xl hover:bg-slate-200">I UNDERSTAND</Button></DialogClose></DialogFooter>
                </DialogContent>
            </Dialog>

            {view === 'gameOver' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="max-w-md w-full">
                        <Card className="border-red-600/50 bg-slate-900 rounded-[3rem] p-8 text-center space-y-6">
                            <Skull className="h-16 w-16 text-red-600 mx-auto" />
                            <h2 className="text-4xl font-black italic uppercase text-white">MISSION FAILED</h2>
                            <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                                <p className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-1">Final Standing</p>
                                <p className="text-5xl font-black text-white">{score}</p>
                            </div>
                            <Button className="w-full h-16 rounded-2xl bg-red-600 font-black uppercase" onClick={() => setView('hub')}>RE-INITIALIZE HUB</Button>
                        </Card>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

function ProtocolCard({ icon: Icon, label, desc, color, bg, onClick }: any) {
    return (
        <Card className={cn("relative overflow-hidden cursor-pointer group hover:scale-[1.02] transition-all duration-500 rounded-[3rem] border-2 border-white/5", bg)} onClick={onClick}>
            <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
            <CardContent className="p-8 flex flex-col items-center text-center gap-4 relative z-10">
                <div className={cn("p-4 rounded-2xl bg-black/40 border border-white/10 group-hover:scale-110 transition-transform duration-500", color)}><Icon className="h-8 w-8" /></div>
                <div><h3 className="text-xl font-black uppercase italic tracking-tight">{label}</h3><p className="text-slate-500 font-medium text-[10px] mt-1">{desc}</p></div>
            </CardContent>
        </Card>
    );
}

function StandingItem({ label, val, color }: any) {
    return (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 group hover:border-primary/20 transition-all">
            <p className="text-[10px] font-black uppercase text-muted-foreground group-hover:text-white transition-colors">{label}</p>
            <p className={cn("text-2xl font-black italic", color)}>{val}</p>
        </div>
    );
}

function MilestoneSection({ title, items, onClaim, isClaiming, isLegendary = false }: any) {
    return (
        <div className="space-y-4">
            <h4 className={cn("text-[10px] font-black uppercase tracking-[0.3em] mb-4", isLegendary ? "text-yellow-400" : "text-primary")}>{title}</h4>
            <div className="grid gap-2">
                {items.map((item: any) => (
                    <div key={item.key} className={cn(
                        "flex items-center justify-between p-3 rounded-2xl border transition-all",
                        item.isClaimed ? "bg-green-500/5 border-green-500/20 opacity-60" : 
                        item.isReached ? "bg-primary/10 border-primary/40 shadow-lg" : "bg-black/20 border-white/5"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "h-8 w-8 rounded-xl flex items-center justify-center border",
                                item.isReached ? "bg-primary/20 border-primary/30" : "bg-muted border-white/5"
                            )}>
                                {item.isClaimed ? <CheckCircle2 className="h-4 w-4 text-green-500"/> : 
                                 item.isReached ? <Sparkles className="h-4 w-4 text-primary animate-pulse"/> : 
                                 <Lock className="h-4 w-4 text-muted-foreground opacity-40"/>}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-tight">{item.label}</p>
                                <p className="text-[9px] font-bold text-emerald-500">+{item.reward} Credits</p>
                            </div>
                        </div>
                        {item.isReached && !item.isClaimed ? (
                            <Button 
                                size="sm" 
                                className="h-8 rounded-lg font-black uppercase text-[8px] tracking-widest bg-emerald-500 hover:bg-emerald-600"
                                onClick={() => onClaim(item.key, item.reward)}
                                disabled={isClaiming === item.key}
                            >
                                {isClaiming === item.key ? <Loader2 className="h-3 w-3 animate-spin"/> : "Claim Bounty"}
                            </Button>
                        ) : item.isClaimed ? (
                            <div className="text-[8px] font-black uppercase text-green-500 flex items-center gap-1"><Check className="h-3 w-3"/> Secured</div>
                        ) : (
                            <div className="text-[8px] font-black uppercase text-muted-foreground opacity-40">Locked</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
