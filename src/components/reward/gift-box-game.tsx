
'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award, Layers, X, Sparkles, Trophy, RotateCw } from 'lucide-react';
import { useRewards } from '@/hooks/use-rewards';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';

const LEVEL_CONFIG = {
    1: { cards: 4 },
    2: { cards: 6 },
    3: { cards: 8 },
};
type Level = keyof typeof LEVEL_CONFIG;

const cardVariants = {
  hidden: { scale: 0.5, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: { delay: i * 0.05, type: 'spring', stiffness: 260, damping: 20 },
  }),
};

export function CardFlipGame() {
    const { canPlayCardFlip, playCardFlip, generateCardFlipPrize } = useRewards();
    const { toast } = useToast();

    const [level, setLevel] = useState<Level>(1);
    const [gameState, setGameState] = useState<'playing' | 'revealed' | 'ended'>('playing');
    const [cards, setCards] = useState<(number | 'lose')[]>([]);
    const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
    const [lastPrize, setLastPrize] = useState<number | null>(null);

    const setupLevel = useCallback(() => {
        if (!canPlayCardFlip) {
            setGameState('ended');
            return;
        }
        const numCards = LEVEL_CONFIG[level].cards;
        const prize = generateCardFlipPrize();
        const winningIndex = Math.floor(Math.random() * numCards);
        
        const newCards: (number | 'lose')[] = Array(numCards).fill('lose');
        newCards[winningIndex] = prize;
        
        setCards(newCards);
        setSelectedCardIndex(null);
        setGameState('playing');
    }, [level, generateCardFlipPrize, canPlayCardFlip]);

    useEffect(() => {
        setupLevel();
    }, [level, setupLevel]);
    
    // Reset the component state if the user's daily play status changes
    useEffect(() => {
        if (canPlayCardFlip) {
            setLevel(1);
            setGameState('playing');
            setupLevel(); // Recalculate cards for level 1
        } else {
            setGameState('ended');
        }
    }, [canPlayCardFlip]);

    const handleCardClick = async (index: number) => {
        if (gameState !== 'playing') return;
        
        setSelectedCardIndex(index);
        const prize = cards[index];
        const isWin = prize !== 'lose';

        setGameState('revealed');

        if (isWin) {
            setLastPrize(prize);
            await playCardFlip(true, prize);
        } else {
            setLastPrize(null);
            await playCardFlip(false, 0); // Loss, no prize
            setTimeout(() => setGameState('ended'), 2000);
        }
    };
    
    const handleNextLevel = () => {
        if (level < 3) {
            setLevel(prev => (prev + 1) as Level);
        } else {
            // Completed all levels
            toast({
                title: "Challenge Complete!",
                description: "You've beaten all levels for today. What a legend!",
                className: "bg-green-500/10 border-green-500/50"
            });
            setGameState('ended');
        }
    }
    
    const renderCard = (cardValue: number | 'lose', index: number) => {
        const isRevealed = gameState === 'revealed';
        const isWin = cardValue !== 'lose';

        return (
             <motion.div
                key={index}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="perspective-[1000px]"
             >
                <motion.button
                    onClick={() => handleCardClick(index)}
                    disabled={gameState !== 'playing'}
                    className="relative w-24 h-36 rounded-lg shadow-lg transition-transform duration-500 preserve-3d"
                    animate={{ rotateY: isRevealed ? 180 : 0 }}
                >
                    {/* Card Back */}
                    <div className={cn(
                        "absolute inset-0 w-full h-full rounded-lg backface-hidden flex items-center justify-center bg-gradient-to-br from-primary to-purple-600 p-1",
                         gameState === 'playing' && "cursor-pointer hover:scale-105 transition-transform"
                     )}>
                         <div className="w-full h-full bg-slate-800 rounded-md flex items-center justify-center">
                            <Layers className="h-12 w-12 text-primary animate-pulse" />
                        </div>
                    </div>
                    {/* Card Front */}
                     <div className={cn(
                        "absolute inset-0 w-full h-full rounded-lg backface-hidden flex flex-col items-center justify-center p-2 text-white rotate-y-180",
                        isWin ? "bg-gradient-to-br from-yellow-400 to-amber-600" : "bg-gradient-to-br from-slate-600 to-gray-800"
                    )}>
                        {isWin ? (
                            <>
                                <Sparkles className="h-8 w-8" />
                                <p className="text-3xl font-bold mt-2">{cardValue}</p>
                                <p className="text-xs font-semibold">CREDITS</p>
                            </>
                        ) : (
                            <X className="h-12 w-12"/>
                        )}
                    </div>
                </motion.button>
            </motion.div>
        )
    };


    return (
        <div className="w-full max-w-lg mx-auto space-y-4">
            <Card className="text-center bg-muted/50 border-dashed">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2">
                        <Layers className="h-6 w-6 text-primary"/>
                        Card Flip Challenge
                    </CardTitle>
                    <CardDescription>
                        Find the credits to advance to the next level. One loss and your daily run is over!
                    </CardDescription>
                </CardHeader>
                 <CardContent className="flex flex-col items-center justify-center p-4 min-h-[350px]">
                    <AnimatePresence mode="wait">
                         {gameState === 'ended' ? (
                            <motion.div
                                key="ended"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <h3 className="text-2xl font-bold">Your run has ended.</h3>
                                <p className="text-muted-foreground">Come back tomorrow for another chance!</p>
                                <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}><RotateCw className="mr-2 h-4 w-4"/>Check Status</Button>
                            </motion.div>
                        ) : (
                             <motion.div key="playing" className="flex flex-col items-center w-full">
                                 <div className="mb-4 text-center">
                                    <h3 className="text-lg font-bold">Level {level}</h3>
                                    <p className="text-sm text-muted-foreground">Select one of the {LEVEL_CONFIG[level].cards} cards.</p>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 justify-center">
                                    {cards.map(renderCard)}
                                </div>
                                 {gameState === 'revealed' && (
                                     <div className="mt-6 animate-in fade-in-50">
                                        {lastPrize ? (
                                            level < 3 ? (
                                                <Button onClick={handleNextLevel}>
                                                    <Trophy className="mr-2 h-4 w-4"/> Advance to Level {level + 1}
                                                </Button>
                                            ) : (
                                                <Button onClick={() => setGameState('ended')}>
                                                     <Trophy className="mr-2 h-4 w-4"/> Collect Winnings & End Run
                                                </Button>
                                            )
                                        ) : (
                                            <p className="font-bold text-destructive">Game Over!</p>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    );
}
