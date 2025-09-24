
'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignedOut } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Atom, Award, Brain, Check, Clock, Heart, Loader2, Play, RotateCw, X, ArrowLeft, Trophy, Maximize, Minimize, Book, BookOpen } from 'lucide-react';
import periodicTableData from '@/app/lib/periodic-table-data.json';
import Link from 'next/link';
import { useImmersive } from '@/hooks/use-immersive';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useUsers } from '@/hooks/use-admin';

interface Element {
    atomicNumber: number;
    symbol: string;
    name: string;
    atomicMass: string;
    density: number | null;
    electronConfiguration: string;
    electronegativity: number | null;
    summary: string;
    group: number;
    period: number;
    block: 's' | 'p' | 'd' | 'f';
    category: string;
}

const allElements = periodicTableData.elements as Element[];
const MAX_LIVES = 3;

// Max time in seconds for 100% efficient completion. Anything over this gets a diminishing score.
const MAX_TIME_LIMITS: Record<Element['block'], number> = { s: 60, p: 240, d: 300, f: 360 };

const categoryColors: Record<string, string> = {
    'alkali metal': 'from-red-500 to-red-700 border-red-400',
    'alkaline earth metal': 'from-orange-500 to-orange-700 border-orange-400',
    'lanthanide': 'from-amber-400 to-amber-600 border-amber-300 text-gray-800',
    'actinide': 'from-fuchsia-500 to-fuchsia-700 border-fuchsia-400',
    'transition metal': 'from-green-500 to-green-700 border-green-400',
    'post-transition metal': 'from-teal-500 to-teal-700 border-teal-400',
    'metalloid': 'from-cyan-500 to-cyan-700 border-cyan-400',
    'polyatomic nonmetal': 'from-blue-500 to-blue-700 border-blue-400',
    'diatomic nonmetal': 'from-sky-500 to-sky-700 border-sky-400',
    'noble gas': 'from-indigo-500 to-indigo-700 border-indigo-400',
    'unknown': 'from-slate-500 to-slate-700 border-slate-400',
};


interface GameProps {
    blockToPlay: Element['block'];
    mode: 'challenge' | 'learn' | 'practice';
}

