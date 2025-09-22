'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Brain, Clock, Loader2, Play, AlertTriangle, Key, Delete, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignedOut } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { useRewards } from '@/hooks/use-rewards';
import { cn } from '@/lib/utils';
import { LoginWall } from '../ui/login-wall';

const CODE_LENGTH = 4;
const MAX_ATTEMPTS = 6;

export function CodebreakerGame() {
    const { canPlayCodebreaker, playCodebreaker, codebreakerStatus, loading: rewardsLoading } = useRewards();
    const { toast } = useToast();

    const [guess, setGuess] = useState<string[]>([]);
    const [pastGuesses, setPastGuesses] = useState<{ guess: string[]; correctPlace: number; correctDigit: number }[]>([]);
    const [gameState, setGameState] = useState<'playing' | 'won' | 'lost' | 'ended'>('playing');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        if (!rewardsLoading && !canPlayCodebreaker) {
            setGameState('ended');
            if(codebreakerStatus.lastResult === 'win') setGameState('won');
            if(codebreakerStatus.lastResult === 'loss') setGameState('lost');
        }
    }, [canPlayCodebreaker, rewardsLoading, codebreakerStatus]);
    
    const handleKeyClick = (key: string) => {
        if (guess.length < CODE_LENGTH) {
            setGuess(prev => [...prev, key]);
        }
    };

    const handleDelete = () => {
        setGuess(prev => prev.slice(0, -1));
    };
    
    const handleSubmit = async () => {
        if (guess.length !== CODE_LENGTH) return;
        
        setIsSubmitting(true);
        const result = await playCodebreaker(guess.join(''));
        setIsSubmitting(false);

        if (!result) {
            toast({ variant: "destructive", title: "Could not submit guess. Try again."});
            return;
        }

        setPastGuesses(prev => [...prev, { guess, ...result.clues }]);
        setGuess([]);
        
        if (result.isWin) {
            setGameState('won');
        } else if (pastGuesses.length + 1 >= MAX_ATTEMPTS) {
            setGameState('lost');
        }
    };
    
    const rewardTiers = [25, 15, 10, 5, 3, 1];
    const finalReward = codebreakerStatus.lastResult === 'win' ? rewardTiers[codebreakerStatus.attempts - 1] : 0;

    const renderContent = () => {
        if (rewardsLoading) {
            return <div className="h-96 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>
        }

        if (gameState === 'ended') {
             return (
                <div className="h-96 flex flex-col items-center justify-center text-center space-y-4">
                    <Key className="h-12 w-12 text-muted-foreground"/>
                    <h3 className="text-2xl font-bold">Daily Challenge Complete</h3>
                    <p className="text-muted-foreground">You have already played today. Come back tomorrow for a new code!</p>
                </div>
            );
        }

        if (gameState === 'won' || gameState === 'lost') {
            return (
                <div className="h-96 flex flex-col items-center justify-center text-center space-y-4">
                    {gameState === 'won' ? <Award className="h-12 w-12 text-yellow-400"/> : <AlertTriangle className="h-12 w-12 text-destructive"/>}
                    <h3 className="text-2xl font-bold">{gameState === 'won' ? "You Cracked the Code!" : "Code Not Cracked"}</h3>
                    <p className="text-muted-foreground">
                        {gameState === 'won' 
                            ? `You won ${finalReward} credits in ${codebreakerStatus.attempts} attempts!`
                            : `The secret code was ${codebreakerStatus.secretCode}. Better luck next time.`
                        }
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="space-y-2 h-48 overflow-y-auto pr-2">
                    {pastGuesses.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                           <div className="flex items-center gap-2">
                             <span className="text-xs text-muted-foreground font-bold">#{index + 1}</span>
                             <div className="flex gap-1.5 font-mono text-xl font-bold">
                                {item.guess.map((digit, i) => <span key={i} className="flex items-center justify-center h-8 w-8 bg-background rounded-md border">{digit}</span>)}
                             </div>
                           </div>
                           <div className="flex items-center gap-2 text-sm">
                                <div className="flex items-center gap-1" title="Correct Digit, Wrong Place"><Lightbulb className="h-4 w-4 text-green-500"/> {item.correctDigit}</div>
                                <div className="flex items-center gap-1" title="Correct Digit, Right Place"><Key className="h-4 w-4 text-yellow-500"/> {item.correctPlace}</div>
                           </div>
                        </div>
                    ))}
                </div>
                
                <div className="flex justify-center gap-2">
                    {[...Array(CODE_LENGTH)].map((_, i) => (
                        <div key={i} className="h-14 w-12 bg-background border-2 rounded-lg flex items-center justify-center text-3xl font-bold font-mono">
                            {guess[i] || ''}
                        </div>
                    ))}
                </div>

                <div className="space-y-2 pt-2">
                    <div className="grid grid-cols-5 gap-2">
                         {'12345'.split('').map(key => (
                            <Button key={key} variant="outline" className="h-12 w-12 text-xl" onClick={() => handleKeyClick(key)} disabled={isSubmitting}>
                                {key}
                            </Button>
                        ))}
                    </div>
                     <div className="grid grid-cols-5 gap-2">
                         {'67890'.split('').map(key => (
                            <Button key={key} variant="outline" className="h-12 w-12 text-xl" onClick={() => handleKeyClick(key)} disabled={isSubmitting}>
                                {key}
                            </Button>
                        ))}
                    </div>
                     <div className="flex justify-center gap-2">
                        <Button variant="destructive" className="h-12 w-28" onClick={handleDelete} disabled={isSubmitting}><Delete className="mr-2"/></Button>
                        <Button className="h-12 flex-1" onClick={handleSubmit} disabled={isSubmitting || guess.length !== CODE_LENGTH}>
                            {isSubmitting ? <Loader2 className="animate-spin"/> : "Submit"}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
    

    return (
        <Card className="w-full max-w-sm mx-auto relative">
             <SignedOut>
                <LoginWall title="Unlock Codebreaker" description="Sign up to play this daily code-cracking game and win credit rewards!" />
            </SignedOut>
            <CardHeader>
                <CardTitle>Codebreaker</CardTitle>
                <CardDescription>Guess the 4-digit code in {MAX_ATTEMPTS} attempts or less. One try per day!</CardDescription>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
