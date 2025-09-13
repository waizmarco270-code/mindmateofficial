
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Brain, HelpCircle, Loader2, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { useUsers } from '@/hooks/use-admin';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/use-local-storage';

const PADS = ['green', 'red', 'yellow', 'blue'] as const;
type PadColor = typeof PADS[number];

const PAD_STYLES: Record<PadColor, string> = {
    green: "bg-green-500 hover:bg-green-400",
    red: "bg-red-500 hover:bg-red-400",
    yellow: "bg-yellow-400 hover:bg-yellow-300",
    blue: "bg-blue-500 hover:bg-blue-400",
};

const PAD_SOUNDS: Record<PadColor, number> = {
    green: 329.63, // E4
    red: 392.00,  // G4
    yellow: 440.00,// A4
    blue: 523.25, // C5
};


const DAILY_MILESTONES = {
    5: 1,  // 1 credit for reaching level 5
    10: 2, // 2 credits for reaching level 10
    15: 5, // 5 credits for reaching level 15
};
type Milestone = keyof typeof DAILY_MILESTONES;


const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let audioContext: AudioContext | null = null;

const playSound = (frequency: number) => {
    if (typeof window === 'undefined') return;
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser");
            return;
        }
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
};


export function MemoryPatternGame() {
    const { user } = useUser();
    const { toast } = useToast();
    const { addCreditsToUser } = useUsers();

    const [sequence, setSequence] = useState<PadColor[]>([]);
    const [playerSequence, setPlayerSequence] = useState<PadColor[]>([]);
    const [gameState, setGameState] = useState<'idle' | 'watching' | 'playing' | 'gameOver'>('idle');
    const [activePad, setActivePad] = useState<PadColor | null>(null);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useLocalStorage('memoryGameHighScore', 0);
    const [dailyMilestonesReached, setDailyMilestonesReached] = useState<Milestone[]>([]);
    const [isCheckingClaims, setIsCheckingClaims] = useState(true);

     // Check daily claim status
    useEffect(() => {
        const checkClaimStatus = async () => {
            if (!user) {
                setIsCheckingClaims(false);
                return;
            };
            const claimDocRef = doc(db, 'users', user.id, 'dailyClaims', 'memoryGame');
            const docSnap = await getDoc(claimDocRef);
            if (docSnap.exists() && isToday(docSnap.data().lastPlayed.toDate())) {
                setDailyMilestonesReached(docSnap.data().milestonesReached || []);
            } else {
                setDailyMilestonesReached([]);
            }
             setIsCheckingClaims(false);
        };
        checkClaimStatus();
    }, [user]);
    
     const activatePad = async (pad: PadColor) => {
        setActivePad(pad);
        playSound(PAD_SOUNDS[pad]);
        await sleep(400); // How long the pad stays lit
        setActivePad(null);
        await sleep(100); // Pause between pads
    };


    const extendSequence = () => {
        const nextPad = PADS[Math.floor(Math.random() * PADS.length)];
        setSequence(prev => [...prev, nextPad]);
    };

    const playSequence = async () => {
        await sleep(700);
        for (const pad of sequence) {
            await activatePad(pad);
        }
        setGameState('playing');
    };

    const startGame = () => {
        setSequence([]);
        setPlayerSequence([]);
        setScore(0);
        setGameState('watching');
    };
    
     useEffect(() => {
        if (gameState === 'watching') {
            extendSequence();
        }
    }, [gameState]);

    useEffect(() => {
        if (sequence.length > 0 && gameState === 'watching') {
            playSequence();
        }
    }, [sequence, gameState]);
    
    const handleMilestoneCheck = useCallback(async (currentScore: number) => {
        const milestone = currentScore as Milestone;
        if(user && DAILY_MILESTONES[milestone] && !dailyMilestonesReached.includes(milestone)) {
            const creditsToAward = DAILY_MILESTONES[milestone];
            await addCreditsToUser(user.id, creditsToAward);
            
            const newMilestones: Milestone[] = [...dailyMilestonesReached, milestone];
            const claimDocRef = doc(db, 'users', user.id, 'dailyClaims', 'memoryGame');
            await setDoc(claimDocRef, { 
                lastPlayed: Timestamp.now(),
                milestonesReached: newMilestones
            }, { merge: true });

            setDailyMilestonesReached(newMilestones);

            toast({
                title: `Milestone Reached! +${creditsToAward} Credits!`,
                description: `You reached a sequence of ${milestone}.`,
                className: "bg-green-500/10 text-green-700 border-green-500/50"
            });
        }
    }, [user, dailyMilestonesReached, addCreditsToUser, toast]);

    const handlePlayerClick = async (pad: PadColor) => {
        if (gameState !== 'playing') return;

        activatePad(pad);

        const newPlayerSequence = [...playerSequence, pad];
        setPlayerSequence(newPlayerSequence);

        // Check if the latest click is correct
        if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
            setGameState('gameOver');
            if (score > highScore) {
                setHighScore(score);
            }
            return;
        }

        // If sequence is complete, move to next round
        if (newPlayerSequence.length === sequence.length) {
            const newScore = score + 1;
            setScore(newScore);
            handleMilestoneCheck(newScore);
            setPlayerSequence([]);
            setGameState('watching');
        }
    };


    const getStatusMessage = () => {
        switch(gameState) {
            case 'idle': return 'Press Start to Play';
            case 'watching': return 'Watch the Sequence...';
            case 'playing': return 'Your Turn!';
            case 'gameOver': return `Game Over! Score: ${score}`;
            default: return '';
        }
    }

    return (
         <div className="flex flex-col md:flex-row gap-8 items-start">
            <Card className="w-full md:max-w-lg">
                 <CardHeader>
                    <CardTitle>Memory Pattern</CardTitle>
                    <CardDescription>Repeat the sequence of lights and sounds. How long can you last?</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    <div className="flex justify-between items-center w-full bg-muted p-2 rounded-lg">
                        <div className="text-sm">Score: <span className="font-bold">{score}</span></div>
                        <div className={cn("text-lg font-bold text-primary",
                            gameState === 'gameOver' && "bg-destructive/80 text-destructive-foreground px-4 py-1 rounded-md"
                        )}>
                            {getStatusMessage()}
                        </div>
                        <div className="text-sm">High Score: <span className="font-bold">{highScore}</span></div>
                    </div>

                    <div className="relative grid grid-cols-2 gap-4">
                        {PADS.map(pad => (
                            <motion.button
                                key={pad}
                                onClick={() => handlePlayerClick(pad)}
                                disabled={gameState !== 'playing'}
                                className={cn(
                                    "h-32 w-32 sm:h-40 sm:w-40 rounded-xl transition-all duration-100 ease-in-out border-4 border-transparent",
                                    PAD_STYLES[pad],
                                    activePad === pad && 'brightness-150 scale-105',
                                    gameState !== 'playing' && 'cursor-not-allowed opacity-70'
                                )}
                            />
                        ))}
                    </div>

                    {gameState === 'idle' || gameState === 'gameOver' ? (
                        <Button onClick={startGame} size="lg" className="w-full">
                            <Play className="mr-2"/>
                            {gameState === 'gameOver' ? 'Play Again' : 'Start Game'}
                        </Button>
                    ) : (
                        <Button disabled size="lg" className="w-full">
                            <Loader2 className="mr-2 animate-spin" />
                            Playing...
                        </Button>
                    )}
                </CardContent>
            </Card>
             <Card className="flex-1 w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><HelpCircle className="text-primary"/> How to Play & Rewards</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                   <div className="flex items-start gap-3">
                        <Brain className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-foreground">Game Rules</h4>
                            <p>Watch the sequence of lights and sounds, then repeat it by clicking the pads in the same order. The sequence gets longer with each correct round.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 mt-0.5 text-amber-500 flex-shrink-0" />
                         <div>
                            <h4 className="font-bold text-foreground">Daily Rewards</h4>
                             <p>You can earn credits by reaching score milestones for the first time each day.</p>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-bold text-foreground mb-2">Milestones:</h4>
                        <ul className="space-y-2">
                            {Object.entries(DAILY_MILESTONES).map(([level, credit]) => (
                                <li key={level} className={cn("flex justify-between p-2 rounded-md bg-muted/50", dailyMilestonesReached.includes(Number(level) as Milestone) && "line-through text-muted-foreground/70")}>
                                    <span>Reach Level {level}</span>
                                    <span className="font-bold text-primary">+{credit} Credit{credit > 1 ? 's' : ''}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                     {isCheckingClaims && <p className="text-center"><Loader2 className="inline-block animate-spin mr-2"/>Checking status...</p>}
                </CardContent>
            </Card>
        </div>
    )
}
