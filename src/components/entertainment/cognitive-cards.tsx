
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignedOut } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LoginWall } from '../ui/login-wall';
import { Award, BrainCircuit, Check, CheckCircle, Copy, FlaskConical, Play, RotateCw, Sigma } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';

interface CardItem {
  id: number;
  value: string;
  type: string; // To match pairs, e.g. 'H' or 'Pythagoras'
}

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

const createDeck = (pairs: [string, string][]): CardItem[] => {
    const deck: CardItem[] = [];
    pairs.forEach(([item1, item2], index) => {
        deck.push({ id: index * 2, value: item1, type: String(index) });
        deck.push({ id: index * 2 + 1, value: item2, type: String(index) });
    });
    return shuffleArray(deck);
};

const DECKS = {
    chemistry: createDeck([
        ['H', 'H'], ['He', 'He'], ['Li', 'Li'], ['Be', 'Be'], ['B', 'B'], ['C', 'C'], 
        ['N', 'N'], ['O', 'O'], ['F', 'F'], ['Ne', 'Ne'], ['Na', 'Na'], ['Mg', 'Mg']
    ]),
    math: createDeck([
        ['a²+b²=c²', 'Pythagoras'], ['πr²', 'Area'], ['2πr', 'Circum.'], ['l×w', 'Rectangle'], ['(a+b)²','a²+2ab+b²'], ['√-1', 'i'],
    ]),
    icons: createDeck([
        ['Award', 'Award'], ['BrainCircuit', 'BrainCircuit'], ['Check', 'Check'], ['Copy', 'Copy'], ['FlaskConical', 'FlaskConical'], ['Play', 'Play'], ['RotateCw', 'RotateCw'], ['Sigma', 'Sigma']
    ])
};

const LEVEL_CONFIG = {
    1: { pairs: 6, grid: 'grid-cols-4', time: 60 },
    2: { pairs: 8, grid: 'grid-cols-4', time: 75 },
    3: { pairs: 12, grid: 'grid-cols-6', time: 90 },
};

type DeckCategory = keyof typeof DECKS;
type Level = keyof typeof LEVEL_CONFIG;

