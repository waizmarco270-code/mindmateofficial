
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, BrainCircuit, Check, Clock, Loader2, Play, RotateCw, Sigma, Sparkles, Trophy, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignedOut } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { useUsers } from '@/hooks/use-admin';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';
import { LoginWall } from '../ui/login-wall';
import { startOfWeek, format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';


interface LevelData {
    question: string;
    options: number[];
    answer: number;
    time: number;
}

// Generates a random integer between min (inclusive) and max (inclusive)
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateQuestion = (level: number): LevelData => {
    let question = '';
    let answer = 0;
    const options: number[] = [];
    // Time decreases as level increases, minimum 10 seconds
    const time = Math.max(10, 35 - Math.floor(level / 1.5));

    if (level <= 5) { // Basic Addition/Subtraction
        const a = randInt(level * 2, level * 10);
        const b = randInt(level * 2, level * 10);
        if (Math.random() > 0.5) {
            question = `${a} + ${b} = ?`;
            answer = a + b;
        } else {
            question = `${a + b} - ${b} = ?`;
            answer = a;
        }
    } else if (level <= 15) { // Multiplication & Division
        const a = randInt(level, level + 10);
        const b = randInt(2, 12);
        if (Math.random() > 0.5) {
            question = `${a} × ${b} = ?`;
            answer = a * b;
        } else {
            question = `${a * b} ÷ ${b} = ?`;
            answer = a;
        }
    } else if (level <= 25) { // Two-step equations
        const a = randInt(2, 10);
        const b = randInt(5, 25);
        const x = randInt(3, 15);
        if (Math.random() > 0.5) {
            question = `${a}x + ${b} = ${a * x + b}`;
            answer = x;
        } else {
             question = `${a}x - ${b} = ${a * x - b}`;
            answer = x;
        }
    } else if (level <= 35) { // Percentages and Squares
         if (Math.random() > 0.5) {
            const perc = randInt(10, 50);
            const num = randInt(20, 200);
            question = `${perc}% of ${num} = ?`;
            answer = (perc / 100) * num;
        } else {
            const base = randInt(level - 20, level - 10);
            question = `${base}² = ?`;
            answer = base * base;
        }
    } else if (level <= 49) { // Multi-step / Simple Quadratics
        const a = randInt(2, 5);
        const root1 = randInt(1, 10);
        const root2 = randInt(-5, 12);
        if (Math.random() > 0.6) { // Quadratic
            // (x - r1)(x - r2) = x^2 - (r1+r2)x + r1*r2
            const c = root1 * root2;
            const b = -(root1 + root2);
            question = `Find a root of: x² ${b >= 0 ? '+' : '-'} ${Math.abs(b)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)} = 0`;
            answer = Math.random() > 0.5 ? root1 : root2;
        } else { // Multi-step linear
            const x = randInt(5, 15);
            const b = randInt(10, 50);
            const c = randInt(10, 50);
            question = `${a}(x + ${b}) = ${c}`;
            // ax + ab = c => x = (c - ab) / a
            answer = (c - a*b) / a;
            // Ensure integer answer for simplicity
             if(!Number.isInteger(answer)) {
                return generateQuestion(level); // Recurse if answer is not an integer
            }
        }
    } else { // Level 50 - The Legend Challenge
        const a = randInt(11, 20);
        const b = randInt(21, 30);
        question = `(${a} + ${b}) × (${b - a}) = ?`;
        answer = (a+b) * (b-a); // (b^2 - a^2)
    }
    
    // Generate distractors
    options.push(answer);
    while (options.length < 4) {
        let wrongAnswer;
        if(answer > 100) {
            wrongAnswer = answer + randInt(-20, 20);
        } else {
            wrongAnswer = randInt(Math.max(1, answer - 15), answer + 15);
        }
        if (!options.includes(wrongAnswer) && wrongAnswer !== answer) {
            options.push(wrongAnswer);
        }
    }

    return { question, options: options.sort(() => Math.random() - 0.5), answer, time };
}

export function MathematicsLegendGame() {
    const { user, isSignedIn } = useUser();
    const { toast } = useToast();
    const { currentUserData, updateGameHighScore, claimMathematicsLegendMilestone } = useUsers();
    
    const [level, setLevel] = useState(1);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver' | 'completed'>('idle');
    const [currentQuestion, setCurrentQuestion] = useState<LevelData | null>(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [highScore, setHighScore] = useState(0);
    const [claimedFinalReward, setClaimedFinalReward] = useState(false);
    
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if(currentUserData?.gameHighScores?.mathematicsLegend) {
            setHighScore(currentUserData.gameHighScores.mathematicsLegend);
        }
        if (currentUserData?.mathematicsLegendClaims) {
            const weekKey = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
            if (currentUserData.mathematicsLegendClaims[weekKey]?.includes(50)) {
                setClaimedFinalReward(true);
            }
        }
    }, [currentUserData]);

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const setupLevel = (lvl: number) => {
        const questionData = generateQuestion(lvl);
        setCurrentQuestion(questionData);
        setTimeLeft(questionData.time);
    };
    
    const startGame = () => {
        setLevel(1);
        setGameState('playing');
        setupLevel(1);
    };
    
    useEffect(() => {
        if(gameState === 'playing') {
            stopTimer();
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        stopTimer();
                        setGameState('gameOver');
                        toast({ title: "Time's up!", variant: "destructive" });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            stopTimer();
        }
        return stopTimer;
    }, [gameState, currentQuestion, toast]);


    const handleAnswer = async (option: number) => {
        if (gameState !== 'playing') return;

        stopTimer();
        const isCorrect = option === currentQuestion?.answer;

        if (isCorrect) {
            if (level === 50) {
                setGameState('completed');
                if (50 > highScore) {
                    setHighScore(50);
                    if (user) updateGameHighScore(user.id, 'mathematicsLegend', 50);
                }
                toast({ title: "LEGEND!", description: "You've conquered all 50 levels!", className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/50" });
                return;
            }

            toast({ title: `Level ${level} Passed!`, className: "bg-green-500/10 text-green-700 border-green-500/50" });
            
            const nextLevel = level + 1;
             if (nextLevel > highScore) {
                setHighScore(nextLevel);
                if (user) updateGameHighScore(user.id, 'mathematicsLegend', nextLevel);
            }
            
            setTimeout(() => {
                setLevel(nextLevel);
                setupLevel(nextLevel);
                setGameState('playing');
            }, 1000);

        } else {
            setGameState('gameOver');
            toast({ variant: "destructive", title: "Incorrect!", description: `The correct answer was ${currentQuestion?.answer}.` });
        }
    };
    
    const handleClaimReward = async () => {
        if (!user) return;
        const success = await claimMathematicsLegendMilestone(user.id, 50);
        if (success) {
            toast({title: "Jackpot!", description: "200 Credits have been added to your account!"});
            setClaimedFinalReward(true);
        } else {
            toast({variant: 'destructive', title: "Claim Failed", description: "You might have already claimed this weekly reward."})
        }
    }
    
    return (
        <Card className="w-full max-w-lg mx-auto relative">
             <SignedOut>
                <LoginWall title="Unlock Mathematics Legend" description="Sign up to play this 50-level math challenge, track your high score, and earn credit rewards." />
            </SignedOut>
            <CardHeader>
                <CardTitle>Mathematics Legend</CardTitle>
                <CardDescription>Solve 50 levels of math problems against the clock.</CardDescription>
            </CardHeader>
             <CardContent className="min-h-[400px] flex flex-col justify-center items-center">
                <AnimatePresence mode="wait">
                    {gameState === 'idle' && (
                        <motion.div key="idle" initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} className="text-center space-y-4">
                            <Button size="lg" onClick={startGame} disabled={!isSignedIn}><Play className="mr-2"/> Start Challenge</Button>
                        </motion.div>
                    )}
                    {(gameState === 'gameOver' || gameState === 'completed') && (
                        <motion.div key="end" initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} className="text-center space-y-4 p-4">
                             <Trophy className={cn("h-16 w-16 mx-auto", gameState === 'completed' ? 'text-yellow-400' : 'text-muted-foreground')}/>
                             <h2 className="text-3xl font-bold">
                                {gameState === 'completed' ? 'You are a Mathematics Legend!' : 'Game Over'}
                            </h2>
                            <p className="text-muted-foreground">You reached level {level}. Your high score is {highScore}.</p>
                            {gameState === 'completed' && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className="bg-green-600 hover:bg-green-700" disabled={claimedFinalReward}>
                                            <Award className="mr-2"/>
                                            {claimedFinalReward ? "Reward Claimed" : "Claim 200 Credits"}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Claim Your Legendary Reward?</AlertDialogTitle>
                                            <AlertDialogDescription>This will award you 200 credits for completing all 50 levels. This reward can be claimed once per week.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleClaimReward}>Claim Now</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                            <Button onClick={startGame} variant={gameState === 'completed' ? "outline" : "default"}>
                                <RotateCw className="mr-2 h-4 w-4"/> Play Again
                            </Button>
                        </motion.div>
                    )}
                    {gameState === 'playing' && currentQuestion && (
                         <motion.div key={level} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="w-full text-center space-y-8">
                             <div className="flex justify-between items-center text-sm font-semibold">
                                <span>Level: {level}</span>
                                <span>High Score: {highScore}</span>
                            </div>
                            <Progress value={(timeLeft / currentQuestion.time) * 100} indicatorClassName={timeLeft <= 5 ? "bg-destructive" : ""} className="h-2"/>
                            
                            <div className="py-10 bg-muted rounded-lg min-h-[120px] flex items-center justify-center">
                                <p className="text-4xl font-bold font-mono tracking-wider">{currentQuestion.question}</p>
                            </div>
                            
                             <div className="grid grid-cols-2 gap-4">
                                {currentQuestion.options.map((option) => (
                                    <Button key={option} variant="outline" className="h-16 text-2xl font-bold" onClick={() => handleAnswer(option)}>
                                        {option}
                                    </Button>
                                ))}
                            </div>
                         </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
