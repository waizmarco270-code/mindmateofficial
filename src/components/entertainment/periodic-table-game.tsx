
'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignedOut } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LoginWall } from '../ui/login-wall';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Atom, Award, Brain, Check, Clock, Heart, Loader2, Play, RotateCw, X } from 'lucide-react';
import periodicTableData from '@/app/lib/periodic-table-data.json';

interface Element {
    atomicNumber: number;
    symbol: string;
    name: string;
    group: number;
    period: number;
    block: 's' | 'p' | 'd' | 'f';
}

const allElements = periodicTableData.elements as Element[];
const MAX_LIVES = 3;
const TIME_LIMITS: Record<Element['block'], number> = { s: 30, p: 45, d: 60, f: 60 };

export function PeriodicTableGame() {
    const { isSignedIn } = useUser();
    const { toast } = useToast();
    
    const [gameState, setGameState] = useState<'selecting' | 'playing' | 'gameOver'>('selecting');
    const [selectedBlock, setSelectedBlock] = useState<Element['block']>('s');
    const [elementsToPlace, setElementsToPlace] = useState<Element[]>([]);
    const [currentElement, setCurrentElement] = useState<Element | null>(null);
    const [placedElements, setPlacedElements] = useState<Record<number, Element>>({});
    const [lives, setLives] = useState(MAX_LIVES);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMITS[selectedBlock]);

    useEffect(() => {
        if (gameState === 'playing' && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
            return () => clearTimeout(timer);
        } else if (gameState === 'playing' && timeLeft === 0) {
            toast({ title: "Time's up!", variant: 'destructive' });
            setGameState('gameOver');
        }
    }, [gameState, timeLeft, toast]);

    const startGame = (block: Element['block']) => {
        setSelectedBlock(block);
        const blockElements = allElements.filter(e => e.block === block);
        setElementsToPlace(blockElements);
        setCurrentElement(blockElements[0]);
        setPlacedElements({});
        setLives(MAX_LIVES);
        setScore(0);
        setTimeLeft(TIME_LIMITS[block]);
        setGameState('playing');
    };

    const handleCellClick = (period: number, group: number) => {
        if (!currentElement) return;

        if (currentElement.period === period && currentElement.group === group) {
            // Correct placement
            const newPlaced = { ...placedElements, [currentElement.atomicNumber]: currentElement };
            setPlacedElements(newPlaced);
            
            const remaining = elementsToPlace.filter(e => !newPlaced[e.atomicNumber]);
            setElementsToPlace(remaining);
            setScore(prev => prev + 10);
            toast({ title: 'Correct!', description: `+10 points for placing ${currentElement.name}.`, className: "bg-green-500/10 text-green-700" });

            if (remaining.length === 0) {
                // Won the level
                setGameState('gameOver');
            } else {
                setCurrentElement(remaining[0]);
            }
        } else {
            // Incorrect placement
            setLives(l => l - 1);
            toast({ title: 'Incorrect Placement!', variant: 'destructive' });
            if (lives - 1 <= 0) {
                setGameState('gameOver');
            }
        }
    };

    const renderCell = (period: number, group: number) => {
        const key = `p${period}-g${group}`;
        const element = allElements.find(e => e.period === period && e.group === group);
        
        if (!element) {
            return <div key={key} className="border-none" />;
        }
        
        const isPlaced = Object.values(placedElements).some(p => p.atomicNumber === element.atomicNumber);
        
        return (
            <button
                key={key}
                onClick={() => handleCellClick(period, group)}
                disabled={isPlaced}
                className={cn(
                    "aspect-square border rounded-md flex flex-col items-center justify-center text-xs transition-all duration-200",
                    "bg-muted/30 hover:bg-muted/70",
                    isPlaced ? "bg-primary/20 border-primary" : ""
                )}
            >
                {isPlaced ? (
                    <>
                        <div className="font-bold text-lg">{placedElements[element.atomicNumber].symbol}</div>
                        <div className="text-[10px]">{placedElements[element.atomicNumber].name}</div>
                    </>
                ) : (
                    <div className="text-muted-foreground/50">{element.atomicNumber}</div>
                )}
            </button>
        );
    };

    return (
        <Card className="relative">
            <SignedOut>
                <LoginWall title="Unlock Element Quest" description="Sign up to play this periodic table game, test your chemistry knowledge, and master the elements." />
            </SignedOut>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Atom /> Element Quest</CardTitle>
                <CardDescription>Place the elements in their correct positions on the periodic table before time runs out!</CardDescription>
            </CardHeader>
            <CardContent>
                {gameState === 'selecting' ? (
                    <div className="text-center space-y-6 py-10">
                        <h2 className="text-2xl font-bold">Select a Block to Begin</h2>
                        <Tabs defaultValue="s" className="w-full max-w-md mx-auto">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="s" onClick={() => startGame('s')}>S-Block</TabsTrigger>
                                <TabsTrigger value="p" onClick={() => startGame('p')}>P-Block</TabsTrigger>
                                <TabsTrigger value="d" onClick={() => startGame('d')}>D-Block</TabsTrigger>
                                <TabsTrigger value="f" disabled>F-Block</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                ) : gameState === 'gameOver' ? (
                     <div className="text-center space-y-6 py-10">
                        <h2 className="text-2xl font-bold">{lives > 0 ? "Block Completed!" : "Game Over!"}</h2>
                        <p className="text-muted-foreground">Your final score is <span className="font-bold text-primary">{score}</span>.</p>
                        <Button onClick={() => setGameState('selecting')}><RotateCw className="mr-2"/> Play Again</Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-muted p-3 rounded-lg">
                            <div className="font-bold text-lg">Place: <span className="text-primary">{currentElement?.name} ({currentElement?.atomicNumber})</span></div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 font-bold"><Clock className="h-5 w-5"/> {timeLeft}s</div>
                                <div className="flex items-center gap-2 font-bold"><Award className="h-5 w-5 text-green-500"/> {score}</div>
                                <div className="flex items-center gap-2">
                                    {[...Array(lives)].map((_, i) => <Heart key={i} className="h-5 w-5 text-red-500 fill-red-500"/>)}
                                    {[...Array(MAX_LIVES - lives)].map((_, i) => <Heart key={i} className="h-5 w-5 text-muted-foreground/50"/>)}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1">
                            {/* Create a full 7x18 grid representation */}
                            {Array.from({ length: 7 * 18 }).map((_, index) => {
                                const period = Math.floor(index / 18) + 1;
                                const group = (index % 18) + 1;
                                return renderCell(period, group);
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
