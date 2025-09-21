
'use client';

import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Gift, Loader2, Sparkles } from 'lucide-react';
import { useRewards } from '@/hooks/use-rewards';
import { useUsers } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const GACHAPON_COST = 5;

// Simple Gachapon Ball component for animation
const GachaponBall = () => (
    <motion.div
        className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-yellow-400 shadow-lg"
        initial={{ y: -100, x: 0, rotate: 0 }}
        animate={{ 
            y: [ -100, 10, -5, 5, 0 ], 
            x: [ 0, 20, -20, 10, 0],
            rotate: [0, 90, -90, 45, 0],
        }}
        transition={{ duration: 1.2, ease: "circOut" }}
    />
);

export function GachaponMachine() {
    const { playGachapon } = useRewards();
    const { currentUserData } = useUsers();
    const { toast } = useToast();
    
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'revealed'>('idle');
    const [prize, setPrize] = useState<string | number | null>(null);

    const handlePlay = async () => {
        if (!currentUserData) {
            toast({ variant: 'destructive', title: "Please sign in to play." });
            return;
        }
        if (currentUserData.credits < GACHAPON_COST) {
            toast({ variant: 'destructive', title: "Not enough credits!", description: `You need ${GACHAPON_COST} credits to play.` });
            return;
        }

        setGameState('playing');
        try {
            const revealedPrize = await playGachapon();
            setPrize(revealedPrize);
            setTimeout(() => {
                setGameState('revealed');
            }, 1500); // Wait for animation to finish
        } catch (error: any) {
            toast({ variant: 'destructive', title: "An error occurred", description: error.message });
            setGameState('idle');
        }
    };
    
    const resetGame = () => {
        setGameState('idle');
        setPrize(null);
    }

    return (
        <Card className="w-full max-w-md mx-auto text-center">
            <CardHeader>
                <CardTitle className="text-2xl">Gachapon Machine</CardTitle>
                <CardDescription>Spend 5 credits for a chance to win a surprise prize!</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[250px] flex flex-col justify-center items-center">
                <AnimatePresence mode="wait">
                    {gameState === 'idle' && (
                        <motion.div key="idle" className="space-y-4">
                            <Gift className="h-20 w-20 mx-auto text-primary" />
                            <p className="text-muted-foreground">Ready to try your luck?</p>
                        </motion.div>
                    )}
                    {gameState === 'playing' && (
                        <motion.div key="playing">
                            <GachaponBall />
                        </motion.div>
                    )}
                    {gameState === 'revealed' && prize !== null && (
                        <motion.div 
                            key="revealed"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="space-y-2"
                        >
                            <Sparkles className="h-12 w-12 mx-auto text-yellow-400"/>
                            <p className="text-lg text-muted-foreground">You won...</p>
                            <p className="text-3xl font-bold text-primary">{prize.toString()}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
            <CardFooter>
                 {gameState === 'idle' ? (
                     <Button className="w-full" size="lg" onClick={handlePlay} disabled={!currentUserData || currentUserData.credits < GACHAPON_COST}>
                        Insert {GACHAPON_COST} Credits & Play
                    </Button>
                ) : gameState === 'playing' ? (
                    <Button className="w-full" size="lg" disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        Spinning...
                    </Button>
                ) : (
                    <Button className="w-full" size="lg" onClick={resetGame}>
                        Play Again
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
