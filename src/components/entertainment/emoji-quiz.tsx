
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Brain, Clock, Loader2, Play, AlertTriangle, Heart, Send, RotateCw, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { useUsers } from '@/hooks/use-admin';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isThisWeek, startOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';


const EMOJI_LEVELS = [
    { emojis: '👨‍💻+🐛', answer: 'debugger' },
    { emojis: '🌎+🕸️', answer: 'world wide web' },
    { emojis: '☀️+👓', answer: 'sunglasses' },
    { emojis: '🍎+⌚', answer: 'apple watch' },
    { emojis: '🌲+🍎', answer: 'pineapple' }, // Level 5
    { emojis: '🔥+🦊', answer: 'firefox' },
    { emojis: '🤖+👮‍♂️', answer: 'robocop' },
    { emojis: '👻+busters', answer: 'ghostbusters' },
    { emojis: '🕷️+👨', answer: 'spiderman' },
    { emojis: '⭐+ Wars', answer: 'star wars' }, // Level 10
    { emojis: '🕰️+🍊', answer: 'a clockwork orange' },
    { emojis: '💍+LORD', answer: 'lord of the rings' },
    { emojis: '🦁+👑', answer: 'lion king' },
    { emojis: '🧛+🔪', answer: 'buffy the vampire slayer' },
    { emojis: '🤫+🐑', answer: 'silence of the lambs' }, // Level 15
    { emojis: 'BREAKING+ kötü', answer: 'breaking bad' },
    { emojis: 'ドクター+ STRANGE', answer: 'doctor strange' },
    { emojis: '🎮+👑', answerp: 'game of thrones' },
    { emojis: '🚲+ STRANGER+THINGS', answer: 'stranger things' },
    { emojis: '💸+HEIST', answer: 'money heist' }, // Level 20
    { emojis: '🎩+PEAKY+😎', answer: 'peaky blinders' },
    { emojis: '⚫+MIRROR', answer: 'black mirror' },
    { emojis: '100', answer: 'the 100' },
    { emojis: '👑', answer: 'the crown' },
    { emojis: ' Viking ', answer: 'vikings' }, // Level 25
    { emojis: '⚡', answer: 'the flash' },
    { emojis: 'ARROW', answer: 'arrow' },
    { emojis: '🦇+👨', answer: 'batman' },
    { emojis: '🦸‍♂️', answer: 'superman' },
    { emojis: 'wonder+👩', answer: 'wonder woman' }, // Level 30
    { emojis: 'GREEN+LANTERN', answer: 'green lantern' },
    { emojis: '🌊+👨', answer: 'aquaman' },
    { emojis: 'DOCTOR+WHO', answer: 'doctor who' },
    { emojis: 'SHERLOCK+HOLMES', answer: 'sherlock holmes' },
    { emojis: '🙂+🙂', answer: 'friends' }, // Level 35
    { emojis: '👨‍⚕️+HOUSE', answer: 'house' },
    { emojis: 'LOST', answer: 'lost' },
    { emojis: 'PRISON+BREAK', answer: 'prison break' },
    { emojis: 'SUITS', answer: 'suits' },
    { emojis: 'HOW+I+MET+YOUR+MOTHER', answer: 'how i met your mother' }, // Level 40
    { emojis: 'BIG+💥+THEORY', answer: 'the big bang theory' },
    { emojis: '2️⃣+A+HALF+MEN', answer: 'two and a half men' },
    { emojis: 'MODERN+FAMILY', answer: 'modern family' },
    { emojis: 'THE+OFFICE', answer: 'the office' },
    { emojis: 'PARKS+AND+RECREATION', answer: 'parks and recreation' }, // Level 45
    { emojis: 'BROOKLYN+9️⃣9️⃣', answer: 'brooklyn nine nine' },
    { emojis: 'COMMUNITY', answer: 'community' },
    { emojis: 'THE+GOOD+PLACE', answer: 'the good place' },
    { emojis: 'SCRUBS', answer: 'scrubs' },
    { emojis: 'IT’S+ALWAYS+SUNNY+IN+PHILADELPHIA', answer: 'it\'s always sunny in philadelphia' }, // Level 50
];