export function CognitiveCardsGame() {
    const { isSignedIn } = useUser();
    const { toast } = useToast();
    
    const [deckCategory, setDeckCategory] = useState<DeckCategory>('icons');
    const [level, setLevel] = useState<Level>(1);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
    
    const [cards, setCards] = useState<CardItem[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [matched, setMatched] = useState<string[]>([]);
    const [timeLeft, setTimeLeft] = useState(LEVEL_CONFIG[level].time);
    const [score, setScore] = useState(0);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const setupGame = useCallback(() => {
        const fullDeck = DECKS[deckCategory];
        const gamePairs = LEVEL_CONFIG[level].pairs;
        const deckSlice = fullDeck.slice(0, gamePairs * 2);
        
        setCards(shuffleArray(deckSlice));
        setFlipped([]);
        setMatched([]);
        setTimeLeft(LEVEL_CONFIG[level].time);
        setGameState('playing');
    }, [level, deckCategory]);
    
     const startTimer = useCallback(() => {
        stopTimer();
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    stopTimer();
                    setGameState('lost');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const stopTimer = () => {
        if(timerRef.current) clearInterval(timerRef.current);
    }
    
    useEffect(() => {
        if(gameState === 'playing') {
            startTimer();
        } else {
            stopTimer();
        }
        return stopTimer;
    }, [gameState, startTimer]);


    const handleCardClick = (index: number) => {
        if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].type)) {
            return;
        }

        const newFlipped = [...flipped, index];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            const firstCard = cards[newFlipped[0]];
            const secondCard = cards[newFlipped[1]];

            if (firstCard.type === secondCard.type) {
                setMatched(prev => [...prev, firstCard.type]);
                setScore(s => s + 10);
                setFlipped([]);
            } else {
                setTimeout(() => {
                    setFlipped([]);
                }, 1000);
            }
        }
    };
    
    useEffect(() => {
        if (cards.length > 0 && matched.length === cards.length / 2) {
            setGameState('won');
            const bonus = timeLeft * 2;
            setScore(s => s + bonus);
            toast({ title: `Level Complete! +${bonus} time bonus!`, className: 'bg-green-500/10' });
        }
    }, [matched, cards, timeLeft, toast]);

    const handleRestart = () => {
        setScore(0);
        setupGame();
    }
    
    const handleNextLevel = () => {
        if (level < 3) {
            const nextLevel = (level + 1) as Level;
            setLevel(nextLevel);
            setScore(0);
            setTimeLeft(LEVEL_CONFIG[nextLevel].time);
            setGameState('idle');
        } else {
             setGameState('idle');
             setLevel(1);
             setScore(0);
             toast({ title: "Congratulations! You've completed all levels." });
        }
    }
    
    const Icon = ({ name }: { name: string }) => {
        const Icons: Record<string, React.ElementType> = { Award, BrainCircuit, Check, Copy, FlaskConical, Play, RotateCw, Sigma };
        const LucideIcon = Icons[name];
        return LucideIcon ? <LucideIcon className="h-10 w-10" /> : null;
    }


    const renderCardContent = (card: CardItem) => {
        if(deckCategory === 'icons') return <Icon name={card.value}/>;
        if(deckCategory === 'math') return <span className="text-lg font-bold text-center">{card.value}</span>;
        return <span className="text-4xl font-black">{card.value}</span>;
    }


    if (gameState === 'idle') {
        return (
            <Card className="w-full max-w-lg mx-auto">
                 <SignedOut><LoginWall title="Unlock Cognitive Cards" description="Sign up to play this card matching game and test your memory."/></SignedOut>
                <CardHeader>
                    <CardTitle>Cognitive Cards</CardTitle>
                    <CardDescription>Choose a deck and level to start.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label>Deck</Label>
                        <Tabs value={deckCategory} onValueChange={(v) => setDeckCategory(v as DeckCategory)} className="w-full mt-2">
                             <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="icons"><Copy className="mr-2 h-4 w-4"/> Icons</TabsTrigger>
                                <TabsTrigger value="chemistry"><FlaskConical className="mr-2 h-4 w-4"/> Chemistry</TabsTrigger>
                                <TabsTrigger value="math"><Sigma className="mr-2 h-4 w-4"/> Math</TabsTrigger>
                             </TabsList>
                        </Tabs>
                    </div>
                     <div>
                        <Label>Level</Label>
                        <Tabs value={String(level)} onValueChange={(v) => setLevel(Number(v) as Level)} className="w-full mt-2">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="1">Easy</TabsTrigger>
                                <TabsTrigger value="2">Medium</TabsTrigger>
                                <TabsTrigger value="3">Hard</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                    <Button onClick={setupGame} className="w-full" disabled={!isSignedIn}>
                        <Play className="mr-2"/> Start Game
                    </Button>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Level {level} - {deckCategory.charAt(0).toUpperCase() + deckCategory.slice(1)}</CardTitle>
                    <div className="flex items-center gap-4">
                        <div className="font-bold">Score: {score}</div>
                        <div className="font-mono font-bold">Time: {timeLeft}s</div>
                    </div>
                </div>
                 <Progress value={(timeLeft / LEVEL_CONFIG[level].time) * 100} className="h-2 mt-2" />
            </CardHeader>
            <CardContent>
                <div className={cn("grid gap-2 sm:gap-4 justify-center", LEVEL_CONFIG[level].grid)}>
                    {cards.map((card, index) => {
                        const isFlipped = flipped.includes(index) || matched.includes(card.type);
                        return (
                             <div key={index} className="relative aspect-square cursor-pointer" onClick={() => handleCardClick(index)}>
                                <motion.div 
                                    className="absolute w-full h-full rounded-lg flex items-center justify-center bg-primary text-primary-foreground text-3xl font-bold shadow-lg"
                                    style={{ backfaceVisibility: 'hidden' }}
                                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    ?
                                </motion.div>
                                <motion.div 
                                     className="absolute w-full h-full rounded-lg flex items-center justify-center bg-muted"
                                    style={{ backfaceVisibility: 'hidden' }}
                                    initial={{ rotateY: 180 }}
                                    animate={{ rotateY: isFlipped ? 0 : -180 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {renderCardContent(card)}
                                </motion.div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
             <AnimatePresence>
                {(gameState === 'won' || gameState === 'lost') && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white space-y-4 p-4 z-10">
                        <h2 className="text-4xl font-bold">{gameState === 'won' ? 'You Won!' : 'Time\'s Up!'}</h2>
                        <p>Your score: {score}</p>
                        <div className="flex gap-4">
                            <Button variant="outline" onClick={handleRestart}>Retry Level</Button>
                            {gameState === 'won' && <Button onClick={handleNextLevel}>{level < 3 ? 'Next Level' : 'Finish'}</Button>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
