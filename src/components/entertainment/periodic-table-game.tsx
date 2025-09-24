
'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignedOut } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LoginWall } from '../ui/login-wall';
import { Atom, Award, Brain, Check, Clock, Heart, Loader2, Play, RotateCw, X, ArrowLeft } from 'lucide-react';
import periodicTableData from '@/app/lib/periodic-table-data.json';
import Link from 'next/link';

interface Element {
    atomicNumber: number;
    symbol: string;
    name: string;
    group: number;
    period: number;
    block: 's' | 'p' | 'd' | 'f';
    category: string;
}

const allElements = periodicTableData.elements as Element[];
const MAX_LIVES = 3;
const TIME_LIMITS: Record<Element['block'], number> = { s: 30, p: 60, d: 90, f: 120 };

const categoryColors: Record<string, string> = {
    'alkali metal': 'bg-red-500/80 border-red-400',
    'alkaline earth metal': 'bg-orange-500/80 border-orange-400',
    'lanthanide': 'bg-yellow-500/80 border-yellow-400',
    'actinide': 'bg-lime-500/80 border-lime-400',
    'transition metal': 'bg-green-500/80 border-green-400',
    'post-transition metal': 'bg-teal-500/80 border-teal-400',
    'metalloid': 'bg-cyan-500/80 border-cyan-400',
    'polyatomic nonmetal': 'bg-sky-500/80 border-sky-400',
    'diatomic nonmetal': 'bg-blue-500/80 border-blue-400',
    'noble gas': 'bg-indigo-500/80 border-indigo-400',
    'unknown': 'bg-slate-500/80 border-slate-400',
};

interface GameProps {
    blockToPlay: Element['block'];
}

