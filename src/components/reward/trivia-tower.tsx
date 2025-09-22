'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Brain, Clock, Loader2, Play, AlertTriangle, TowerControl, Shield, DollarSign, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignedOut } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { useRewards } from '@/hooks/use-rewards';
import { useQuizzes, type QuizQuestion } from '@/hooks/use-quizzes';
import { cn } from '@/lib/utils';
import { LoginWall } from '../ui/login-wall';

const TOWER_LEVELS = 5;
const REWARDS_PER_LEVEL = [1, 2, 5, 15, 50];

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

export function TriviaTowerGame() {
    const { quizzes, loading: quizzesLoading } = useQuizzes();
    const { canPlayTriviaTower, playTriviaTower, loading: rewardsLoading } = useRewards();
    const { toast } = useToast();

    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentLevel, setCurrentLevel] = useState(0);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const loading = quizzesLoading || rewardsLoading;

    useEffect(() => {
        if (!loading && !canPlayTriviaTower) {
            setGameState('gameOver');
        }
    }, [canPlayTriviaTower, loading]);

    const startGame = () => {
        if (quizzes.length === 0) {
            toast({ variant: 'destructive', title: "No quizzes available", description: "Cannot start the game." });
            return;
        }
        const allQuestions = shuffleArray(quizzes.flatMap(q => q.questions)).slice(0, TOWER_LEVELS);
        setQuestions(allQuestions);
        setCurrentLevel(0);
        setIsAnswered(false);
        setSelectedOption(null);
        setGameState('playing');
    };

    const handleAnswer = (option: string) => {
        if (isAnswered) return;

        setIsAnswered(true);
        setSelectedOption(option);
        const correct = option === questions[currentLevel].correctAnswer;

        setTimeout(() => {
            if (correct) {
                if (currentLevel === TOWER_LEVELS - 1) {
                    // Won the final level
                    playTriviaTower(REWARDS_PER_LEVEL[currentLevel]);
                    setGameState('gameOver');
                } else {
                    // Correct, but not the final level. Handled by the cash out/risk it buttons.
                }
            } else {
                // Incorrect answer
                playTriviaTower(0); // This will mark the game as played for the day with 0 reward.
                setGameState('gameOver');
            }
        }, 1500);
    };
    
    const handleCashOut = () => {
        const reward = REWARDS_PER_LEVEL[currentLevel];
        playTriviaTower(reward);
        setGameState('gameOver');
    }
    
    const handleRiskIt = () => {
        setCurrentLevel(prev => prev + 1);
        setIsAnswered(false);
        setSelectedOption(null);
    }
    
    const renderContent = () => {
        if (loading) {
             return <div className="h-96 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>;
        }

        if (gameState === 'gameOver' || !canPlayTriviaTower) {
             return (
                <div className="h-96 flex flex-col items-center justify-center text-center space-y-4">
                    <TowerControl className="h-12 w-12 text-muted-foreground"/>
                    <h3 className="text-2xl font-bold">Daily Challenge Complete</h3>
                    <p className="text-muted-foreground">You've attempted the Trivia Tower for today. Come back tomorrow!</p>
                </div>
            );
        }

        if (gameState === 'idle') {
            return (
                <div className="h-96 flex flex-col items-center justify-center text-center space-y-4">
                    <Button onClick={startGame} size="lg">Start Trivia Tower</Button>
                </div>
            );
        }

        if(gameState === 'playing' && questions.length > 0) {
            const question = questions[currentLevel];
            const currentReward = REWARDS_PER_LEVEL[currentLevel];

            return (
                <div className="space-y-4">
                    <p className="text-xl font-semibold text-center min-h-[56px]">{question.text}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {question.options.map((option, i) => {
                            const isCorrect = option === question.correctAnswer;
                            const isSelected = option === selectedOption;
                            return (
                                <Button
                                    key={i}
                                    variant="outline"
                                    className={cn(
                                        "h-auto py-3 text-base whitespace-normal",
                                        isAnswered && isCorrect && "bg-green-500/20 border-green-500/50",
                                        isAnswered && isSelected && !isCorrect && "bg-destructive/20 border-destructive/50"
                                    )}
                                    onClick={() => handleAnswer(option)}
                                    disabled={isAnswered}
                                >
                                    {option}
                                </Button>
                            )
                        })}
                    </div>
                    {isAnswered && selectedOption === question.correctAnswer && (
                        <div className="pt-4 text-center space-y-3 animate-in fade-in-50">
                             <p className="font-bold text-green-500">Correct! Your current prize is {currentReward} credits.</p>
                             <div className="flex gap-4 justify-center">
                                <Button variant="secondary" onClick={handleCashOut}><DollarSign className="mr-2"/> Cash Out</Button>
                                <Button onClick={handleRiskIt}><Shield className="mr-2"/> Risk it for {REWARDS_PER_LEVEL[currentLevel+1]}!</Button>
                             </div>
                        </div>
                    )}
                </div>
            )
        }
        
        return null;
    }


    return (
         <Card className="w-full max-w-xl mx-auto relative">
            <SignedOut>
                <LoginWall title="Unlock Trivia Tower" description="Sign up to play this daily risk-vs-reward trivia game and win big!" />
            </SignedOut>
            <CardHeader>
                <CardTitle>Trivia Tower</CardTitle>
                <CardDescription>Answer questions to climb the tower. The higher you go, the bigger the prize... but get one wrong and you lose it all!</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Tower visualization */}
                <div className="flex justify-center items-end gap-2 mb-6 h-24">
                    {REWARDS_PER_LEVEL.map((reward, i) => (
                        <div key={i} className={cn("w-12 rounded-t-md border-b-0 transition-all duration-300 ease-out", 
                            i < currentLevel && "bg-primary/50",
                            i === currentLevel && gameState === 'playing' && "bg-primary animate-pulse",
                            i > currentLevel && "bg-muted"
                        )} style={{ height: `${20 + i * 20}%`}}>
                             <div className="text-center text-xs font-bold pt-1 text-primary-foreground">{reward}</div>
                        </div>
                    ))}
                </div>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
