
'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Atom, Award, Brain, Check, Clock, Heart, Loader2, Play, RotateCw, X, ArrowLeft, Trophy, Maximize, Minimize } from 'lucide-react';
import periodicTableData from '@/app/lib/periodic-table-data.json';
import Link from 'next/link';
import { useImmersive } from '@/hooks/use-immersive';

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
    'alkali metal': 'bg-gradient-to-br from-red-500 to-orange-500 border-red-400',
    'alkaline earth metal': 'bg-gradient-to-br from-orange-500 to-amber-500 border-orange-400',
    'lanthanide': 'bg-gradient-to-br from-amber-400 to-yellow-500 border-amber-300',
    'actinide': 'bg-gradient-to-br from-fuchsia-500 to-pink-500 border-fuchsia-400',
    'transition metal': 'bg-gradient-to-br from-green-500 to-teal-500 border-green-400',
    'post-transition metal': 'bg-gradient-to-br from-teal-500 to-cyan-500 border-teal-400',
    'metalloid': 'bg-gradient-to-br from-cyan-500 to-sky-500 border-cyan-400',
    'polyatomic nonmetal': 'bg-gradient-to-br from-blue-500 to-indigo-500 border-blue-400',
    'diatomic nonmetal': 'bg-gradient-to-br from-sky-500 to-blue-500 border-sky-400',
    'noble gas': 'bg-gradient-to-br from-indigo-500 to-violet-500 border-indigo-400',
    'unknown': 'bg-gradient-to-br from-slate-500 to-gray-500 border-slate-400',
};


interface GameProps {
    blockToPlay: Element['block'];
}

export function PeriodicTableGame({ blockToPlay }: GameProps) {
    const { toast } = useToast();
    const { setIsImmersive } = useImmersive();
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [gameState, setGameState] = useState<'playing' | 'gameOver'>('playing');
    const [elementsToPlace, setElementsToPlace] = useState<Element[]>([]);
    const [currentElement, setCurrentElement] = useState<Element | null>(null);
    const [placedElements, setPlacedElements] = useState<Record<number, Element>>({});
    const [lives, setLives] = useState(MAX_LIVES);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMITS[blockToPlay]);
    
    const gameContainerRef = useRef<HTMLDivElement>(null);

    const { blockElements, gridTemplate, gridStyles } = useMemo(() => {
        const elements = allElements.filter(e => {
            if (blockToPlay === 'f') return e.category === 'lanthanide' || e.category === 'actinide';
            if (e.block === 's' && e.atomicNumber === 2 && blockToPlay === 's') return true; // Include Helium in S-block game
            return e.block === blockToPlay && e.category !== 'lanthanide' && e.category !== 'actinide';
        });
        
        let gridRows: (Element | null)[][] = [];
        let styles = {};

         if (blockToPlay === 's') {
            styles = { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' };
            gridRows = Array.from({ length: 7 }, () => Array(2).fill(null));
            elements.forEach(el => {
                const groupIndex = el.group === 18 ? 1 : el.group - 1; // Helium case
                if (el.period >= 1 && el.period <= 7 && groupIndex >= 0 && groupIndex <= 1) {
                    gridRows[el.period - 1][groupIndex] = el;
                }
            });
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
    
     const toggleFullscreen = () => {
        const elem = gameContainerRef.current;
        if (!elem) return;

        if (!document.fullscreenElement) {
            elem.requestFullscreen().catch(err => {
                toast({ variant: 'destructive', title: `Error entering fullscreen: ${err.message}` });
            });
        } else {
            document.exitFullscreen();
        }
    };
    
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        }
    }, []);

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
            toast({ title: 'Correct!', description: `+10 points for placing ${currentElement.name}.`, className: "bg-green-500/10 text-green-700 dark:text-green-300" });

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
                    "relative aspect-square rounded-lg flex flex-col items-center justify-center p-0.5 text-xs transition-all duration-200 shadow-md",
                    "sm:h-24 sm:w-24 h-20 w-full", // Base size
                    "lg:h-28 lg:w-28", // Larger on large screens
                    !element && "border-transparent bg-transparent shadow-none",
                    element && !isPlaced && "bg-slate-100 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed",
                    isPlaced ? 'text-white' : 'border-border'
                )}
                 whileHover={{ scale: element && !isPlaced ? 1.05 : 1 }}
                whileTap={{ scale: element && !isPlaced ? 0.95 : 1 }}
            >
                {isPlaced ? (
                     <motion.div 
                        initial={{scale: 0.5, opacity: 0}} 
                        animate={{scale: 1, opacity: 1}} 
                        className={cn("text-center w-full h-full flex flex-col items-center justify-center rounded-md bg-gradient-to-br p-1", categoryClass)}
                    >
                        <div className="absolute top-1 right-1.5 text-[10px] font-bold opacity-80">{element.atomicNumber}</div>
                        <div className="font-black text-xl sm:text-2xl drop-shadow-md">{element.symbol}</div>
                        <div className="text-[10px] font-bold truncate px-1">{element.name}</div>
                    </motion.div>
                ) : element ? (
                    <div className="text-muted-foreground/30 text-xs">{element.atomicNumber}</div>
                ) : null}
            </motion.button>
        )
    }


    return (
        <div ref={gameContainerRef} className="space-y-2 sm:space-y-4 p-2 sm:p-4 bg-background">
             <div className="flex justify-between items-center px-2">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/dashboard/game-zone/puzzle/periodic-table"><ArrowLeft className="mr-2 h-4 w-4"/> Back</Link>
                </Button>
                {gameState === 'playing' && (
                     <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium bg-muted/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg">
                        <div className="flex items-center gap-1" title="Time Left"><Clock className="h-4 w-4"/> {timeLeft}s</div>
                        <div className="flex items-center gap-1" title="Score"><Award className="h-4 w-4 text-green-500"/> {score}</div>
                        <div className="flex items-center gap-0.5">
                            {[...Array(lives)].map((_, i) => <Heart key={`life-${i}`} className="h-4 sm:h-5 w-4 sm:w-5 text-red-500 fill-red-500"/>)}
                            {[...Array(MAX_LIVES - lives)].map((_, i) => <Heart key={`lost-${i}`} className="h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground/30"/>)}
                        </div>
                    </div>
                )}
                 <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize className="h-5 w-5"/> : <Maximize className="h-5 w-5"/>}
                 </Button>
            </div>
            
            {gameState === 'gameOver' ? (
                <div className="min-h-[60vh] flex flex-col items-center justify-center">
                    <Card className="w-full max-w-md mx-auto text-center p-6">
                        <Trophy className={cn("h-20 w-20 mx-auto", lives > 0 ? "text-yellow-400" : "text-muted-foreground")}/>
                        <h2 className="text-3xl font-bold mt-4">{lives > 0 ? "Block Completed!" : "Game Over!"}</h2>
                        <p className="text-muted-foreground mt-2">Your final score is <span className="font-bold text-primary text-xl">{score}</span>.</p>
                        <Button onClick={startGame} className="mt-6"><RotateCw className="mr-2"/> Play Again</Button>
                    </Card>
                </div>
            ) : (
                <div className="space-y-4 sm:space-y-6">
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
                    
                    <div className="flex justify-center overflow-x-auto">
                        <div className="grid gap-1 p-1" style={gridStyles}>
                             {gridTemplate.flat().map((el, index) => renderGridCell(el, index))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