const WEEKLY_MILESTONES: Record<number, number> = {
    5: 1, 10: 2, 15: 5, 20: 10, 25: 15, 30: 20, 40: 50, 50: 100,
};
const MAX_MISTAKES = 3;

const getLevelTime = (level: number) => {
    if (level > 20) return 15;
    if (level > 15) return 20;
    if (level > 10) return 25;
    return 30;
}

export function EmojiQuiz() {
    const { user } = useUser();
    const { toast } = useToast();
    const { addCreditsToUser, currentUserData, updateGameHighScore } = useUsers();

    const [level, setLevel] = useState(1);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');
    const [userInput, setUserInput] = useState('');
    const [timeLeft, setTimeLeft] = useState(getLevelTime(1));
    const [mistakes, setMistakes] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [weeklyMilestones, setWeeklyMilestones] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const timeProgress = (timeLeft / getLevelTime(level)) * 100;

    useEffect(() => {
        if(currentUserData?.gameHighScores?.emojiQuiz) {
            setHighScore(currentUserData.gameHighScores.emojiQuiz);
        }
    }, [currentUserData]);

    useEffect(() => {
        const checkWeeklyStatus = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            };
            const claimDocRef = doc(db, 'users', user.id, 'weeklyClaims', 'emojiQuiz');
            const docSnap = await getDoc(claimDocRef);
            if (docSnap.exists() && isThisWeek(docSnap.data().lastPlayed.toDate(), { weekStartsOn: 1 })) {
                setWeeklyMilestones(docSnap.data().milestonesReached || []);
            } else {
                setWeeklyMilestones([]);
            }
             setIsLoading(false);
        };
        checkWeeklyStatus();
    }, [user]);

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };
    
    const startTimer = useCallback(() => {
        stopTimer();
        setTimeLeft(getLevelTime(level));
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    stopTimer();
                    setGameState('gameOver');
                    toast({variant: 'destructive', title: "Time's up!"});
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [level, toast]);
    
    const startGame = () => {
        setLevel(1);
        setMistakes(0);
        setGameState('playing');
        startTimer();
    };

    const handleMilestoneCheck = useCallback(async (currentLevel: number) => {
        if(user && WEEKLY_MILESTONES[currentLevel] && !weeklyMilestones.includes(currentLevel)) {
            const creditsToAward = WEEKLY_MILESTONES[currentLevel];
            await addCreditsToUser(user.id, creditsToAward);
            
            const newMilestones = [...weeklyMilestones, currentLevel];
            const claimDocRef = doc(db, 'users', user.id, 'weeklyClaims', 'emojiQuiz');
            await setDoc(claimDocRef, { 
                lastPlayed: Timestamp.now(),
                milestonesReached: newMilestones
            }, { merge: true });

            setWeeklyMilestones(newMilestones);

            toast({
                title: `Milestone Reached! +${creditsToAward} Credits!`,
                description: `You reached level ${currentLevel}.`,
                className: "bg-green-500/10 text-green-700 border-green-500/50"
            });
        }
    }, [user, weeklyMilestones, addCreditsToUser, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (gameState !== 'playing' || !userInput.trim()) return;

        const currentLevelData = EMOJI_LEVELS[level - 1];

        if (userInput.trim().toLowerCase() === currentLevelData.answer.toLowerCase()) {
            // Correct answer
            toast({ title: `Level ${level} Passed!`, className: 'bg-green-500/10 border-green-500/50' });
            
            await handleMilestoneCheck(level);

            if (level + 1 > highScore) {
                setHighScore(level + 1);
                if (user) updateGameHighScore(user.id, 'emojiQuiz', level + 1);
            }
            
            if(level >= EMOJI_LEVELS.length) {
                setGameState('gameOver');
                 toast({ title: 'WOW!', description: 'You have completed all levels!' });
            } else {
                setLevel(prev => prev + 1);
                setUserInput('');
                startTimer();
            }

        } else {
            // Incorrect answer
            const newMistakes = mistakes + 1;
            setMistakes(newMistakes);
            setUserInput('');
            
            if (newMistakes >= MAX_MISTAKES) {
                setGameState('gameOver');
                toast({ variant: 'destructive', title: 'Game Over!', description: `The correct answer was: ${currentLevelData.answer}`});
            } else {
                toast({ variant: 'destructive', title: 'Incorrect!', description: `You have ${MAX_MISTAKES - newMistakes} chance left.` });
            }
        }
    };
    
    if (isLoading) {
        return <Card><CardContent className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></CardContent></Card>
    }

    return (
         <Card className="w-full max-w-lg mx-auto">
             <CardHeader>
                <CardTitle>Emoji Quiz</CardTitle>
                <CardDescription>Guess the word or phrase from the emojis. You get {MAX_MISTAKES} chances!</CardDescription>
            </CardHeader>
             <CardContent className="space-y-6">
                {gameState === 'idle' && (
                    <div className="text-center py-10">
                        <Button onClick={startGame} size="lg"><Play className="mr-2"/> Start Game</Button>
                    </div>
                )}
                 {gameState === 'gameOver' && (
                    <div className="text-center py-10 space-y-4">
                        <h3 className="text-3xl font-bold">Game Over!</h3>
                        <p className="text-muted-foreground">You reached level <span className="font-bold text-primary">{level}</span>.</p>
                        <Button onClick={startGame}><RotateCw className="mr-2"/> Play Again</Button>
                    </div>
                )}
                {gameState === 'playing' && (
                    <div className="space-y-6">
                         <div className="flex justify-between items-center bg-muted p-2 rounded-lg">
                            <div className="text-sm font-bold">Level: {level}</div>
                            <div className="flex items-center gap-2">
                                {[...Array(MAX_MISTAKES)].map((_, i) => (
                                    <Heart key={i} className={cn("h-5 w-5", i < (MAX_MISTAKES - mistakes) ? "text-red-500 fill-red-500" : "text-muted-foreground")}/>
                                ))}
                            </div>
                            <div className="text-sm font-bold">High Score: {highScore}</div>
                        </div>

                         <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-primary"
                                initial={{ width: '100%' }}
                                animate={{ width: `${timeProgress}%` }}
                                transition={{ duration: 1, ease: 'linear' }}
                            />
                        </div>

                        <div className="text-center py-8 bg-background rounded-lg border">
                            <p className="text-5xl md:text-6xl tracking-widest">{EMOJI_LEVELS[level-1].emojis}</p>
                        </div>
                       
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Input
                                placeholder="Type your answer..."
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                autoFocus
                            />
                            <Button type="submit" size="icon"><Send/></Button>
                        </form>
                    </div>
                )}

                 <div className="pt-4">
                    <h4 className="font-bold text-foreground mb-4 text-center">Weekly Milestone Rewards</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {Object.entries(WEEKLY_MILESTONES).map(([level, credit]) => (
                            <motion.div 
                                key={level} 
                                className={cn("flex flex-col items-center justify-center p-2 rounded-lg text-xs text-center border-2", 
                                    weeklyMilestones.includes(Number(level)) 
                                    ? "bg-green-500/10 border-green-500/30 text-green-500" 
                                    : "bg-muted border-transparent"
                                )}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: (Number(level) % 5) * 0.1 }}
                            >
                                {weeklyMilestones.includes(Number(level)) && <Check className="h-4 w-4 mb-1"/>}
                                <span className={cn("font-semibold", weeklyMilestones.includes(Number(level)) && "line-through")}>Level {level}</span>
                                <span className={cn("font-bold text-primary", weeklyMilestones.includes(Number(level)) && "text-green-500/70")}>+{credit} credits</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
