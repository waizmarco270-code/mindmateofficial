
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignedOut } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { useUsers } from '@/hooks/use-admin';
import { Award, Brain, Clock, Loader2, Sparkles, Star, Code, FlaskConical, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isToday } from 'date-fns';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { LoginWall } from '../ui/login-wall';


const WORD_CATEGORIES = {
    programming: [
        'AGENT', 'GENKIT', 'REACT', 'STATE', 'QUERY', 'ARRAY', 'PROXY', 'CACHE', 'DEBUG', 'BUILD'
    ],
    science: [
        'ATOM', 'FORCE', 'CELL', 'GENE', 'ORBIT', 'PULSE', 'WAVE', 'LUNAR', 'SOLAR', 'FLORA'
    ],
    general: [
        'ECHO', 'MYTH', 'EPIC', 'QUEST', 'ZEN', 'QUICK', 'BROWN', 'JUMPS', 'LAZY', 'DOG'
    ]
};
type WordCategory = keyof typeof WORD_CATEGORIES;

const LEVEL_CONFIG = {
    1: { time: 50, reward: 1, words: WORD_CATEGORIES.programming.filter(w => w.length <= 5) },
    2: { time: 40, reward: 1, words: WORD_CATEGORIES.science.filter(w => w.length <= 5) },
    3: { time: 30, reward: 2, words: [...WORD_CATEGORIES.programming, ...WORD_CATEGORIES.science].filter(w => w.length > 5) },
    4: { time: 20, reward: 5, words: WORD_CATEGORIES.general.filter(w => w.length <= 5) },
    5: { time: 15, reward: 10, words: [...WORD_CATEGORIES.programming, ...WORD_CATEGORIES.general].filter(w => w.length > 5) }
};
type Level = keyof typeof LEVEL_CONFIG;

