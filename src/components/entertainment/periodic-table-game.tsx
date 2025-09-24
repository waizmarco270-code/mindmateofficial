
'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Atom, Award, Brain, Check, Clock, Heart, Loader2, Play, RotateCw, X, ArrowLeft, Trophy } from 'lucide-react';
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
const TIME_LIMITS: Record<Element['block'], number> = { s: 60, p: 90, d: 120, f: 150 };

const categoryColors: Record<string, string> = {
    'alkali metal': 'bg-red-500/80 border-red-400 text-white',
    'alkaline earth metal': 'bg-orange-500/80 border-orange-400 text-white',
    'lanthanide': 'bg-yellow-600/80 border-yellow-500 text-white',
    'actinide': 'bg-lime-600/80 border-lime-500 text-white',
    'transition metal': 'bg-green-500/80 border-green-400 text-white',
    'post-transition metal': 'bg-teal-500/80 border-teal-400 text-white',
    'metalloid': 'bg-cyan-500/80 border-cyan-400 text-white',
    'polyatomic nonmetal': 'bg-sky-500/80 border-sky-400 text-white',
    'diatomic nonmetal': 'bg-blue-500/80 border-blue-400 text-white',
    'noble gas': 'bg-indigo-500/80 border-indigo-400 text-white',
    'unknown': 'bg-slate-500/80 border-slate-400 text-white',
};

interface GameProps {
    blockToPlay: Element['block'];
}

export function PeriodicTableGame({ blockToPlay }: GameProps) {
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

    const renderTableCell = (element: Element | undefined, period: number, group: number) => {
        if (!element || (element.block !== blockToPlay && blockToPlay !== 'f')) {
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
                    isPlaced ? cn(categoryClass) : "border-border"
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
    };

    const renderTable = () => (
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}>
            {Array.from({ length: 7 * 18 }).map((_, i) => {
                const period = Math.floor(i / 18) + 1;
                const group = (i % 18) + 1;
                const element = allElements.find(e => e.period === period && e.group === group);
                return renderTableCell(element, period, group);
            })}
        </div>
    );
    
    const renderFBlockTable = () => {
         const lanthanides = allElements.filter(e => e.atomicNumber >= 57 && e.atomicNumber <= 71);
         const actinides = allElements.filter(e => e.atomicNumber >= 89 && e.atomicNumber <= 103);
        
        const renderRow = (elements: Element[]) => elements.map(element => renderTableCell(element, element.period, element.group));

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
            
            {gameState === 'gameOver' ? (
                <Card className="w-full max-w-md mx-auto text-center p-6">
                    <Trophy className={cn("h-20 w-20 mx-auto", lives > 0 ? "text-yellow-400" : "text-muted-foreground")}/>
                    <h2 className="text-3xl font-bold mt-4">{lives > 0 ? "Block Completed!" : "Game Over!"}</h2>
                    <p className="text-muted-foreground mt-2">Your final score is <span className="font-bold text-primary text-xl">{score}</span>.</p>
                    <Button onClick={startGame} className="mt-6"><RotateCw className="mr-2"/> Play Again</Button>
                </Card>
            ) : (
                <div className="space-y-6">
                    <Card className="p-4 sm:p-6 sticky top-[4.5rem] z-10 bg-background/80 backdrop-blur-lg">
                        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
                            <p className="text-sm font-semibold text-muted-foreground">Place:</p>
                             <AnimatePresence mode="wait">
                                <motion.div 
                                    key={currentElement?.name} 
                                    initial={{opacity:0, y:20}} 
                                    animate={{opacity:1, y:0}} 
                                    exit={{opacity:0, y:-20}} 
                                    transition={{duration: 0.3}}
                                >
                                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">
                                        {currentElement?.name} ({currentElement?.atomicNumber})
                                    </h2>
                                </motion.div>
                             </AnimatePresence>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                <div className="flex items-center gap-4 sm:gap-6 text-base sm:text-lg">
                                    <div className="flex items-center gap-2 font-bold" title="Time Left"><Clock className="h-5 w-5"/> {timeLeft}s</div>
                                    <div className="flex items-center gap-2 font-bold" title="Score"><Award className="h-5 w-5 text-green-500"/> {score}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {[...Array(lives)].map((_, i) => <Heart key={`life-${i}`} className="h-6 w-6 text-red-500 fill-red-500"/>)}
                                    {[...Array(MAX_LIVES - lives)].map((_, i) => <Heart key={`lost-${i}`} className="h-6 w-6 text-muted-foreground/30"/>)}
                                </div>
                            </div>
                        </motion.div>
                    </Card>

                    <div className="overflow-x-auto p-1 bg-muted/30 rounded-xl">
                        {blockToPlay === 'f' ? renderFBlockTable() : renderTable()}
                    </div>
                </div>
            )}
        </div>
    );
}
