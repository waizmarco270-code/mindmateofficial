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
    'alkali metal': 'bg-red-500/80 border-red-400 text-white shadow-red-500/50',
    'alkaline earth metal': 'bg-orange-500/80 border-orange-400 text-white shadow-orange-500/50',
    'lanthanide': 'bg-yellow-500/80 border-yellow-400 text-white shadow-yellow-500/50',
    'actinide': 'bg-fuchsia-500/80 border-fuchsia-400 text-white shadow-fuchsia-500/50',
    'transition metal': 'bg-green-500/80 border-green-400 text-white shadow-green-500/50',
    'post-transition metal': 'bg-teal-500/80 border-teal-400 text-white shadow-teal-500/50',
    'metalloid': 'bg-cyan-500/80 border-cyan-400 text-white shadow-cyan-500/50',
    'polyatomic nonmetal': 'bg-blue-500/80 border-blue-400 text-white shadow-blue-500/50',
    'diatomic nonmetal': 'bg-sky-500/80 border-sky-400 text-white shadow-sky-500/50',
    'noble gas': 'bg-indigo-500/80 border-indigo-400 text-white shadow-indigo-500/50',
    'unknown': 'bg-slate-500/80 border-slate-400 text-white shadow-slate-500/50',
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
    
    const { blockElements, gridTemplate, gridStyles } = useMemo(() => {
        const elements = allElements.filter(e => {
            if (blockToPlay === 'f') return e.category === 'lanthanide' || e.category === 'actinide';
            return e.block === blockToPlay;
        });
        
        let gridRows: (Element | null)[][] = [];
        let styles = {};

        if (blockToPlay === 's') {
            styles = { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' };
            gridRows = Array.from({ length: 7 }, () => Array(2).fill(null));
            elements.forEach(el => {
                if(el.period >= 1 && el.period <= 7 && el.group >= 1 && el.group <= 2) {
                    gridRows[el.period - 1][el.group - 1] = el;
                }
            });
             gridRows[0][1] = allElements.find(e => e.atomicNumber === 2)!; // Helium
        } else if (blockToPlay === 'p') {
            styles = { gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' };
            gridRows = Array.from({ length: 6 }, () => Array(6).fill(null));
            elements.forEach(el => {
                if(el.period >= 2 && el.period <= 7 && el.group >= 13 && el.group <= 18) {
                    gridRows[el.period - 2][el.group - 13] = el;
                }
            });
        } else if (blockToPlay === 'd') {
            styles = { gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' };
            gridRows = Array.from({ length: 4 }, () => Array(10).fill(null));
            elements.forEach(el => {
                 if(el.period >= 4 && el.period <= 7 && el.group >= 3 && el.group <= 12) {
                    gridRows[el.period - 4][el.group - 3] = el;
                }
            });
        } else if (blockToPlay === 'f') {
            styles = { gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' };
            gridRows = Array.from({ length: 2 }, () => Array(15).fill(null));
            elements.forEach(el => {
                let row = el.category === 'lanthanide' ? 0 : 1;
                let col;
                if (el.atomicNumber >= 57 && el.atomicNumber <= 71) col = el.atomicNumber - 57;
                else col = el.atomicNumber - 89;
                
                if (gridRows[row] !== undefined && gridRows[row][col] !== undefined) {
                    gridRows[row][col] = el;
                }
            });
        }
        
        return { blockElements: elements, gridTemplate: gridRows, gridStyles: styles };
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
            <motion.button
                key={element ? element.atomicNumber : `empty-${cellIndex}`}
                onClick={() => handleCellClick(element)}
                disabled={!element || isPlaced || gameState !== 'playing'}
                className={cn(
                    "relative aspect-square border-2 rounded-lg flex flex-col items-center justify-center p-0.5 text-xs transition-all duration-200",
                    "sm:h-20 sm:w-20 h-16 w-16", // Adjusted size
                    !element && "border-transparent bg-transparent",
                    element && !isPlaced && "bg-muted/50 border-dashed hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed",
                    isPlaced && "shadow-lg",
                    isPlaced ? categoryClass : 'border-border'
                )}
                whileHover={{ scale: element && !isPlaced ? 1.05 : 1 }}
                whileTap={{ scale: element && !isPlaced ? 0.95 : 1 }}
            >
                {isPlaced ? (
                    <motion.div initial={{scale: 0.5, opacity: 0}} animate={{scale: 1, opacity: 1}} className="text-center w-full">
                         <div className="absolute top-0.5 right-1 text-[9px] font-bold opacity-70">{element.atomicNumber}</div>
                        <div className="font-bold text-lg sm:text-xl">{element.symbol}</div>
                        <div className="text-[9px] truncate px-0.5">{element.name}</div>
                    </motion.div>
                ) : element ? (
                    <div className="text-muted-foreground/30 text-[9px]">{element.atomicNumber}</div>
                ) : null}
            </motion.button>
        )
    }


    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center px-2">
                 <Button asChild variant="ghost" size="sm">
                    <Link href="/dashboard/game-zone/puzzle/periodic-table"><ArrowLeft className="mr-2 h-4 w-4"/> Back</Link>
                </Button>
                {gameState === 'playing' && (
                     <div className="flex items-center gap-4 sm:gap-6 text-sm font-medium bg-muted/50 px-3 py-1.5 rounded-lg">
                        <div className="flex items-center gap-1.5" title="Time Left"><Clock className="h-4 w-4"/> {timeLeft}s</div>
                        <div className="flex items-center gap-1.5" title="Score"><Award className="h-4 w-4 text-green-500"/> {score}</div>
                        <div className="flex items-center gap-1">
                            {[...Array(lives)].map((_, i) => <Heart key={`life-${i}`} className="h-5 w-5 text-red-500 fill-red-500"/>)}
                            {[...Array(MAX_LIVES - lives)].map((_, i) => <Heart key={`lost-${i}`} className="h-5 w-5 text-muted-foreground/30"/>)}
                        </div>
                    </div>
                )}
            </div>
            
            {gameState === 'gameOver' ? (
                <Card className="w-full max-w-md mx-auto text-center p-6 mt-10">
                    <Trophy className={cn("h-20 w-20 mx-auto", lives > 0 ? "text-yellow-400" : "text-muted-foreground")}/>
                    <h2 className="text-3xl font-bold mt-4">{lives > 0 ? "Block Completed!" : "Game Over!"}</h2>
                    <p className="text-muted-foreground mt-2">Your final score is <span className="font-bold text-primary text-xl">{score}</span>.</p>
                    <Button onClick={startGame} className="mt-6"><RotateCw className="mr-2"/> Play Again</Button>
                </Card>
            ) : (
                <div className="space-y-6">
                     <Card className="p-4 sm:p-6 bg-green-500/10 border-green-500/50 shadow-inner">
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
                        <div className="grid gap-1" style={gridStyles}>
                             {gridTemplate.flat().map((el, index) => renderGridCell(el, index))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