const DAILY_WORD_LIMIT = 5;

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
    const { user, isSignedIn } = useUser();
    const { toast } = useToast();
    const { addCreditsToUser } = useUsers();

    const [level, setLevel] = useState<Level>(1);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost' | 'completed'>('idle');
    const [currentWord, setCurrentWord] = useState('');
    const [letterPool, setLetterPool] = useState<string[]>([]);
    const [guess, setGuess] = useState<(string | null)[]>([]);
    const [timeLeft, setTimeLeft] = useState(LEVEL_CONFIG[level].time);
    const [solvedTodayCount, setSolvedTodayCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch daily progress
    useEffect(() => {
        const checkDailyProgress = async () => {
            setIsLoading(true);
            if (!user) {
                setSolvedTodayCount(0);
                setIsLoading(false);
                return;
            }
            const progressDocRef = doc(db, 'users', user.id, 'dailyClaims', 'wordHunt');
            const docSnap = await getDoc(progressDocRef);

            if (docSnap.exists() && isToday(docSnap.data().lastPlayed.toDate())) {
                const count = docSnap.data().solvedCount || 0;
                setSolvedTodayCount(count);
                if (count >= DAILY_WORD_LIMIT) {
                    setGameState('completed');
                }
            } else {
                setSolvedTodayCount(0);
            }
            setIsLoading(false);
        };
        checkDailyProgress();
    }, [user]);

    const setupLevel = useCallback(() => {
        const config = LEVEL_CONFIG[level];
        const possibleWords = config.words;
        if (possibleWords.length === 0) {
            // Fallback if a level has no words
            setGameState('completed');
            toast({title: "No words for this level!", variant: "destructive"});
            return;
        }
        const word = possibleWords[Math.floor(Math.random() * possibleWords.length)];
        setCurrentWord(word);
        setGuess(Array(word.length).fill(null));
        setLetterPool(shuffle(word.split('')));
        setTimeLeft(config.time);
    }, [level, toast]);

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
        if (solvedTodayCount >= DAILY_WORD_LIMIT) {
            setGameState('completed');
            return;
        }
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
            // Re-shuffle the pool to make it less predictable
            setLetterPool(prev => shuffle([...prev, letter]));
        }
    };
    
    const handleWin = useCallback(async () => {
        stopTimer();
        const reward = LEVEL_CONFIG[level].reward;
        
        if (user && solvedTodayCount < DAILY_WORD_LIMIT) {
            const newSolvedCount = solvedTodayCount + 1;
            setSolvedTodayCount(newSolvedCount);
            
            await addCreditsToUser(user.id, reward);
            
            const progressDocRef = doc(db, 'users', user.id, 'dailyClaims', 'wordHunt');
            await setDoc(progressDocRef, { 
                lastPlayed: Timestamp.now(),
                solvedCount: newSolvedCount
            }, { merge: true });

            toast({
                title: `Level ${level} Complete!`,
                description: `You earned ${reward} credits!`,
                className: "bg-green-500/10 text-green-700 border-green-500/50"
            });
        } else if (!user) {
             toast({
                title: `Level ${level} Complete!`,
                description: `Login to save progress and earn rewards!`,
            });
        }
        
        setGameState('won');

    }, [level, user, solvedTodayCount, addCreditsToUser, toast]);


    useEffect(() => {
        if (gameState === 'playing' && !guess.includes(null)) {
            const finalGuess = guess.join('');
            if (finalGuess === currentWord) {
                handleWin();
            } else {
                 toast({ variant: 'destructive', title: "Not quite!", description: "The letters don't form the right word. Try again!" });
            }
        }
    }, [guess, currentWord, gameState, handleWin, toast]);
    
    const nextLevel = () => {
        if (solvedTodayCount >= DAILY_WORD_LIMIT) {
            setGameState('completed');
            return;
        }

        if(level < 5) {
            setLevel(prev => (prev + 1) as Level);
            setGameState('idle');
        } else {
            toast({ title: "Master Word Hunter!", description: "You've beaten all levels! They reset tomorrow." });
            setGameState('completed');
        }
    };
    
    const retryLevel = () => {
        setGameState('idle');
    }

    if (isLoading) {
        return (
             <Card className="w-full relative">
                <CardHeader>
                    <CardTitle>Word Hunt</CardTitle>
                    <CardDescription>Unscramble the letters to form a word before time runs out!</CardDescription>
                </CardHeader>
                <CardContent className="min-h-[250px] flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full bg-gradient-to-br from-card to-muted/50 overflow-hidden relative">
             <SignedOut>
                <LoginWall title="Unlock Word Hunt" description="Sign up to play this unscrambling game, earn daily rewards, and track your progress." />
            </SignedOut>
            <CardHeader>
                <CardTitle>Word Hunt</CardTitle>
                <CardDescription>Unscramble the letters to form a word before time runs out!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col items-center">
                <div className="w-full flex justify-between items-center bg-background/50 p-2 rounded-lg border">
                     <div className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-500"/>
                        Level: <span className="font-bold">{level}</span>
                    </div>
                     <div className="flex items-center gap-2 text-sm font-mono">
                        <Clock className={cn("h-4 w-4", timeLeft <= 5 && gameState === 'playing' && "text-destructive")}/>
                        <span className={cn(timeLeft <= 5 && gameState === 'playing' && "text-destructive font-bold")}>{timeLeft}s</span>
                    </div>
                     <div className="flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-green-500"/>
                        Solved Today: <span className="font-bold">{solvedTodayCount} / {DAILY_WORD_LIMIT}</span>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {gameState === 'idle' && (
                        <motion.div key="idle" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -20}} className="min-h-[200px] flex flex-col justify-center items-center">
                            <Button onClick={startGame} size="lg" className="shadow-lg shadow-primary/20" disabled={!isSignedIn}>Start Level {level}</Button>
                        </motion.div>
                    )}
                    {gameState === 'completed' && (
                         <motion.div key="completed" initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}} className="min-h-[200px] flex flex-col justify-center items-center text-center">
                            <Award className="h-12 w-12 text-green-400 mb-4"/>
                            <h3 className="text-2xl font-bold">Daily Limit Reached!</h3>
                            <p className="text-muted-foreground">You've solved {DAILY_WORD_LIMIT} words today. Come back tomorrow for more!</p>
                        </motion.div>
                    )}
                    {gameState === 'won' && (
                        <motion.div key="won" initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}} className="min-h-[200px] flex flex-col justify-center items-center text-center">
                            <Sparkles className="h-12 w-12 text-yellow-400 mb-4"/>
                            <h3 className="text-2xl font-bold">You did it!</h3>
                            <p className="text-muted-foreground">The word was <span className="font-bold text-primary">{currentWord}</span></p>
                            <Button onClick={nextLevel} className="mt-4">Next Level</Button>
                        </motion.div>
                    )}
                    {gameState === 'lost' && (
                        <motion.div key="lost" initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}} className="min-h-[200px] flex flex-col justify-center items-center text-center">
                            <Clock className="h-12 w-12 text-destructive mb-4"/>
                            <h3 className="text-2xl font-bold">Time's Up!</h3>
                            <p className="text-muted-foreground">The word was <span className="font-bold text-primary">{currentWord}</span></p>
                            <Button onClick={retryLevel} className="mt-4">Try Again</Button>
                        </motion.div>
                    )}
                    {gameState === 'playing' && (
                        <motion.div key="playing" initial={{opacity: 0}} animate={{opacity: 1}} className="space-y-8 w-full flex flex-col items-center">
                            {/* Guess Boxes */}
                            <div className="flex gap-2 justify-center flex-wrap">
                                {guess.map((letter, index) => (
                                    <motion.div
                                        key={`guess-${index}`}
                                        layout
                                        className="h-16 w-14 bg-background/50 border-2 border-dashed rounded-lg flex items-center justify-center text-3xl font-bold cursor-pointer"
                                        onClick={() => handleGuessBoxClick(index)}
                                    >
                                        <AnimatePresence>
                                        {letter && <motion.span initial={{scale: 0.5, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.5, opacity: 0}}>{letter}</motion.span>}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
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
                                            whileHover={{scale: 1.1}}
                                            whileTap={{scale: 0.9}}
                                            onClick={() => handleLetterClick(letter, index)}
                                            className="h-14 w-12 bg-muted/50 rounded-lg flex items-center justify-center text-2xl font-semibold hover:bg-primary hover:text-primary-foreground transition-colors shadow-md border"
                                        >
                                            {letter}
                                        </motion.button>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
