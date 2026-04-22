'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, Trophy, Heart, Play, 
    RotateCcw, ShieldCheck, Zap, 
    ArrowLeft, Info, HelpCircle, 
    CheckCircle2, XCircle, Gem, 
    History, Rocket, Microscope, 
    Globe, ScrollText, Sparkles,
    ChevronRight, ChevronLeft, Loader2,
    Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser, SignedOut } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, startOfWeek } from 'date-fns';
import { LoginWall } from '../ui/login-wall';

interface TimelineEvent {
    id: string;
    title: string;
    year: number;
    description: string;
    category: 'science' | 'history' | 'mixed';
}

const CHRONOS_DATA: TimelineEvent[] = [
    // Science & Tech
    { id: 's1', title: 'Invention of the Wheel', year: -3500, description: 'The fundamental mechanical invention that changed transport forever.', category: 'science' },
    { id: 's2', title: 'Discovery of Gravity', year: 1687, description: 'Newton publishes Principia Mathematica, defining universal gravitation.', category: 'science' },
    { id: 's3', title: 'First Powered Flight', year: 1903, description: 'The Wright brothers successfully fly the first airplane.', category: 'science' },
    { id: 's4', title: 'Moon Landing', year: 1969, description: 'Neil Armstrong becomes the first human to walk on the moon.', category: 'science' },
    { id: 's5', title: 'First Modern Computer (ENIAC)', year: 1945, description: 'The first electronic general-purpose digital computer is completed.', category: 'science' },
    { id: 's6', title: 'Discovery of Penicillin', year: 1928, description: 'Alexander Fleming discovers the first true antibiotic.', category: 'science' },
    { id: 's7', title: 'Einstein\'s General Relativity', year: 1915, description: 'The theory of space-time and gravity is revolutionized.', category: 'science' },
    { id: 's8', title: 'Invention of the Internet (WWW)', year: 1989, description: 'Tim Berners-Lee proposes the World Wide Web.', category: 'science' },
    { id: 's9', title: 'Discovery of the Electron', year: 1897, description: 'J.J. Thomson identifies the first subatomic particle.', category: 'science' },
    { id: 's10', title: 'First Human DNA Sequenced', year: 2003, description: 'The Human Genome Project is declared complete.', category: 'science' },
    
    // History & Civilization
    { id: 'h1', title: 'French Revolution', year: 1789, description: 'The storming of the Bastille triggers the end of absolute monarchy.', category: 'history' },
    { id: 'h2', title: 'World War I Starts', year: 1914, description: 'Assassination of Archduke Franz Ferdinand triggers global conflict.', category: 'history' },
    { id: 'h3', title: 'Discovery of America', year: 1492, description: 'Christopher Columbus reaches the New World.', category: 'history' },
    { id: 'h4', title: 'Magna Carta Signed', year: 1215, description: 'The first document to limit the power of the English King.', category: 'history' },
    { id: 'h5', title: 'Fall of the Roman Empire', year: 476, description: 'The last Western Roman Emperor is deposed.', category: 'history' },
    { id: 'h6', title: 'Declaration of Independence', year: 1776, description: 'Thirteen American colonies declare independence from Britain.', category: 'history' },
    { id: 'h7', title: 'First Voyage of Vasco da Gama', year: 1497, description: 'Direct sea route from Europe to India is established.', category: 'history' },
    { id: 'h8', title: 'Start of the French Revolution', year: 1789, description: 'Political upheaval that reshaped modern history.', category: 'history' },
    { id: 'h9', title: 'World War II Ends', year: 1945, description: 'Surrender of Axis powers ends the deadliest conflict in history.', category: 'history' },
    { id: 'h10', title: 'Founding of the United Nations', year: 1945, description: 'International organization created to maintain peace.', category: 'history' },
    
    // Closer events for high difficulty
    { id: 'x1', title: 'Launching of Sputnik 1', year: 1957, description: 'The space age begins with the first artificial satellite.', category: 'mixed' },
    { id: 'x2', title: 'Berlin Wall Falls', year: 1989, description: 'The symbolic end of the Cold War and Iron Curtain.', category: 'mixed' },
    { id: 'x3', title: 'Napoleon Becomes Emperor', year: 1804, description: 'The rise of the French Empire.', category: 'mixed' },
    { id: 'x4', title: 'Industrial Revolution Starts', year: 1760, description: 'Transition to new manufacturing processes.', category: 'mixed' },
    { id: 'x5', title: 'Invention of the Printing Press', year: 1440, description: 'Gutenberg revolutionizes the spread of information.', category: 'mixed' },
];

