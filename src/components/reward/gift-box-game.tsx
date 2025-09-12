
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gift, Award, X, Sparkles } from 'lucide-react';
import { useRewards } from '@/hooks/use-rewards';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const boxVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: (i: number) => ({
        scale: 1,
        opacity: 1,
        transition: {
            delay: i * 0.1,
            type: 'spring',
            stiffness: 300,
            damping: 20
        }
    })
};

export function GiftBoxGame() {
    const { canClaimGiftBox, claimGiftBoxReward, winningBoxIndex } = useRewards();
    const [isRevealed, setIsRevealed] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [prize, setPrize] = useState<number | 'better luck' | null>(null);

    // Reset state if the claim status changes (e.g., new day)
    useEffect(() => {
        if (canClaimGiftBox) {
            setIsRevealed(false);
            setSelectedIndex(null);
            setPrize(null);
        } else {
            // If they can't claim, it means they already played today.
            // We can show the revealed state immediately, but without letting them play again.
            setIsRevealed(true);
        }
    }, [canClaimGiftBox]);


    const handleBoxClick = async (index: number) => {
        if (!canClaimGiftBox || isRevealed) return;

        setSelectedIndex(index);
        const result = await claimGiftBoxReward(index);
        setPrize(result.prize);
        setIsRevealed(true);
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-4">
            <Card className="text-center bg-muted/50 border-dashed">
                <CardHeader>
                    <CardTitle>Guess the Box!</CardTitle>
                    <CardDescription>
                        {canClaimGiftBox ? "Pick one box for a chance to win credits. You get one guess per day!" : "You've already made your guess for today. Come back tomorrow!"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-8 min-h-[250px]">
                    {isRevealed && prize !== null ? (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center gap-4"
                        >
                            {typeof prize === 'number' ? (
                                <>
                                    <Sparkles className="h-16 w-16 text-yellow-400" />
                                    <h3 className="text-2xl font-bold">You won {prize} Credits!</h3>
                                    <p className="text-muted-foreground">Congratulations!</p>
                                </>
                            ) : (
                                <>
                                    <X className="h-16 w-16 text-destructive" />
                                    <h3 className="text-2xl font-bold">Better Luck Next Time!</h3>
                                    <p className="text-muted-foreground">The prize was in another box.</p>
                                </>
                            )}
                            <Button variant="outline" onClick={() => window.location.reload()}>Check Status</Button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <motion.button
                                    key={index}
                                    custom={index}
                                    variants={boxVariants}
                                    initial="hidden"
                                    animate="visible"
                                    onClick={() => handleBoxClick(index)}
                                    disabled={!canClaimGiftBox || isRevealed}
                                    className="group transition-transform hover:-translate-y-2 disabled:cursor-not-allowed"
                                >
                                    <Gift className="h-24 w-24 text-primary group-hover:animate-pulse disabled:group-hover:animate-none" />
                                </motion.button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
