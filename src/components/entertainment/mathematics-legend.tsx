
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

interface LevelData {
    question: string;
    options: number[];
    answer: number;
    time: number;
}

const generateQuestion = (level: number): LevelData => {
    let question = '';
    let answer = 0;
    const options: number[] = [];
    const time = Math.max(10, 30 - Math.floor(level / 2));

    if (level <= 10) { // Basic Arithmetic
        const a = Math.floor(Math.random() * (level * 5)) + 1;
        const b = Math.floor(Math.random() * (level * 5)) + 1;
        if (level <= 5) {
            question = `${a} + ${b} = ?`;
            answer = a + b;
        } else {
            if (Math.random() > 0.5) {
                question = `${a} + ${b} = ?`;
                answer = a + b;
            } else {
                const c = Math.max(a, b);
                const d = Math.min(a, b);
                question = `${c} - ${d} = ?`;
                answer = c - d;
            }
        }
    } else if (level <= 25) { // Multiplication & Division
        const a = Math.floor(Math.random() * level) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        if (level <= 15) {
             question = `${a} × ${b} = ?`;
             answer = a * b;
        } else {
            if (Math.random() > 0.5) {
                question = `${a} × ${b} = ?`;
                answer = a * b;
            } else {
                answer = a;
                question = `${a * b} ÷ ${b} = ?`;
            }
        }
    } else { // Simple Algebra
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        const c = Math.floor(Math.random() * 20) + 1;
        if (level <= 40) {
            question = `${a}x + ${b} = ${a*c + b}`;
            answer = c;
        } else {
            question = `${a}x - ${b} = ${a*c - b}`;
            answer = c;
        }
    }
    
    options.push(answer);
    while (options.length < 4) {
        const wrongAnswer = answer + (Math.floor(Math.random() * 10) + 1) * (Math.random() > 0.5 ? 1 : -1);
        if (!options.includes(wrongAnswer) && wrongAnswer !== answer && wrongAnswer > 0) {
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
    const [claimedMilestones, setClaimedMilestones] = useState<number[]>([]);
    
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if(currentUserData?.gameHighScores?.mathematicsLegend) {
            setHighScore(currentUserData.gameHighScores.mathematicsLegend);
        }
        if (user && currentUserData?.mathematicsLegendClaims) {
            const weeklyClaims = currentUserData.mathematicsLegendClaims;
            const currentWeekKey = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
            setClaimedMilestones(weeklyClaims[currentWeekKey] || []);
        }
    }, [currentUserData, user]);

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

            if (nextLevel % 5 === 0 && !claimedMilestones.includes(nextLevel) && user) {
                const success = await claimMathematicsLegendMilestone(user.id, nextLevel);
                if(success) {
                    toast({ title: "Milestone!", description: "+5 credits earned!", className: "bg-primary/10 text-primary" });
                }
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
                        <motion.div key="end" initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} className="text-center space-y-4">
                             <Trophy className={cn("h-16 w-16 mx-auto", gameState === 'completed' ? 'text-yellow-400' : 'text-muted-foreground')}/>
                             <h2 className="text-3xl font-bold">
                                {gameState === 'completed' ? 'You are a Mathematics Legend!' : 'Game Over'}
                            </h2>
                            <p className="text-muted-foreground">You reached level {level}. Your high score is {highScore}.</p>
                            <Button onClick={startGame}><RotateCw className="mr-2"/> Play Again</Button>
                        </motion.div>
                    )}
                    {gameState === 'playing' && currentQuestion && (
                         <motion.div key={level} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="w-full text-center space-y-8">
                             <div className="flex justify-between items-center text-sm font-semibold">
                                <span>Level: {level}</span>
                                <span>High Score: {highScore}</span>
                            </div>
                            <Progress value={(timeLeft / currentQuestion.time) * 100} className="h-2" indicatorClassName={timeLeft <= 5 ? "bg-destructive" : ""} />
                            
                            <div className="py-10 bg-muted rounded-lg">
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
             <CardContent>
                <div className="pt-4 border-t">
                    <h4 className="font-bold text-foreground mb-2 text-center">Weekly Milestone Rewards (+5 Credits)</h4>
                    <div className="flex justify-center gap-2 flex-wrap">
                        {[...Array(10)].map((_, i) => {
                            const milestoneLevel = (i + 1) * 5;
                            const isClaimed = claimedMilestones.includes(milestoneLevel);
                            return (
                                <div key={milestoneLevel} className={cn("flex items-center gap-2 p-2 rounded-lg text-xs", isClaimed ? "bg-green-500/10 text-green-500" : "bg-muted")}>
                                    {isClaimed ? <Check className="h-4 w-4"/> : <Award className="h-4 w-4"/>}
                                    <span className={cn("font-semibold", isClaimed && "line-through")}>Level {milestoneLevel}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

    