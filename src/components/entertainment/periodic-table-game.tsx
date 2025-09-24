
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
const TIME_LIMITS: Record<Element['block'], number> = { s: 60, p: 180, d: 240, f: 300 };

const categoryColors: Record<string, string> = {
    'alkali metal': 'bg-red-500/80 border-red-400 text-white',
    'alkaline earth metal': 'bg-orange-500/80 border-orange-400 text-white',
    'lanthanide': 'bg-yellow-500/80 border-yellow-400 text-white',
    'actinide': 'bg-fuchsia-500/80 border-fuchsia-400 text-white',
    'transition metal': 'bg-green-500/80 border-green-400 text-white',
    'post-transition metal': 'bg-teal-500/80 border-teal-400 text-white',
    'metalloid': 'bg-cyan-500/80 border-cyan-400 text-white',
    'polyatomic nonmetal': 'bg-blue-500/80 border-blue-400 text-white',
    'diatomic nonmetal': 'bg-sky-500/80 border-sky-400 text-white',
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
    
    const { blockElements, gridTemplate } = useMemo(() => {
        const elements = allElements.filter(e => e.block === blockToPlay);
        let template: (Element | null)[][] = [];

        if (blockToPlay === 's') {
            template = Array(7).fill(null).map(() => Array(2).fill(null));
        } else if (blockToPlay === 'p') {
            template = Array(6).fill(null).map(() => Array(6).fill(null));
        } else if (blockToPlay === 'd') {
            template = Array(4).fill(null).map(() => Array(10).fill(null));
        } else if (blockToPlay === 'f') {
            template = Array(2).fill(null).map(() => Array(15).fill(null));
        }
        
        elements.forEach(el => {
            let row: number, col: number;
            if (el.block === 's') {
                row = el.period - 1;
                col = el.group - 1;
            } else if (el.block === 'p') {
                row = el.period - 2;
                col = el.group - 13;
            } else if (el.block === 'd') {
                row = el.period - 4;
                col = el.group - 3;
            } else if (el.block === 'f') {
                row = el.period - 6;
                col = el.group === 3 ? el.atomicNumber - (el.period === 6 ? 57 : 89) : 0;
            } else {
                return;
            }

            if(template[row] !== undefined && template[row][col] !== undefined) {
               template[row][col] = el;
            }
        });

        // Special case for Helium in s-block view
        if(blockToPlay === 's'){
            template[0][1] = allElements.find(e => e.atomicNumber === 2)!;
        }


        return { blockElements: elements, gridTemplate: template };
    }, [blockToPlay]);

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
        const shuffled = [...blockElements].sort(() => Math.random() - 0.5);
        setElementsToPlace(shuffled);
        setCurrentElement(shuffled[0]);
        setPlacedElements({});
        setLives(MAX_LIVES);
        setScore(0);
        setTimeLeft(TIME_LIMITS[blockToPlay]);
        setGameState('playing');
    }, [blockToPlay, blockElements]);
    
    useEffect(() => {
        startGame();
    }, [startGame]);

    const handleCellClick = (element: Element | null) => {
        if (!element || !currentElement || gameState !== 'playing') return;

        if (currentElement.atomicNumber === element.atomicNumber) {
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
    
    const renderGridCell = (element: Element | null, cellIndex: number) => {
        const isPlaced = element && placedElements[element.atomicNumber];
        const categoryClass = isPlaced ? categoryColors[element.category] || categoryColors.unknown : '';

        return (
            <button
                key={element ? element.atomicNumber : `empty-${cellIndex}`}
                onClick={() => handleCellClick(element)}
                disabled={!element || isPlaced || gameState !== 'playing'}
                className={cn(
                    "aspect-square border rounded-md flex flex-col items-center justify-center p-0.5 text-xs transition-all duration-200",
                    "h-14 w-14 sm:h-16 sm:w-16",
                    !element && "border-transparent bg-transparent",
                    element && !isPlaced && "bg-card hover:bg-muted disabled:cursor-not-allowed",
                    isPlaced ? cn(categoryClass, "shadow-lg") : "border-border"
                )}
            >
                {isPlaced ? (
                    <motion.div initial={{scale: 0.5, opacity: 0}} animate={{scale: 1, opacity: 1}} className="text-center">
                        <div className="font-bold text-sm sm:text-base">{element.symbol}</div>
                        <div className="text-[9px] hidden sm:block">{element.name}</div>
                        <div className="text-[9px] sm:hidden">{element.atomicNumber}</div>
                    </motion.div>
                ) : element ? (
                    <div className="text-muted-foreground/50 text-[9px]">{element.atomicNumber}</div>
                ) : null}
            </button>
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
                    <Card className="p-4 sm:p-6 sticky top-[4.5rem] z-10 bg-green-500/10 border-green-500/50">
                        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="text-center">
                            <p className="text-sm font-semibold text-green-700 dark:text-green-300">Place this Element:</p>
                             <AnimatePresence mode="wait">
                                <motion.div 
                                    key={currentElement?.name} 
                                    initial={{opacity:0, y:20}} 
                                    animate={{opacity:1, y:0}} 
                                    exit={{opacity:0, y:-20}} 
                                    transition={{duration: 0.3}}
                                >
                                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                                        {currentElement?.name} ({currentElement?.atomicNumber})
                                    </h2>
                                </motion.div>
                             </AnimatePresence>
                        </motion.div>
                    </Card>
                    
                    <div className="flex justify-center">
                        <div className="grid gap-1">
                             {gridTemplate.map((row, rowIndex) => (
                                <div key={rowIndex} className="flex gap-1">
                                    {row.map((el, colIndex) => renderGridCell(el, rowIndex * row.length + colIndex))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <Card className="p-4 fixed bottom-4 left-4 right-4 bg-background/80 backdrop-blur-lg z-20">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4 sm:gap-6 text-base sm:text-lg">
                                <div className="flex items-center gap-2 font-bold" title="Time Left"><Clock className="h-5 w-5"/> {timeLeft}s</div>
                                <div className="flex items-center gap-2 font-bold" title="Score"><Award className="h-5 w-5 text-green-500"/> {score}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                {[...Array(lives)].map((_, i) => <Heart key={`life-${i}`} className="h-6 w-6 text-red-500 fill-red-500"/>)}
                                {[...Array(MAX_LIVES - lives)].map((_, i) => <Heart key={`lost-${i}`} className="h-6 w-6 text-muted-foreground/30"/>)}
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