export function PeriodicTableGame({ blockToPlay }: GameProps) {
    const { isSignedIn } = useUser();
    const { toast } = useToast();
    
    const [gameState, setGameState] = useState<'playing' | 'gameOver'>('playing');
    const [elementsToPlace, setElementsToPlace] = useState<Element[]>([]);
    const [currentElement, setCurrentElement] = useState<Element | null>(null);
    const [placedElements, setPlacedElements] = useState<Record<number, Element>>({});
    const [lives, setLives] = useState(MAX_LIVES);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMITS[blockToPlay]);

    useEffect(() => {
        if (gameState === 'playing' && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
            return () => clearTimeout(timer);
        } else if (gameState === 'playing' && timeLeft === 0) {
            toast({ title: "Time's up!", variant: 'destructive' });
            setGameState('gameOver');
        }
    }, [gameState, timeLeft, toast]);

    const startGame = useCallback(() => {
        const blockElements = [...allElements].filter(e => e.block === blockToPlay).sort(() => Math.random() - 0.5);
        setElementsToPlace(blockElements);
        setCurrentElement(blockElements[0]);
        setPlacedElements({});
        setLives(MAX_LIVES);
        setScore(0);
        setTimeLeft(TIME_LIMITS[blockToPlay]);
        setGameState('playing');
    }, [blockToPlay]);
    
    useEffect(() => {
        startGame();
    }, [startGame]);

    const handleCellClick = (period: number, group: number) => {
        if (!currentElement || gameState !== 'playing') return;

        if (currentElement.period === period && currentElement.group === group) {
            const newPlaced = { ...placedElements, [currentElement.atomicNumber]: currentElement };
            setPlacedElements(newPlaced);
            
            const remaining = elementsToPlace.filter(e => e.atomicNumber !== currentElement.atomicNumber);
            setElementsToPlace(remaining);
            setScore(prev => prev + 10);
            toast({ title: 'Correct!', description: `+10 points for placing ${currentElement.name}.`, className: "bg-green-500/10 text-green-700" });

            if (remaining.length === 0) {
                setGameState('gameOver');
            } else {
                setCurrentElement(remaining[0]);
            }
        } else {
            setLives(l => l - 1);
            toast({ title: 'Incorrect Placement!', variant: 'destructive' });
            if (lives - 1 <= 0) {
                setGameState('gameOver');
            }
        }
    };

    const renderTable = () => {
        return (
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}>
                {Array.from({ length: 7 * 18 }).map((_, i) => {
                    const period = Math.floor(i / 18) + 1;
                    const group = (i % 18) + 1;
                    
                    const element = allElements.find(e => e.period === period && e.group === group);
                    
                    if (!element || element.block !== blockToPlay) {
                        // Render a placeholder for non-target blocks, but only if it's a valid element position
                         if (element) {
                            return <div key={`${period}-${group}`} className="aspect-square border border-dashed border-muted-foreground/20 rounded-md" />
                         }
                         return <div key={`${period}-${group}`} />;
                    }

                    const isPlaced = placedElements[element.atomicNumber];
                    const categoryClass = isPlaced ? categoryColors[element.category] || categoryColors.unknown : '';

                    return (
                        <button
                            key={element.atomicNumber}
                            onClick={() => handleCellClick(period, group)}
                            disabled={isPlaced || gameState !== 'playing'}
                            className={cn(
                                "aspect-square border rounded-lg flex flex-col items-center justify-center p-0.5 text-xs transition-all duration-200",
                                "bg-card hover:bg-muted disabled:cursor-not-allowed",
                                isPlaced ? cn(categoryClass, "text-white") : "border-border"
                            )}
                        >
                            {isPlaced ? (
                                <motion.div initial={{scale: 0.5, opacity: 0}} animate={{scale: 1, opacity: 1}} className="text-center">
                                    <div className="font-bold text-base sm:text-lg">{element.symbol}</div>
                                    <div className="text-[8px] sm:text-[10px] hidden md:block">{element.name}</div>
                                    <div className="text-[8px] sm:text-[10px] md:hidden">{element.atomicNumber}</div>
                                </motion.div>
                            ) : (
                                <div className="text-muted-foreground/50 text-xs">{element.atomicNumber}</div>
                            )}
                        </button>
                    )
                })}
            </div>
        )
    };
    
    const renderFBlockTable = () => {
         const lanthanides = allElements.filter(e => e.atomicNumber >= 57 && e.atomicNumber <= 71);
         const actinides = allElements.filter(e => e.atomicNumber >= 89 && e.atomicNumber <= 103);
        
        const renderRow = (elements: Element[]) => elements.map(element => {
            const isPlaced = placedElements[element.atomicNumber];
             const categoryClass = isPlaced ? categoryColors[element.category] || categoryColors.unknown : '';
            return (
                 <button
                    key={element.atomicNumber}
                     onClick={() => handleCellClick(element.period, element.group)}
                    disabled={isPlaced || gameState !== 'playing'}
                    className={cn(
                         "aspect-square border rounded-lg flex flex-col items-center justify-center p-0.5 text-xs transition-all duration-200",
                        "bg-card hover:bg-muted disabled:cursor-not-allowed",
                        isPlaced ? cn(categoryClass, "text-white") : "border-border"
                    )}
                >
                    {isPlaced ? (
                        <motion.div initial={{scale: 0.5, opacity: 0}} animate={{scale: 1, opacity: 1}} className="text-center">
                            <div className="font-bold text-base sm:text-lg">{element.symbol}</div>
                            <div className="text-[8px] sm:text-[10px] hidden md:block">{element.name}</div>
                             <div className="text-[8px] sm:text-[10px] md:hidden">{element.atomicNumber}</div>
                        </motion.div>
                    ) : (
                        <div className="text-muted-foreground/50 text-xs">{element.atomicNumber}</div>
                    )}
                </button>
            )
        });

        return (
            <div className="space-y-2 max-w-4xl mx-auto">
                <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}>{renderRow(lanthanides)}</div>
                <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}>{renderRow(actinides)}</div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
             <Link href="/dashboard/game-zone/puzzle/periodic-table" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block"><ArrowLeft className="inline mr-1 h-4 w-4"/> Back to Block Selection</Link>
            <Card className="relative">
                <SignedOut>
                    <LoginWall title="Unlock Element Quest" description="Sign up to play this periodic table game, test your chemistry knowledge, and master the elements." />
                </SignedOut>
                
                {gameState === 'gameOver' ? (
                     <CardContent className="text-center py-10 space-y-6">
                        <h2 className="text-3xl font-bold">{lives > 0 ? "Block Completed!" : "Game Over!"}</h2>
                        <p className="text-muted-foreground">Your final score is <span className="font-bold text-primary text-xl">{score}</span>.</p>
                        <Button onClick={startGame}><RotateCw className="mr-2"/> Play Again</Button>
                    </CardContent>
                ) : (
                    <>
                        <CardHeader>
                            <div className="flex justify-between items-center bg-muted p-3 rounded-lg flex-wrap gap-4">
                                <div className="font-bold text-lg">Place: 
                                    <motion.span key={currentElement?.name} initial={{opacity: 0}} animate={{opacity: 1}} className="text-primary text-2xl ml-2">
                                        {currentElement?.name} ({currentElement?.atomicNumber})
                                    </motion.span>
                                </div>
                                <div className="flex items-center gap-4 sm:gap-6">
                                    <div className="flex items-center gap-2 font-bold"><Clock className="h-5 w-5"/> {timeLeft}s</div>
                                    <div className="flex items-center gap-2 font-bold"><Award className="h-5 w-5 text-green-500"/> {score}</div>
                                    <div className="flex items-center gap-2">
                                        {[...Array(lives)].map((_, i) => <Heart key={i} className="h-5 w-5 text-red-500 fill-red-500"/>)}
                                        {[...Array(MAX_LIVES - lives)].map((_, i) => <Heart key={i} className="h-5 w-5 text-muted-foreground/50"/>)}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto p-1">
                                {blockToPlay === 'f' ? renderFBlockTable() : renderTable()}
                            </div>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}

