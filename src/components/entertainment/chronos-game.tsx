'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
    Clock, Trophy, Heart, Play, 
    RotateCcw, ShieldCheck, Zap, 
    ArrowLeft, Info, HelpCircle, 
    CheckCircle2, XCircle, Gem, 
    History, Rocket, Microscope, 
    Globe, ScrollText, Sparkles,
    ChevronRight, ChevronLeft, Loader2,
    Plus, ShieldAlert, AlertTriangle, 
    ArrowUp, Hand, GripVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser, SignedOut } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LoginWall } from '../ui/login-wall';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimelineEvent {
    id: string;
    title: string;
    year: number;
    description: string;
    category: 'science' | 'history' | 'mixed';
}

const CHRONOS_DATA: TimelineEvent[] = [
    // Science & Tech
    { id: 's1', title: 'Invention of the Wheel', year: -3500, description: 'Fundamental mechanical invention.', category: 'science' },
    { id: 's2', title: 'Discovery of Gravity', year: 1687, description: 'Newton publishes Principia Mathematica.', category: 'science' },
    { id: 's3', title: 'First Powered Flight', year: 1903, description: 'Wright brothers take to the sky.', category: 'science' },
    { id: 's4', title: 'Moon Landing', year: 1969, description: 'One small step for man...', category: 'science' },
    { id: 's5', title: 'First Modern Computer', year: 1945, description: 'ENIAC is completed.', category: 'science' },
    { id: 's6', title: 'Discovery of Penicillin', year: 1928, description: 'Fleming finds the first antibiotic.', category: 'science' },
    { id: 's7', title: 'General Relativity', year: 1915, description: 'Einstein changes physics.', category: 'science' },
    { id: 's8', title: 'Invention of WWW', year: 1989, description: 'Tim Berners-Lee proposes the Web.', category: 'science' },
    { id: 's9', title: 'Discovery of Electron', year: 1897, description: 'J.J. Thomson identifies the particle.', category: 'science' },
    { id: 's10', title: 'Human DNA Sequenced', year: 2003, description: 'Human Genome Project completed.', category: 'science' },
    { id: 's11', title: 'Periodic Table Created', year: 1869, description: 'Mendeleev organizes elements.', category: 'science' },
    { id: 's12', title: 'Polio Vaccine', year: 1955, description: 'Jonas Salk saves millions.', category: 'science' },
    { id: 's13', title: 'Steam Engine (Watt)', year: 1776, description: 'Powering the industrial age.', category: 'science' },
    { id: 's14', title: 'Telstar 1 Launched', year: 1962, description: 'First active communication satellite.', category: 'science' },
    { id: 's15', title: 'Large Hadron Collider', year: 2008, description: 'Higgs Boson search begins.', category: 'science' },
    
    // History
    { id: 'h1', title: 'French Revolution', year: 1789, description: 'Storming of the Bastille.', category: 'history' },
    { id: 'h2', title: 'World War I Starts', year: 1914, description: 'Archduke Ferdinand assassinated.', category: 'history' },
    { id: 'h3', title: 'Discovery of America', year: 1492, description: 'Columbus reaches the New World.', category: 'history' },
    { id: 'h4', title: 'Magna Carta', year: 1215, description: 'Limits on royal power.', category: 'history' },
    { id: 'h5', title: 'Fall of Roman Empire', year: 476, description: 'Last Western Emperor deposed.', category: 'history' },
    { id: 'h6', title: 'Declaration of Independence', year: 1776, description: 'US colonies split from Britain.', category: 'history' },
    { id: 'h7', title: 'Vasco da Gama in India', year: 1498, description: 'Direct sea route to the East.', category: 'history' },
    { id: 'h8', title: 'World War II Ends', year: 1945, description: 'Surrender of Axis powers.', category: 'history' },
    { id: 'h9', title: 'Founding of the UN', year: 1945, description: 'Global peace effort.', category: 'history' },
    { id: 'h10', title: 'Fall of Berlin Wall', year: 1989, description: 'End of the Cold War symbol.', category: 'history' },
    { id: 'h11', title: 'Black Death Pandemic', year: 1347, description: 'Plague sweeps through Europe.', category: 'history' },
    { id: 'h12', title: 'Assassination of Caesar', year: -44, description: 'Et tu, Brute?', category: 'history' },
    { id: 'h13', title: 'Signing of Treaty of Versailles', year: 1919, description: 'Formal end to WWI.', category: 'history' },
    { id: 'h14', title: 'Industrial Revolution Starts', year: 1760, description: 'New manufacturing processes.', category: 'history' },
    { id: 'h15', title: 'Nelson Mandela Released', year: 1990, description: 'End of Apartheid begins.', category: 'history' },

    // Mixed
    { id: 'x1', title: 'Sputnik 1', year: 1957, description: 'Space age begins.', category: 'mixed' },
    { id: 'x2', title: 'Napoleon Becomes Emperor', year: 1804, description: 'The peak of French power.', category: 'mixed' },
    { id: 'x3', title: 'Printing Press', year: 1440, description: 'Information revolution.', category: 'mixed' },
    { id: 'x4', title: 'Russian Revolution', year: 1917, description: 'Rise of the Soviet Union.', category: 'mixed' },
    { id: 'x5', title: 'Start of the Crusades', year: 1096, description: 'Religious wars in the Levant.', category: 'mixed' },
];