export function PeriodicTableGame({ blockToPlay, mode }: GameProps) {
    const { user } = useUser();
    const { updateElementQuestScore, currentUserData } = useUsers();
    const { toast } = useToast();
    const { setIsImmersive } = useImmersive();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedElement, setSelectedElement] = useState<Element | null>(null);

    const [gameState, setGameState] = useState<'playing' | 'gameOver'>('playing');
    const [elementsToPlace, setElementsToPlace] = useState<Element[]>([]);
    const [currentElement, setCurrentElement] = useState<Element | null>(null);
    const [placedElements, setPlacedElements] = useState<Record<number, Element>>({});
    const [lives, setLives] = useState(MAX_LIVES);
    const [finalScore, setFinalScore] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    
    const highScore = currentUserData?.elementQuestScores?.[blockToPlay] || 0;


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

    const stopTimer = () => {
        if(timerRef.current) clearInterval(timerRef.current);
    }
    
    useEffect(() => {
        if (gameState === 'playing' && mode === 'challenge') {
            timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
        } else {
            stopTimer();
        }
        return () => stopTimer();
    }, [gameState, mode]);

    const startGame = useCallback(() => {
        const shuffled = [...blockElements].sort(() => Math.random() - 0.5);
        setElementsToPlace(shuffled);
        setCurrentElement(shuffled[0]);
        setPlacedElements({});
        setLives(MAX_LIVES);
        setFinalScore(0);
        setElapsedTime(0);
        setGameState('playing');
    }, [blockToPlay, blockElements]);
    
    useEffect(() => {
        startGame();
    }, [startGame]);

    const handleCellClick = (element: Element | null) => {
        if (mode === 'learn') {
            if(element) setSelectedElement(element);
            return;
        }

        if (!element || !currentElement || gameState !== 'playing') return;

        if (currentElement.atomicNumber === element.atomicNumber) {
            const newPlaced = { ...placedElements, [currentElement.atomicNumber]: currentElement };
            setPlacedElements(newPlaced);
            
            const remaining = elementsToPlace.filter(e => e.atomicNumber !== currentElement.atomicNumber);
            setElementsToPlace(remaining);
            
            toast({ title: 'Correct!', description: `Placed ${currentElement.name}.`, className: "bg-green-500/10 text-green-700 dark:text-green-300" });

            if (remaining.length === 0) {
                 stopTimer();
                 setGameState('gameOver');
                 const maxTime = MAX_TIME_LIMITS[blockToPlay];
                 // Score decreases linearly. Finishes in 0s = 100. Finishes at maxTime = 1. Finishes after maxTime = 1.
                 const calculatedScore = Math.max(1, Math.round(100 * (1 - (elapsedTime / maxTime))));
                 setFinalScore(calculatedScore);
                 if(user) updateElementQuestScore(user.id, blockToPlay, calculatedScore);
            } else {
                setCurrentElement(remaining[0]);
            }
        } else {
            setLives(l => {
                const newLives = l - 1;
                if (newLives <= 0) {
                    stopTimer();
                    setGameState('gameOver');
                    setFinalScore(0);
                }
                return newLives;
            });
            toast({ title: 'Incorrect Placement!', variant: 'destructive' });
        }
    };
    
    const renderGridCell = (element: Element | null, cellIndex: number) => {
        const isPlaced = element && (placedElements[element.atomicNumber] || mode === 'learn');
        const categoryClass = isPlaced ? categoryColors[element.category] || categoryColors.unknown : '';

        return (
            <motion.button
                key={element ? element.atomicNumber : `empty-${cellIndex}`}
                onClick={() => handleCellClick(element)}
                disabled={!element || (isPlaced && mode !== 'learn') || (gameState !== 'playing' && mode !== 'learn')}
                className={cn(
                    "relative aspect-square rounded-md flex flex-col items-center justify-center p-0.5 text-xs transition-all duration-200 h-20 w-20",
                    !element && "border-transparent bg-transparent",
                    element && !isPlaced && "bg-slate-100 dark:bg-slate-800/50 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed",
                    isPlaced ? 'text-white' : 'border-border'
                )}
                 whileHover={{ scale: element && !isPlaced ? 1.05 : 1 }}
                whileTap={{ scale: element && !isPlaced ? 0.95 : 1 }}
            >
                {isPlaced ? (
                     <motion.div 
                        initial={{scale: 0.5, opacity: 0}} 
                        animate={{scale: 1, opacity: 1}} 
                        className={cn(
                            "relative text-center w-full h-full flex flex-col items-center justify-center rounded bg-gradient-to-br p-1 border-2 transition-shadow hover:shadow-lg", 
                            categoryClass
                        )}
                        style={{textShadow: '0 1px 2px rgba(0,0,0,0.4)'}}
                    >
                         <div className="absolute top-0.5 right-1 text-[10px] font-bold opacity-80">{element.atomicNumber}</div>
                        <div className="font-black text-xl drop-shadow-md">{element.symbol}</div>
                        <div className="text-[9px] font-bold truncate px-0.5">{element.name}</div>
                    </motion.div>
                ) : element ? (
                    <div className="text-muted-foreground/30 text-lg font-semibold"></div>
                ) : null}
            </motion.button>
        )
    }

    const backUrl = mode === 'learn' ? '/dashboard/game-zone/puzzle/periodic-table/learn' : '/dashboard/game-zone/puzzle/periodic-table/challenge';


    return (
        <div ref={gameContainerRef} className="space-y-4 p-4 bg-background">
            <Dialog open={!!selectedElement} onOpenChange={() => setSelectedElement(null)}>
                <DialogContent className="max-w-md">
                    {selectedElement && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-bold flex items-center gap-4">
                                     <span className={cn("text-5xl font-black", categoryColors[selectedElement.category]?.replace(/from-\\w+-\\d+|to-\\w+-\\d+|border-\\w+-\\d+/g, ''))}>{selectedElement.symbol}</span>
                                     <span>{selectedElement.name} (#{selectedElement.atomicNumber})</span>
                                </DialogTitle>
                                <DialogDescription className="capitalize">{selectedElement.category}</DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-3 text-sm">
                               <p><strong>Atomic Mass:</strong> {selectedElement.atomicMass}</p>
                               <p><strong>Electron Config:</strong> {selectedElement.electronConfiguration}</p>
                               <p><strong>Electronegativity:</strong> {selectedElement.electronegativity ?? 'N/A'}</p>
                               <p><strong>Density:</strong> {selectedElement.density ? `${selectedElement.density} g/cm³` : 'N/A'}</p>
                               <p className="pt-2 text-muted-foreground">{selectedElement.summary}</p>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

             <div className="flex justify-between items-center px-2">
                <Button asChild variant="ghost" size="sm">
                    <Link href={backUrl}><ArrowLeft className="mr-2 h-4 w-4"/> Back</Link>
                </Button>
                {mode === 'challenge' && gameState === 'playing' && (
                     <div className="flex items-center gap-4 text-sm font-medium bg-muted/50 px-3 py-1.5 rounded-lg">
                        <div className="flex items-center gap-1" title="Time Elapsed"><Clock className="h-4 w-4"/> {elapsedTime}s</div>
                        <div className="flex items-center gap-1" title="High Score"><Trophy className="h-4 w-4 text-amber-500"/> {highScore}</div>
                        <div className="flex items-center gap-0.5">
                            {[...Array(lives)].map((_, i) => <Heart key={`life-${i}`} className="h-5 w-5 text-red-500 fill-red-500"/>)}
                            {[...Array(MAX_LIVES - lives)].map((_, i) => <Heart key={`lost-${i}`} className="h-5 w-5 text-muted-foreground/30"/>)}
                        </div>
                    </div>
                )}
                 <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize className="h-5 w-5"/> : <Maximize className="h-5 w-5"/>}
                 </Button>
            </div>
            
            {gameState === 'gameOver' && mode === 'challenge' ? (
                <div className="min-h-[60vh] flex flex-col items-center justify-center">
                    <Card className="w-full max-w-md mx-auto text-center p-6">
                        <Trophy className={cn("h-20 w-20 mx-auto", lives > 0 ? "text-yellow-400" : "text-muted-foreground")}/>
                        <h2 className="text-3xl font-bold mt-4">{lives > 0 ? "Block Completed!" : "Game Over!"}</h2>
                        <p className="text-muted-foreground mt-2">
                            {lives > 0 ? `You finished in ${elapsedTime} seconds.` : 'You ran out of lives.'}
                        </p>
                        <p className="text-muted-foreground mt-2">Your score is <span className="font-bold text-primary text-xl">{finalScore}</span>.</p>
                         {finalScore > highScore && <p className="font-bold text-green-500">New High Score!</p>}
                        <Button onClick={startGame} className="mt-6"><RotateCw className="mr-2"/> Play Again</Button>
                    </Card>
                </div>
            ) : (
                <div className="space-y-6">
                     {mode === 'challenge' && (
                        <Card className="p-6 bg-green-500/10 border-green-500/50 shadow-inner">
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
                                        <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
                                            {currentElement?.name}
                                        </h2>
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>
                        </Card>
                     )}
                     {mode === 'learn' && (
                         <Card className="p-6 bg-blue-500/10 border-blue-500/50 shadow-inner">
                            <div className="text-center">
                                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center justify-center gap-2"><BookOpen/> Learn Mode</p>
                                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                    Click any element to see its details.
                                </h2>
                            </div>
                        </Card>
                     )}
                    
                    <div className="flex justify-center overflow-x-auto">
                        <div className="grid gap-2 p-1" style={gridStyles}>
                             {gridTemplate.flat().map((el, index) => renderGridCell(el, index))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
