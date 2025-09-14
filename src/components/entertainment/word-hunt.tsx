
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { useUsers } from '@/hooks/use-admin';
import { Award, Brain, Clock, Loader2, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/use-local-storage';

const GAME_WORDS = ['REACT', 'FIREBASE', 'NEXTJS', 'TAILWIND', 'LEGEND', 'AWESOME', 'STUDIO', 'AGENT', 'GENKIT'];

const LEVEL_CONFIG = {
    1: { time: 30, reward: 1, wordLength: 5 },
    2: { time: 25, reward: 1, wordLength: 6 },
    3: { time: 20, reward: 2, wordLength: 7 },
    4: { time: 15, reward: 5, wordLength: 8 },
    5: { time: 10, reward: 10, wordLength: 8 },
};
type Level = keyof typeof LEVEL_CONFIG;

const shuffle = (array: string[]) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

export function WordHuntGame() {
    const { user } = useUser();
    const { toast } = useToast();
    const { addCreditsToUser } = useUsers();

    const [level, setLevel] = useLocalStorage<Level>('wordHuntLevel', 1);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
    const [currentWord, setCurrentWord] = useState('');
    const [letterPool, setLetterPool] = useState<string[]>([]);
    const [guess, setGuess] = useState<(string | null)[]>([]);
    const [timeLeft, setTimeLeft] = useState(LEVEL_CONFIG[level].time);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const setupLevel = useCallback(() => {
        const config = LEVEL_CONFIG[level];
        const possibleWords = GAME_WORDS.filter(w => w.length === config.wordLength);
        const word = possibleWords[Math.floor(Math.random() * possibleWords.length)];
        setCurrentWord(word);
        setGuess(Array(word.length).fill(null));
        setLetterPool(shuffle(word.split('')));
        setTimeLeft(config.time);
    }, [level]);

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };
    
    const startTimer = () => {
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
    };

    const startGame = () => {
        setupLevel();
        setGameState('playing');
        startTimer();
    };

    const handleLetterClick = (letter: string, index: number) => {
        const firstEmptyIndex = guess.findIndex(g => g === null);
        if (firstEmptyIndex !== -1) {
            const newGuess = [...guess];
            newGuess[firstEmptyIndex] = letter;
            setGuess(newGuess);

            const newPool = [...letterPool];
            newPool.splice(index, 1);
            setLetterPool(newPool);
        }
    };

    const handleGuessBoxClick = (index: number) => {
        const letter = guess[index];
        if (letter !== null) {
            const newGuess = [...guess];
            newGuess[index] = null;
            setGuess(newGuess);
            setLetterPool(prev => [...prev, letter]);
        }
    };

    useEffect(() => {
        if (gameState === 'playing' && !guess.includes(null)) {
            const finalGuess = guess.join('');
            if (finalGuess === currentWord) {
                stopTimer();
                const reward = LEVEL_CONFIG[level].reward;
                if (user) {
                    addCreditsToUser(user.id, reward);
                }
                toast({
                    title: `Level ${level} Complete!`,
                    description: `You earned ${reward} credits!`,
                    className: "bg-green-500/10 text-green-700 border-green-500/50"
                });
                setGameState('won');
            }
        }
    }, [guess, currentWord, gameState, level, user, addCreditsToUser, toast]);
    
    const nextLevel = () => {
        if(level < 5) {
            setLevel(prev => (prev + 1) as Level);
            setGameState('idle');
        } else {
            // Reached max level
            toast({ title: "Master Word Hunter!", description: "You've beaten all levels!" });
            setLevel(1); // Reset to level 1 for replayability
            setGameState('idle');
        }
    };
    
    const retryLevel = () => {
        setGameState('idle');
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Word Hunt</CardTitle>
                <CardDescription>Form the word from the letters below before time runs out!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col items-center">
                <div className="w-full flex justify-between items-center bg-muted p-2 rounded-lg">
                     <div className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-500"/>
                        Level: <span className="font-bold">{level}</span>
                    </div>
                     <div className="flex items-center gap-2 text-sm font-mono">
                        <Clock className={cn("h-4 w-4", timeLeft <= 5 && gameState === 'playing' && "text-destructive")}/>
                        <span className={cn(timeLeft <= 5 && gameState === 'playing' && "text-destructive font-bold")}>{timeLeft}s</span>
                    </div>
                </div>

                {gameState === 'idle' && (
                    <div className="min-h-[200px] flex flex-col justify-center items-center">
                        <Button onClick={startGame} size="lg">Start Level {level}</Button>
                    </div>
                )}
                 {gameState === 'won' && (
                    <div className="min-h-[200px] flex flex-col justify-center items-center text-center">
                        <Sparkles className="h-12 w-12 text-yellow-400 mb-4"/>
                        <h3 className="text-2xl font-bold">You did it!</h3>
                        <p className="text-muted-foreground">The word was <span className="font-bold text-primary">{currentWord}</span></p>
                        <Button onClick={nextLevel} className="mt-4">Next Level</Button>
                    </div>
                )}
                {gameState === 'lost' && (
                     <div className="min-h-[200px] flex flex-col justify-center items-center text-center">
                        <Clock className="h-12 w-12 text-destructive mb-4"/>
                        <h3 className="text-2xl font-bold">Time's Up!</h3>
                        <p className="text-muted-foreground">The word was <span className="font-bold text-primary">{currentWord}</span></p>
                        <Button onClick={retryLevel} className="mt-4">Try Again</Button>
                    </div>
                )}
                {gameState === 'playing' && (
                    <div className="space-y-8 w-full flex flex-col items-center">
                         {/* Guess Boxes */}
                        <div className="flex gap-2 justify-center flex-wrap">
                             <AnimatePresence>
                                {guess.map((letter, index) => (
                                    <motion.div
                                        key={`guess-${index}`}
                                        layout
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="h-16 w-14 bg-background border-2 border-dashed rounded-lg flex items-center justify-center text-3xl font-bold cursor-pointer"
                                        onClick={() => handleGuessBoxClick(index)}
                                    >
                                        {letter}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        {/* Letter Pool */}
                        <div className="flex gap-2 justify-center flex-wrap max-w-sm">
                            <AnimatePresence>
                                {letterPool.map((letter, index) => (
                                    <motion.button
                                        key={`pool-${letter}-${index}`}
                                        layout
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.5, opacity: 0 }}
                                        onClick={() => handleLetterClick(letter, index)}
                                        className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center text-2xl font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                                    >
                                        {letter}
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