const MILESTONE_REWARDS: Record<number, number> = { 5: 5, 10: 15, 15: 50, 20: 200 };
const MAX_LIVES = 3;

export function ChronosGame() {
    const { user, isSignedIn } = useUser();
    const { currentUserData, updateGameHighScore, addCreditsToUser } = useUsers();
    const { toast } = useToast();

    const [gameState, setGameState] = useState<'selecting' | 'playing' | 'gameOver' | 'won'>('selecting');
    const [category, setCategory] = useState<'science' | 'history' | 'mixed'>('mixed');
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
    const [eventPool, setEventPool] = useState<TimelineEvent[]>([]);
    const [currentEvent, setCurrentEvent] = useState<TimelineEvent | null>(null);
    const [lives, setLives] = useState(MAX_LIVES);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [showGuide, setShowGuide] = useState(false);

    // High Score Sync
    useEffect(() => {
        if (currentUserData?.gameHighScores?.chronos) {
            setHighScore(currentUserData.gameHighScores.chronos);
        }
    }, [currentUserData]);

    const setupGame = useCallback((selectedCat: typeof category) => {
        const filteredPool = CHRONOS_DATA.filter(e => selectedCat === 'mixed' ? true : e.category === selectedCat);
        const shuffled = [...filteredPool].sort(() => Math.random() - 0.5);
        
        const anchor = shuffled.pop()!;
        setTimeline([anchor]);
        setEventPool(shuffled);
        setCurrentEvent(shuffled[shuffled.length - 1]);
        setLives(MAX_LIVES);
        setScore(0);
        setCategory(selectedCat);
        setGameState('playing');
    }, []);

    const handlePlacement = (index: number) => {
        if (!currentEvent || gameState !== 'playing') return;

        const before = timeline[index - 1];
        const after = timeline[index];

        const isCorrect = (!before || currentEvent.year >= before.year) && 
                          (!after || currentEvent.year <= after.year);

        if (isCorrect) {
            const newTimeline = [...timeline];
            newTimeline.splice(index, 0, currentEvent);
            setTimeline(newTimeline);
            
            const newScore = score + 1;
            setScore(newScore);
            
            toast({ 
                title: "TIMELINE SYNCED", 
                description: `${currentEvent.title} (${currentEvent.year < 0 ? `${Math.abs(currentEvent.year)} BC` : currentEvent.year}) placed correctly.`,
                className: "bg-green-500/10 border-green-500/50 text-green-700"
            });

            if (MILESTONE_REWARDS[newScore]) {
                const reward = MILESTONE_REWARDS[newScore];
                addCreditsToUser(user!.id, reward);
                toast({ title: "Bounty Claimed!", description: `+${reward} Credits for Tier ${newScore} mastery.` });
            }

            const nextPool = [...eventPool];
            nextPool.pop();
            if (nextPool.length === 0) {
                setGameState('won');
                if (newScore > highScore) {
                    setHighScore(newScore);
                    if (user) updateGameHighScore(user.id, 'chronos', newScore);
                }
            } else {
                setEventPool(nextPool);
                setCurrentEvent(nextPool[nextPool.length - 1]);
            }
        } else {
            const newLives = lives - 1;
            setLives(newLives);
            toast({ 
                variant: 'destructive', 
                title: "TEMPORAL BREACH", 
                description: `${currentEvent.title} actually occurred in ${currentEvent.year < 0 ? `${Math.abs(currentEvent.year)} BC` : currentEvent.year}.` 
            });

            if (newLives <= 0) {
                setGameState('gameOver');
                if (score > highScore) {
                    setHighScore(score);
                    if (user) updateGameHighScore(user.id, 'chronos', score);
                }
            }
        }
    };

    if (gameState === 'selecting') {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <header className="text-center space-y-4">
                    <div className="mx-auto w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center border-2 border-primary/20 shadow-2xl">
                        <History className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">Chronos: Timeline War</h1>
                    <p className="text-slate-400 font-medium max-w-lg mx-auto">Master the temporal flow. Place legendary events in their correct historical order to claim the Sovereign Bounty.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    <SignedOut>
                        <LoginWall title="Unlock the Timeline" description="Sign up to participate in the Timeline War and earn credits for historical mastery." />
                    </SignedOut>
                    <CategoryCard icon={Microscope} label="Science Nexus" desc="Discoveries and Inventions" onClick={() => setupGame('science')} color="border-emerald-500/30" />
                    <CategoryCard icon={Globe} label="Imperial History" desc="World Wars and Empires" onClick={() => setupGame('history')} color="border-blue-500/30" />
                    <CategoryCard icon={Zap} label="Multi-versal" desc="The Complete Tapestry" onClick={() => setupGame('mixed')} color="border-purple-500/30" />
                </div>

                <div className="flex justify-center pt-8">
                    <Button variant="ghost" onClick={() => setShowGuide(true)} className="rounded-full text-muted-foreground hover:text-primary">
                        <HelpCircle className="mr-2 h-4 w-4"/> How to Play Protocol
                    </Button>
                </div>

                <Dialog open={showGuide} onOpenChange={setShowGuide}>
                    <DialogContent className="max-w-lg bg-background/95 backdrop-blur-2xl border-primary/20">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase italic flex items-center gap-2">
                                <HelpCircle className="text-primary"/> Operational Manual
                            </DialogTitle>
                            <DialogDescription className="font-bold">Protocol: Sequential Temporal Alignment</DialogDescription>
                        </DialogHeader>
                        <div className="py-6 space-y-4 text-sm font-medium leading-relaxed">
                            <p>1. <b className="text-primary">The Deck</b>: An "Active Event" card appears at the top. This is the moment in time you must place.</p>
                            <p>2. <b className="text-primary">The Timeline</b>: A row of "Synced Events" grows below. Place your active card into the correct slot.</p>
                            <p>3. <b className="text-primary">Logic</b>: If you think an event happened *between* two others, click the <Plus className="inline h-3 w-3"/> sign in that gap.</p>
                            <p>4. <b className="text-primary">Failure</b>: Incorrect placement triggers a <b className="text-red-500">Temporal Breach</b> (lose 1 heart). 3 breaches ends the mission.</p>
                            <p>5. <b className="text-primary">Bounty</b>: Reach milestones (5, 10, 15, 20) to earn legendary credit injections instantly.</p>
                        </div>
                        <DialogFooter>
                            <Button className="w-full h-12 font-black uppercase" onClick={() => setShowGuide(false)}>Briefing Acknowledged</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <header className="flex flex-col sm:flex-row justify-between items-center bg-black/20 p-6 rounded-3xl border border-white/5 gap-4">
                <div className="flex items-center gap-6">
                    <Button variant="ghost" size="icon" onClick={() => setGameState('selecting')} className="rounded-full shrink-0">
                        <ArrowLeft className="h-6 w-6"/>
                    </Button>
                    <div>
                        <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Temporal Standing</p>
                        <h2 className="text-2xl font-black italic uppercase leading-none mt-1">Level: {score}</h2>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">High Score</p>
                        <p className="text-2xl font-black italic tabular-nums text-white">{highScore}</p>
                    </div>
                    <div className="flex gap-2">
                        {[...Array(MAX_LIVES)].map((_, i) => (
                            <motion.div key={i} initial={false} animate={{ scale: i < lives ? 1 : 0.8, opacity: i < lives ? 1 : 0.2 }}>
                                <Heart className={cn("h-7 w-7 transition-all", i < lives ? "text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "text-white/10")} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {gameState === 'playing' && currentEvent && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                        {/* ACTIVE EVENT CARD */}
                        <div className="flex justify-center">
                            <motion.div layoutId={currentEvent.id} className="w-full max-w-md px-4">
                                <Card className="bg-slate-900 border-2 border-primary/40 shadow-2xl shadow-primary/20 rounded-[2.5rem] overflow-hidden transform rotate-1">
                                    <div className="absolute top-0 right-0 p-4"><Sparkles className="text-primary/20 h-8 w-8 animate-pulse"/></div>
                                    <CardHeader className="p-8 pb-4 bg-primary/5">
                                        <div className="flex justify-between items-center mb-2">
                                            <Badge className="bg-primary/20 text-primary border-primary/30 font-black text-[9px] uppercase tracking-widest">{currentEvent.category}</Badge>
                                            <History className="h-5 w-5 text-primary/40" />
                                        </div>
                                        <CardTitle className="text-3xl font-black italic uppercase leading-none tracking-tighter text-white">{currentEvent.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-6">
                                        <p className="text-slate-400 font-medium leading-relaxed italic text-lg">"{currentEvent.description}"</p>
                                    </CardContent>
                                    <div className="h-2 w-full bg-primary/10">
                                        <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} className="h-full w-1/4 bg-primary shadow-[0_0_15px_#8b5cf6]" />
                                    </div>
                                </Card>
                            </motion.div>
                        </div>

                        {/* TIMELINE TRACK */}
                        <div className="relative pt-12 pb-24 group">
                             <div className="flex items-center gap-4 min-w-max px-20 relative overflow-x-auto pb-8 [&::-webkit-scrollbar]:hidden">
                                <PlacementSpot onClick={() => handlePlacement(0)} />

                                {timeline.map((event, i) => (
                                    <div key={event.id} className="flex items-center gap-4">
                                        <motion.div 
                                            initial={{ scale: 0, opacity: 0 }} 
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="w-56 h-36 bg-white/5 backdrop-blur-md border border-primary/20 rounded-[2rem] p-6 flex flex-col justify-center items-center text-center group/card hover:bg-primary/10 transition-colors shadow-lg"
                                        >
                                            <p className="text-xs font-black uppercase text-primary mb-2 bg-primary/10 px-3 py-1 rounded-full">{event.year < 0 ? `${Math.abs(event.year)} BC` : event.year}</p>
                                            <p className="text-sm font-black text-white line-clamp-2 leading-tight uppercase tracking-tight italic">"{event.title}"</p>
                                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-3 opacity-40 group-hover/card:opacity-100 transition-opacity" />
                                        </motion.div>
                                        <PlacementSpot onClick={() => handlePlacement(i + 1)} />
                                    </div>
                                ))}
                            </div>
                            <div className="absolute top-28 left-0 right-0 h-1 bg-white/5 -z-10" />
                        </div>
                    </motion.div>
                )}

                {gameState === 'gameOver' && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center space-y-8 px-4">
                        <div className="p-8 rounded-full bg-red-500/10 border-4 border-red-500 animate-pulse">
                            <ShieldAlert className="h-16 w-16 text-red-600" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">TEMPORAL COLLAPSE</h2>
                            <p className="text-xl font-medium text-slate-400">Your mission ends with a score of {score}.</p>
                        </div>
                        <Card className="bg-red-500/10 border-red-500/20 p-6 rounded-[2rem] max-w-sm w-full">
                             <p className="text-xs font-black uppercase text-red-500 tracking-widest mb-1">Status Report</p>
                             <p className="text-lg font-bold text-white leading-tight italic">Discipline protocol violated. Temporal displacement detected.</p>
                        </Card>
                        <Button size="lg" className="h-16 px-12 rounded-2xl font-black text-xl italic bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20" onClick={() => setGameState('selecting')}>RE-INITIALIZE DRIVE</Button>
                    </motion.div>
                )}

                {gameState === 'won' && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center space-y-8 px-4">
                        <div className="p-8 rounded-[3rem] bg-yellow-400/10 border-4 border-yellow-400 shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                            <Trophy className="h-20 w-20 text-yellow-400 animate-bounce" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">CHRONOS MASTER</h2>
                            <p className="text-xl font-medium text-slate-400">The entire timeline has been synchronized.</p>
                        </div>
                        <Card className="bg-green-500/10 border-green-500/20 p-8 rounded-[2.5rem] shadow-xl shadow-green-500/5">
                             <p className="text-sm font-black uppercase text-green-500 tracking-widest mb-2">Final Standing</p>
                             <p className="text-5xl font-black text-white italic tabular-nums">{score} PTS</p>
                        </Card>
                        <Button size="lg" className="h-16 px-12 rounded-2xl font-black text-xl italic shadow-2xl shadow-primary/20" onClick={() => setGameState('selecting')}>CLAIM BOUNTY & EXIT</Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function CategoryCard({ icon: Icon, label, desc, onClick, color }: any) {
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

function PlacementSpot({ onClick }: { onClick: () => void }) {
    return (
        <motion.button 
            whileHover={{ scale: 1.2, backgroundColor: 'rgba(139, 92, 246, 0.4)', borderColor: '#8b5cf6' }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className="w-14 h-14 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center text-primary/40 hover:text-white transition-all bg-white/5 shadow-inner"
        >
            <Plus className="h-8 w-8" />
        </motion.button>
    );
}

