
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Play, AlertTriangle, Send, RotateCw, Sparkles, Check, Forward, Zap, BookCheck, Trophy, Film, TestTube2, BrainCircuit, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignedOut } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { useUsers } from '@/hooks/use-admin';
import { useQuizzes, type Quiz, type QuizQuestion, type QuizCategory, categoryDetails } from '@/hooks/use-quizzes';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { LoginWall } from '../ui/login-wall';

const INITIAL_TIME = 30; // seconds
const TIME_PER_CORRECT_ANSWER = 3;
const TIME_PENALTY_PER_WRONG_ANSWER = 5;

// Function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

export function SubjectSprintGame() {
    const { user, isSignedIn } = useUser();
    const { toast } = useToast();
    const { currentUserData, updateGameHighScore } = useUsers();
    const { quizzes, loading: quizzesLoading } = useQuizzes();
    
    const [gameState, setGameState] = useState<'selecting' | 'playing' | 'gameOver'>('selecting');
    const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
    const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    
    useEffect(() => {
        if(currentUserData?.gameHighScores?.subjectSprint) {
            setHighScore(currentUserData.gameHighScores.subjectSprint);
        }
    }, [currentUserData]);

    const handleCategorySelect = (category: QuizCategory) => {
        const questionsFromCategory = quizzes
            .filter(q => q.category === category)
            .flatMap(q => q.questions);
        
        if (questionsFromCategory.length < 5) {
            toast({
                variant: 'destructive',
                title: "Not Enough Questions",
                description: `This category doesn't have enough questions for a sprint. Please add more quizzes.`
            });
            return;
        }

        setAllQuestions(shuffleArray(questionsFromCategory).map(q => ({
            ...q,
            options: shuffleArray(q.options) // Also shuffle options for variety
        })));
        setSelectedCategory(category);
        startGame();
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };
    
    const handleGameOver = () => {
        setGameState('gameOver');
        if(score > highScore) {
            setHighScore(score);
            if(user) {
                updateGameHighScore(user.id, 'subjectSprint', score);
            }
        }
    }

    const startGame = () => {
        setScore(0);
        setCurrentQuestionIndex(0);
        setTimeLeft(INITIAL_TIME);
        setGameState('playing');
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    stopTimer();
                    handleGameOver();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleAnswer = (option: string) => {
        if (isAnswered) return;

        setIsAnswered(true);
        setSelectedOption(option);
        const currentQuestion = allQuestions[currentQuestionIndex];

        if (option === currentQuestion.correctAnswer) {
            setScore(s => s + 1);
            setTimeLeft(t => t + TIME_PER_CORRECT_ANSWER);
            toast({ title: `Correct! +${TIME_PER_CORRECT_ANSWER}s`, className: "bg-green-500/10 text-green-700 border-green-500/50" });
        } else {
            setTimeLeft(t => Math.max(0, t - TIME_PENALTY_PER_WRONG_ANSWER));
            toast({ variant: 'destructive', title: `Incorrect! -${TIME_PENALTY_PER_WRONG_ANSWER}s` });
        }

        setTimeout(() => {
            if (currentQuestionIndex + 1 < allQuestions.length) {
                setCurrentQuestionIndex(i => i + 1);
                setIsAnswered(false);
                setSelectedOption(null);
            } else {
                // End of questions, game over
                stopTimer();
                handleGameOver();
            }
        }, 1000);
    };

    const restartGame = () => {
        setGameState('selecting');
        setSelectedCategory(null);
        setAllQuestions([]);
        stopTimer();
    }
    
    if (quizzesLoading) {
        return <Card className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin"/></Card>
    }

    if (gameState === 'selecting') {
        return (
            <Card className="relative">
                 <SignedOut>
                    <LoginWall title="Unlock Subject Sprint" description="Sign up to play this fast-paced quiz game, challenge your knowledge, and set high scores." />
                </SignedOut>
                <CardHeader>
                    <CardTitle>Subject Sprint</CardTitle>
                    <CardDescription>Choose a category and answer as many questions as you can before time runs out!</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(categoryDetails).map(([key, details]) => {
                        const { Icon, title } = details;
                        return (
                            <Button key={key} variant="outline" className="h-auto py-4" onClick={() => handleCategorySelect(key as QuizCategory)} disabled={!isSignedIn}>
                                <Icon className="mr-3 h-5 w-5"/>
                                {title}
                            </Button>
                        )
                    })}
                </CardContent>
            </Card>
        );
    }
    
    const currentQuestion = allQuestions[currentQuestionIndex];

    return (
        <Card className="flex flex-col">
            <CardHeader>
                 <div className="flex justify-between items-center mb-4">
                    <CardTitle>Subject Sprint</CardTitle>
                    <Button variant="ghost" size="sm" onClick={restartGame}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Categories</Button>
                </div>
                <div className="relative w-full h-3 bg-muted rounded-full">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-primary rounded-full"
                        initial={{ width: "100%" }}
                        animate={{ width: `${(timeLeft / INITIAL_TIME) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>
                <div className="flex justify-between items-center text-sm font-medium mt-2">
                    <span>Score: {score}</span>
                    <span>Time: {timeLeft}s</span>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center">
                {gameState === 'playing' && currentQuestion ? (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="w-full text-center space-y-6"
                        >
                            <p className="text-xl font-semibold min-h-[60px]">{currentQuestion.text}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {currentQuestion.options.map((option, index) => {
                                    const isCorrect = option === currentQuestion.correctAnswer;
                                    const isSelected = option === selectedOption;
                                    
                                    return (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            className={cn("h-auto py-3 text-base whitespace-normal",
                                                isAnswered && isCorrect && "bg-green-500/20 border-green-500/50 text-foreground",
                                                isAnswered && isSelected && !isCorrect && "bg-destructive/20 border-destructive/50 text-foreground"
                                            )}
                                            onClick={() => handleAnswer(option)}
                                            disabled={isAnswered}
                                        >
                                            {option}
                                        </Button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                ) : gameState === 'gameOver' ? (
                     <div className="text-center space-y-4">
                        <Trophy className="h-16 w-16 mx-auto text-amber-500"/>
                        <h2 className="text-3xl font-bold">Time's Up!</h2>
                        <p className="text-xl text-muted-foreground">You scored <span className="font-bold text-primary">{score}</span> points!</p>
                        {score > highScore && <p className="font-bold text-green-500">New High Score!</p>}
                        <Button onClick={restartGame}><RotateCw className="mr-2 h-4 w-4"/> Play Again</Button>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