const MILESTONE_REWARDS = { 5: 5, 10: 15, 15: 50, 20: 200 };
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
    const [claimedMilestones, setClaimedMilestones] = useState<number[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Initial High Score Sync
    useEffect(() => {
        if (currentUserData?.gameHighScores?.chronos) {
            setHighScore(currentUserData.gameHighScores.chronos);
        }
    }, [currentUserData]);

    const setupGame = useCallback((selectedCat: typeof category) => {
        const filteredPool = CHRONOS_DATA.filter(e => selectedCat === 'mixed' ? true : e.category === selectedCat);
        const shuffled = [...filteredPool].sort(() => Math.random() - 0.5);
        
        // Pick 1st event as anchor
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

        // Validation logic
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
                description: `${currentEvent.title} (${currentEvent.year}) placed correctly.`,
                className: "bg-green-500/10 border-green-500/50 text-green-700"
            });

            // Handle Rewards
            if (MILESTONE_REWARDS[newScore as keyof typeof MILESTONE_REWARDS]) {
                const reward = MILESTONE_REWARDS[newScore as keyof typeof MILESTONE_REWARDS];
                addCreditsToUser(user!.id, reward);
                toast({ title: "Bounty Claimed!", description: `+${reward} Credits for Tier ${newScore} mastery.` });
            }

            // Move to next or win
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
                description: `${currentEvent.title} actually occurred in ${currentEvent.year}.` 
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
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <header className="flex justify-between items-center bg-black/20 p-6 rounded-3xl border border-white/5">
                <div className="flex items-center gap-6">
                    <Button variant="ghost" size="icon" onClick={() => setGameState('selecting')} className="rounded-full">
                        <ArrowLeft className="h-6 w-6"/>
                    </Button>
                    <div>
                        <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Temporal Standing</p>
                        <h2 className="text-2xl font-black italic uppercase">Level: {score}</h2>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">High Score</p>
                        <p className="text-2xl font-black italic tabular-nums">{highScore}</p>
                    </div>
                    <div className="flex gap-1.5">
                        {[...Array(MAX_LIVES)].map((_, i) => (
                            <Heart key={i} className={cn("h-6 w-6 transition-all", i < lives ? "text-red-500 fill-red-500" : "text-white/10")} />
                        ))}
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {gameState === 'playing' && currentEvent && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                        {/* ACTIVE EVENT CARD */}
                        <div className="flex justify-center">
                            <motion.div layoutId={currentEvent.id} className="w-full max-w-md">
                                <Card className="bg-slate-900 border-2 border-primary/40 shadow-2xl shadow-primary/20 rounded-[2.5rem] overflow-hidden transform rotate-1">
                                    <CardHeader className="p-8 pb-4 bg-primary/5">
                                        <div className="flex justify-between items-center mb-2">
                                            <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest">{currentEvent.category}</Badge>
                                            <History className="h-5 w-5 text-primary/40" />
                                        </div>
                                        <CardTitle className="text-3xl font-black italic uppercase leading-none tracking-tighter text-white">{currentEvent.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-4">
                                        <p className="text-slate-400 font-medium leading-relaxed italic">"{currentEvent.description}"</p>
                                    </CardContent>
                                    <div className="h-1.5 w-full bg-primary/20">
                                        <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="h-full w-1/3 bg-primary shadow-[0_0_15px_#8b5cf6]" />
                                    </div>
                                </Card>
                            </motion.div>
                        </div>

                        {/* TIMELINE TRACK */}
                        <div className="relative pt-12 pb-24 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                            <div className="flex items-center gap-4 min-w-max px-20">
                                {/* BEFORE ALL PLACEMENT */}
                                <PlacementSpot onClick={() => handlePlacement(0)} />

                                {timeline.map((event, i) => (
                                    <div key={event.id} className="flex items-center gap-4">
                                        <motion.div 
                                            initial={{ scale: 0, opacity: 0 }} 
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="w-48 h-32 bg-white/5 border border-primary/20 rounded-2xl p-4 flex flex-col justify-center items-center text-center group hover:bg-primary/10 transition-colors"
                                        >
                                            <p className="text-xs font-black uppercase text-primary mb-1">{event.year < 0 ? `${Math.abs(event.year)} BC` : event.year}</p>
                                            <p className="text-sm font-bold text-white line-clamp-2 leading-tight uppercase tracking-tight">{event.title}</p>
                                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-2 opacity-50" />
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
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center space-y-8">
                        <div className="p-8 rounded-full bg-red-500/10 border-4 border-red-500 animate-pulse">
                            <ShieldAlert className="h-16 w-16 text-red-600" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">TEMPORAL COLLAPSE</h2>
                            <p className="text-xl font-medium text-slate-400">Your mission ends with a score of {score}.</p>
                        </div>
                        <Button size="lg" className="h-16 px-12 rounded-2xl font-black text-xl italic bg-red-600 hover:bg-red-700" onClick={() => setGameState('selecting')}>RE-INITIALIZE DRIVE</Button>
                    </motion.div>
                )}

                {gameState === 'won' && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center space-y-8">
                        <div className="p-8 rounded-[3rem] bg-yellow-400/10 border-4 border-yellow-400 shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                            <Trophy className="h-20 w-20 text-yellow-400 animate-bounce" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">CHRONOS MASTER</h2>
                            <p className="text-xl font-medium text-slate-400">The entire timeline has been synchronized.</p>
                        </div>
                        <Card className="bg-green-500/10 border-green-500/20 p-6 rounded-2xl">
                             <p className="text-sm font-black uppercase text-green-500 tracking-widest mb-1">Final Standing</p>
                             <p className="text-4xl font-black text-white italic">{score} Points Secured</p>
                        </Card>
                        <Button size="lg" className="h-16 px-12 rounded-2xl font-black text-xl italic" onClick={() => setGameState('selecting')}>CLAIM BOUNTY & EXIT</Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function CategoryCard({ icon: Icon, label, desc, onClick, color }: any) {
    return (
        <Card 
            className={cn("bg-black/40 border-2 cursor-pointer group hover:bg-primary/10 transition-all duration-500 rounded-[2.5rem] overflow-hidden", color)}
            onClick={onClick}
        >
            <CardContent className="p-10 flex flex-col items-center text-center gap-6">
                <div className="p-5 rounded-3xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform group-hover:border-primary/50">
                    <Icon className="h-10 w-10 text-primary" />
                </div>
                <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">{label}</h3>
                    <p className="text-slate-500 font-medium text-sm mt-1">{desc}</p>
                </div>
                <Button variant="ghost" className="mt-4 font-black uppercase text-[10px] tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity">
                    Initialize Protocol <ChevronRight className="ml-2 h-4 w-4"/>
                </Button>
            </CardContent>
        </Card>
    );
}

function PlacementSpot({ onClick }: { onClick: () => void }) {
    return (
        <motion.button 
            whileHover={{ scale: 1.2, backgroundColor: 'rgba(139, 92, 246, 0.4)' }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className="w-12 h-12 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center text-primary/40 hover:text-white transition-all bg-white/5"
        >
            <Plus className="h-6 w-6" />
        </motion.button>
    );
}

function Badge({ children, variant, className }: any) {
    return (
        <span className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-bold border",
            className
        )}>
            {children}
        </span>
    );
}
