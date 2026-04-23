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
    Ruler, Scale, Thermometer, Clock,
    Atom, Sigma, FlaskConical,
    Lightbulb, Beaker, Search,
    Maximize, Minimize, Box, 
    Settings, Plus, Minus, Check,
    BookOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser, SignedOut } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LoginWall } from '../ui/login-wall';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription, 
    DialogFooter 
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
    const { currentUserData, updateGameHighScore, addCreditsToUser } = useUsers();
    const { toast } = useToast();

    const [view, setView] = useState<'hub' | 'learning' | 'challenge' | 'gameOver' | 'won'>('hub');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentQty, setCurrentQty] = useState<PhysicalQuantity | null>(null);
    const [deck, setDeck] = useState<PhysicalQuantity[]>([]);
    
    // Constructor State
    const [components, setComponents] = useState<{ base: string, power: number }[]>([]);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [lives, setLives] = useState(MAX_LIVES);
    const [timeLeft, setTimeLeft] = useState(30);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (currentUserData?.gameHighScores?.unitDimensions) {
            setHighScore(currentUserData.gameHighScores.unitDimensions);
        }
    }, [currentUserData]);

    const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

    const startChallenge = useCallback(() => {
        const shuffled = [...QUANTITY_DATA].sort(() => Math.random() - 0.5);
        setDeck(shuffled);
        prepareQuestion(shuffled[shuffled.length - 1]);
        setScore(0);
        setLives(MAX_LIVES);
        setView('challenge');
    }, []);

    const prepareQuestion = (qty: PhysicalQuantity) => {
        setCurrentQty(qty);
        setComponents([]);
        setTimeLeft(Math.max(15, 45 - score)); 
        startTimer();
    };

    const startTimer = () => {
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
    };

    const handleBreach = (msg: string) => {
        const newLives = lives - 1;
        setLives(newLives);
        toast({ variant: 'destructive', title: "DIMENSIONAL FRACTURE", description: msg });
        
        if (newLives <= 0) {
            stopTimer();
            if (score > highScore) {
                setHighScore(score);
                if (user) updateGameHighScore(user.id, 'unitDimensions', score);
            }
            setView('gameOver');
        } else if (currentQty) {
            prepareQuestion(currentQty); // Restart same question
        }
    };

    const addComponent = (base: string) => {
        if (components.length >= 5) return;
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

    const validateConstruction = () => {
        if (!currentQty) return;

        // Special case for dimensionless
        if (currentQty.dimension === '') {
            if (components.length === 0) {
                handleSuccess();
            } else {
                handleBreach("Incorrect construction. This quantity is dimensionless.");
            }
            return;
        }

        // Parse built dimension into comparable string
        const sortedComponents = [...components]
            .filter(c => c.power !== 0)
            .sort((a, b) => DIMENSION_BASES.indexOf(a.base) - DIMENSION_BASES.indexOf(b.base));
        
        const builtStr = sortedComponents
            .map(c => `${c.base}^${c.power}`)
            .join(' ');

        if (builtStr === currentQty.dimension) {
            handleSuccess();
        } else {
            handleBreach(`Structural misalignment! Incorrect configuration.`);
        }
    };

    const handleSuccess = () => {
        stopTimer();
        const newScore = score + 1;
        setScore(newScore);
        toast({ title: "STRUCTURE SECURED", description: `Verified: ${currentQty?.name}`, className: "bg-green-600 text-white" });

        if (newScore % 10 === 0) {
            addCreditsToUser(user!.id, newScore);
            toast({ title: "Bounty Detected!", description: `+${newScore} Credits for Tier ${newScore / 10} mastery.` });
        }

        const nextDeck = [...deck];
        nextDeck.pop();
        if (nextDeck.length === 0) {
            setView('won');
        } else {
            setDeck(nextDeck);
            setTimeout(() => prepareQuestion(nextDeck[nextDeck.length - 1]), 1000);
        }
    };

    const filteredQuantities = useMemo(() => {
        return QUANTITY_DATA.filter(q => 
            q.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            q.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

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
                    {filteredQuantities.map((q, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.01 }}>
                            <Card className="bg-card/40 border-primary/5 hover:border-primary/20 transition-all group overflow-hidden">
                                <CardHeader className="p-4 bg-primary/5 border-b border-white/5">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest">{q.category}</Badge>
                                    </div>
                                    <CardTitle className="text-base font-bold text-foreground mt-2">{q.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 flex items-center justify-center bg-black/10">
                                    <p className="text-2xl font-black text-primary font-mono tracking-tighter italic">{q.display}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
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
                         <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center border-2 border-primary/40 font-black text-lg italic text-primary">
                            #{score + 1}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Reactor Stability</p>
                            <div className="flex gap-1.5 mt-1">
                                {[...Array(MAX_LIVES)].map((_, i) => (
                                    <Heart key={i} className={cn("h-5 w-5", i < lives ? "text-red-500 fill-red-500 drop-shadow-[0_0_8px_#ef4444]" : "text-white/10")} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Temporal Clock</p>
                            <p className={cn("text-3xl font-black italic tabular-nums", timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-white")}>
                                {timeLeft}s
                            </p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* QUANTITY MANIFEST */}
                    <div className="lg:col-span-4">
                        <Card className="bg-slate-900 border-2 border-primary/30 shadow-[0_0_60px_rgba(139,92,246,0.1)] rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="text-center p-8 bg-primary/5">
                                <Badge className="mx-auto mb-4 bg-primary/20 text-primary border-primary/30 uppercase font-black tracking-widest text-[9px]">Target Manifest</Badge>
                                <CardTitle className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">{currentQty.name}</CardTitle>
                                <CardDescription className="text-sm font-bold text-slate-400 mt-2">"{currentQty.category}"</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 text-center space-y-6">
                                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 border-dashed">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">Construction Zone</p>
                                    <div className="flex flex-wrap justify-center gap-3 min-h-[60px]">
                                        <AnimatePresence>
                                            {components.map((c, i) => (
                                                <motion.button 
                                                    key={i} 
                                                    initial={{ scale: 0, x: 20 }} 
                                                    animate={{ scale: 1, x: 0 }} 
                                                    exit={{ scale: 0, opacity: 0 }}
                                                    onClick={() => removeComponent(i)}
                                                    className="relative h-14 w-12 rounded-xl bg-primary text-white font-black text-xl flex items-center justify-center shadow-lg border-t border-white/30 group"
                                                >
                                                    {c.base}
                                                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-black text-[10px] flex items-center justify-center border border-white/20">{c.power}</span>
                                                    <div className="absolute inset-0 bg-red-600 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <X className="h-5 w-5" />
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </AnimatePresence>
                                        {components.length === 0 && <p className="text-slate-700 font-bold uppercase text-[10px] tracking-widest self-center">No units docked</p>}
                                    </div>
                                </div>
                                <Button onClick={validateConstruction} className="w-full h-16 rounded-2xl text-lg font-black uppercase italic shadow-2xl shadow-primary/20">
                                    VERIFY STRUCTURE <CheckCircle2 className="ml-2 h-6 w-6"/>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* LAB TERMINAL */}
                    <div className="lg:col-span-8">
                        <Card className="bg-card/30 backdrop-blur-xl border-white/5 rounded-[2.5rem] p-8 space-y-10">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Inject Base Dimensions</h4>
                                <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                                    {DIMENSION_BASES.map(base => (
                                        <Button 
                                            key={base} 
                                            variant="outline" 
                                            onClick={() => addComponent(base)}
                                            className="h-16 rounded-2xl border-white/5 bg-black/20 font-black text-xl hover:bg-primary/20 hover:border-primary/40 hover:text-primary"
                                        >
                                            {base}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Calibrate Powers</h4>
                                <div className="space-y-3">
                                    {components.map((c, i) => (
                                        <motion.div key={i} layout className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary border border-primary/20">{c.base}</div>
                                                <div className="text-center w-12">
                                                    <p className="text-[8px] font-black uppercase text-muted-foreground">Power</p>
                                                    <p className="text-xl font-black text-white italic">{c.power}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => adjustPower(i, -1)} className="rounded-xl h-10 w-10 bg-white/5 border border-white/5"><Minus className="h-4 w-4"/></Button>
                                                <Button size="icon" variant="ghost" onClick={() => adjustPower(i, 1)} className="rounded-xl h-10 w-10 bg-white/5 border border-white/5"><Plus className="h-4 w-4"/></Button>
                                                <Button size="icon" variant="ghost" onClick={() => removeComponent(i)} className="rounded-xl h-10 w-10 text-red-500 hover:bg-red-500/10"><Trash2 className="h-4 w-4"/></Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {components.length === 0 && (
                                        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem] opacity-20">
                                            <Box className="h-12 w-12 mx-auto mb-2" />
                                            <p className="text-xs font-black uppercase tracking-widest">Reactor Core Idle</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'gameOver') {
        return (
            <div className="flex items-center justify-center min-h-[70vh] p-4">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-xl">
                    <Card className="border-red-600/50 bg-red-950/20 backdrop-blur-3xl rounded-[3rem] text-center p-8 sm:p-12 shadow-2xl">
                        <div className="mx-auto w-24 h-24 bg-red-600/10 rounded-full border-4 border-red-600 flex items-center justify-center mb-8">
                            <ShieldAlert className="h-12 w-12 text-red-600 animate-pulse" />
                        </div>
                        <h2 className="text-4xl font-black text-red-600 uppercase italic tracking-tighter mb-4">DIMENSIONAL COLLAPSE</h2>
                        <p className="text-xl text-slate-200 font-bold mb-6 italic">Protocol terminated at Phase {score + 1}.</p>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Final Score</p>
                                <p className="text-2xl font-black text-white">{score}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Mainframe High</p>
                                <p className="text-2xl font-black text-primary">{highScore}</p>
                            </div>
                        </div>
                        <Button size="lg" className="w-full h-16 rounded-2xl font-black text-xl bg-red-600 hover:bg-red-700" onClick={() => setView('hub')}>RE-INITIALIZE HUB</Button>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-40 relative">
            <header className="text-center space-y-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto w-24 h-24 rounded-[2.5rem] bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-2xl backdrop-blur-md">
                    <Ruler className="h-12 w-12 text-primary" />
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">Units & Dimensions</h1>
                <p className="text-slate-400 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
                    Master the structural DNA of the universe. Decode and construct the dimensional identities of 100+ physical quantities.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto relative">
                <SignedOut>
                    <LoginWall title="Initialize Lab Ingress" description="Sign up to participate in the Dimensional War and earn credit bounties for structural mastery." />
                </SignedOut>
                
                <ProtocolCard 
                    icon={BookOpen} 
                    label="Learning Protocol" 
                    desc="Access the Global Registry of physical quantities and their dimensions."
                    color="text-emerald-400"
                    bg="bg-emerald-500/5"
                    onClick={() => setView('learning')}
                />
                
                <ProtocolCard 
                    icon={Zap} 
                    label="Challenge Protocol" 
                    desc="High-stakes dimensional construction against the temporal clock."
                    color="text-yellow-400"
                    bg="bg-yellow-500/5"
                    onClick={startChallenge}
                />
            </div>

            <div className="p-8 rounded-[3rem] bg-primary/5 border border-primary/20 text-center max-w-3xl mx-auto space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center justify-center gap-2">
                    <Info className="h-4 w-4"/> Manual Briefing
                </h4>
                <p className="text-slate-400 text-sm font-medium italic">
                    "Structural mastery of units and dimensions is required for any serious academic ascent. The Challenge Protocol rewards legends who can identify and build dimensions with surgical speed."
                </p>
            </div>
        </div>
    );
}

function ProtocolCard({ icon: Icon, label, desc, color, bg, onClick }: any) {
    return (
        <Card 
            className={cn("relative overflow-hidden cursor-pointer group hover:scale-[1.02] transition-all duration-500 rounded-[3rem] border-2 border-white/5", bg)}
            onClick={onClick}
        >
            <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
            <CardContent className="p-10 flex flex-col items-center text-center gap-6 relative z-10">
                <div className={cn("p-6 rounded-3xl bg-black/40 border border-white/10 group-hover:scale-110 transition-transform duration-500", color)}>
                    <Icon className="h-10 w-10" />
                </div>
                <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tight">{label}</h3>
                    <p className="text-slate-500 font-medium text-sm mt-2">{desc}</p>
                </div>
                <Button variant="ghost" className="mt-4 font-black uppercase text-[10px] tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Initialize Protocol <ArrowRight className="ml-2 h-4 w-4"/>
                </Button>
            </CardContent>
        </Card>
    );
}
