
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hand, Scissors, Gem, Award, RotateCw, X, Check, Gamepad2, Users, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUser, SignedOut } from '@clerk/nextjs';
import { useRewards } from '@/hooks/use-rewards';
import { LoginWall } from '../ui/login-wall';

type Choice = 'rock' | 'paper' | 'scissors';
const choices: Choice[] = ['rock', 'paper', 'scissors'];

const choiceIcons: Record<Choice, React.ElementType> = {
    rock: Hand,
    paper: Hand,
    scissors: Scissors,
};

const choiceRotations: Record<Choice, string> = {
    rock: 'rotate-90',
    paper: '',
    scissors: '-rotate-90 scale-x-[-1]',
};

const MAX_SCORE = 3;

export function RockPaperScissorsGame() {
    const { isSignedIn } = useUser();
    const { availableRpsPlays, playRpsMatch } = useRewards();

    const [playerScore, setPlayerScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);
    const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
    const [aiChoice, setAiChoice] = useState<Choice | null>(null);
    const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
    const [gameState, setGameState] = useState<'playing' | 'showing' | 'gameOver'>('playing');

    const handlePlayerChoice = (choice: Choice) => {
        if (gameState !== 'playing') return;

        const aiRandomChoice = choices[Math.floor(Math.random() * choices.length)];
        setPlayerChoice(choice);
        setAiChoice(aiRandomChoice);
        setGameState('showing');

        // Determine winner
        if (choice === aiRandomChoice) {
            setResult('draw');
        } else if (
            (choice === 'rock' && aiRandomChoice === 'scissors') ||
            (choice === 'scissors' && aiRandomChoice === 'paper') ||
            (choice === 'paper' && aiRandomChoice === 'rock')
        ) {
            setResult('win');
            setPlayerScore(s => s + 1);
        } else {
            setResult('lose');
            setAiScore(s => s + 1);
        }
    };
    
    useEffect(() => {
        if (playerScore >= MAX_SCORE || aiScore >= MAX_SCORE) {
            setGameState('gameOver');
            const playerWon = playerScore >= MAX_SCORE;
            playRpsMatch(playerWon);
        }
    }, [playerScore, aiScore, playRpsMatch]);


    const nextRound = () => {
        setPlayerChoice(null);
        setAiChoice(null);
        setResult(null);
        setGameState('playing');
    };
    
    const resetGame = () => {
        setPlayerScore(0);
        setAiScore(0);
        nextRound();
    };

    const renderChoiceButton = (choice: Choice) => {
        const Icon = choiceIcons[choice];
        return (
            <Button
                variant="outline"
                className="h-24 w-24 md:h-32 md:w-32 flex-col gap-2 rounded-2xl shadow-lg border-2 hover:border-primary hover:bg-primary/10 transition-all duration-200 transform hover:-translate-y-1"
                onClick={() => handlePlayerChoice(choice)}
                disabled={gameState !== 'playing' || !isSignedIn}
            >
                <Icon className={cn("h-10 w-10 text-primary", choiceRotations[choice])} />
                <span className="font-bold capitalize">{choice}</span>
            </Button>
        );
    };

    return (
        <div className="space-y-4">
            <Card className="relative overflow-hidden">
                 <SignedOut>
                    <LoginWall title="Unlock Rock, Paper, Scissors" description="Sign up to play this classic strategy game, claim daily plays, and win credit rewards!" />
                </SignedOut>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Rock, Paper, Scissors</span>
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Gamepad2 className="h-4 w-4" />
                            <span>Plays Left: {availableRpsPlays}</span>
                        </div>
                    </CardTitle>
                    <CardDescription>First to {MAX_SCORE} wins the match. Win a match to earn 10 credits.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                     <div className="flex justify-around items-center text-center bg-muted p-4 rounded-xl">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Users /> You</p>
                            <p className="text-4xl font-bold">{playerScore}</p>
                        </div>
                         <div className="font-black text-2xl text-muted-foreground/50">VS</div>
                         <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Trophy /> AI</p>
                            <p className="text-4xl font-bold">{aiScore}</p>
                        </div>
                    </div>
                    
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={gameState}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {gameState === 'playing' && (
                                <div className="text-center space-y-6">
                                    <h3 className="font-semibold text-lg">Choose your weapon!</h3>
                                    <div className="flex justify-center gap-4 md:gap-8">
                                        {renderChoiceButton('rock')}
                                        {renderChoiceButton('paper')}
                                        {renderChoiceButton('scissors')}
                                    </div>
                                </div>
                            )}

                             {gameState === 'showing' && result && (
                                <div className="text-center space-y-6 min-h-[168px] flex flex-col justify-center">
                                    <div className="flex justify-around items-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <AnimatePresence>
                                                {playerChoice && <ChoiceDisplay choice={playerChoice} isPlayer />}
                                            </AnimatePresence>
                                        </div>
                                         <div className="flex flex-col items-center gap-2">
                                            <AnimatePresence>
                                                {aiChoice && <ChoiceDisplay choice={aiChoice} />}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                    <ResultDisplay result={result} onNextRound={nextRound} />
                                </div>
                             )}
                             
                            {gameState === 'gameOver' && (
                                <div className="text-center space-y-6 min-h-[168px] flex flex-col justify-center items-center">
                                    <div className="p-4 bg-primary/10 rounded-full mb-2">
                                        {playerScore > aiScore ? <Award className="h-10 w-10 text-primary"/> : <X className="h-10 w-10 text-destructive"/>}
                                    </div>
                                    <h3 className="text-3xl font-bold">{playerScore > aiScore ? "You Won the Match!" : "You Lost the Match"}</h3>
                                    <p className="text-muted-foreground">Final Score: {playerScore} - {aiScore}</p>
                                    <Button onClick={resetGame}>
                                        <RotateCw className="mr-2 h-4 w-4"/> Play Again
                                    </Button>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    );
}

function ChoiceDisplay({ choice, isPlayer = false }: { choice: Choice, isPlayer?: boolean }) {
    const Icon = choiceIcons[choice];
    return (
        <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex flex-col items-center gap-2"
        >
            <div className={cn("h-24 w-24 md:h-28 md:w-28 flex items-center justify-center rounded-2xl bg-muted border-2", isPlayer && "border-primary")}>
                <Icon className={cn("h-12 w-12", choiceRotations[choice], isPlayer ? "text-primary" : "text-foreground")} />
            </div>
            <p className="text-sm font-semibold">{isPlayer ? "You" : "AI"} chose <span className="capitalize">{choice}</span></p>
        </motion.div>
    );
}

function ResultDisplay({ result, onNextRound }: { result: 'win' | 'lose' | 'draw', onNextRound: () => void }) {
    const messages = {
        win: { text: "You win this round!", color: "text-green-500", Icon: Check },
        lose: { text: "AI wins this round!", color: "text-destructive", Icon: X },
        draw: { text: "It's a draw!", color: "text-muted-foreground", Icon: RotateCw },
    };

    const { text, color, Icon } = messages[result];

    useEffect(() => {
        const timer = setTimeout(() => {
            onNextRound();
        }, 2000);
        return () => clearTimeout(timer);
    }, [onNextRound]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, transition: { delay: 0.5 } }}
            className="flex flex-col items-center gap-2"
        >
            <div className={cn("flex items-center gap-2 font-bold text-xl", color)}>
                <Icon className="h-6 w-6" />
                <span>{text}</span>
            </div>
            <p className="text-xs text-muted-foreground animate-pulse">Next round starting...</p>
        </motion.div>
    );
}
