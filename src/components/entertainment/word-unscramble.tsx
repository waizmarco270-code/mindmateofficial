
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Award, Brain, Check, HelpCircle, Loader2, RotateCw, Send, Code, FlaskConical, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { useUsers } from '@/hooks/use-admin';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

const WORD_CATEGORIES = {
    programming: [
        'react', 'firebase', 'tailwind', 'nextjs', 'typescript', 'javascript', 'html', 'css', 'developer',
        'algorithm', 'database', 'component', 'function', 'variable', 'object', 'array', 'loop', 'conditional',
        'debugging', 'deployment', 'repository', 'framework', 'library', 'interface', 'asynchronous'
    ],
    science: [
        'gravity', 'photosynthesis', 'galaxy', 'molecule', 'electron', 'mitosis', 'ecosystem', 'volcano',
        'fossil', 'genetics', 'velocity', 'newton', 'einstein', 'chemistry', 'biology', 'physics', 'astronomy'
    ],
    general: [
        'knowledge', 'language', 'mountain', 'country', 'ocean', 'history', 'capital', 'president', 'culture',
        'festival', 'architecture', 'literature', 'mathematics', 'geography', 'philosophy', 'adventure'
    ]
};
type WordCategory = keyof typeof WORD_CATEGORIES;

const DAILY_WORD_LIMIT = 5;
const CREDIT_PER_WORD = 1;

const shuffle = (str: string) => {
    let a = str.split(""), n = a.length;
    for(let i = n - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    // Ensure the shuffled word is not the same as the original
    if(a.join("") === str) return shuffle(str);
    return a.join("");
}

export function WordUnscrambleGame() {
    const { user } = useUser();
    const { toast } = useToast();
    const { addCreditsToUser } = useUsers();
    
    const [currentWord, setCurrentWord] = useState('');
    const [scrambledWord, setScrambledWord] = useState('');
    const [userInput, setUserInput] = useState('');
    const [solvedWords, setSolvedWords] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [gameState, setGameState] = useState<'playing' | 'completed' | 'loading'>('loading');
    const [activeCategory, setActiveCategory] = useState<WordCategory>('programming');

    const setupNewWord = useCallback(() => {
        const availableWords = WORD_CATEGORIES[activeCategory].filter(w => !solvedWords.includes(w));
        if(availableWords.length === 0 || solvedWords.length >= DAILY_WORD_LIMIT) {
            setGameState('completed');
            return;
        }
        const newWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        setCurrentWord(newWord);
        setScrambledWord(shuffle(newWord));
        setUserInput('');
    }, [solvedWords, activeCategory]);

    useEffect(() => {
        const checkDailyProgress = async () => {
            if (!user) {
                setGameState('playing'); // Let non-logged-in users play for fun
                return;
            }
            const progressDocRef = doc(db, 'users', user.id, 'dailyClaims', 'wordUnscramble');
            const docSnap = await getDoc(progressDocRef);

            if (docSnap.exists() && isToday(docSnap.data().lastPlayed.toDate())) {
                const data = docSnap.data();
                setSolvedWords(data.solvedWords || []);
                if((data.solvedWords || []).length >= DAILY_WORD_LIMIT) {
                    setGameState('completed');
                } else {
                     setGameState('playing');
                }
            } else {
                // New day, reset progress
                setSolvedWords([]);
                setGameState('playing');
            }
        };
        checkDailyProgress();
    }, [user]);

    useEffect(() => {
        if(gameState === 'playing') {
            setupNewWord();
        }
    }, [gameState, setupNewWord, activeCategory]); // Rerun when category changes

    const handleSkip = () => {
        if(isSubmitting) return;
        toast({ title: "Word Skipped", description: `The word was: ${currentWord}` });
        setupNewWord();
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (userInput.toLowerCase() !== currentWord.toLowerCase()) {
            toast({ variant: 'destructive', title: "Incorrect, Try Again!" });
            return;
        }

        setIsSubmitting(true);
        
        const newSolvedWords = [...solvedWords, currentWord];
        
        try {
            if (user) {
                await addCreditsToUser(user.id, CREDIT_PER_WORD);
                const progressDocRef = doc(db, 'users', user.id, 'dailyClaims', 'wordUnscramble');
                await setDoc(progressDocRef, { 
                    lastPlayed: Timestamp.now(),
                    solvedWords: newSolvedWords
                }, { merge: true });
            }
            
            setSolvedWords(newSolvedWords);
            toast({ 
                title: "Correct!", 
                description: `You earned ${CREDIT_PER_WORD} credit!`,
                className: "bg-green-500/10 text-green-700 border-green-500/50"
            });
            
            if (newSolvedWords.length >= DAILY_WORD_LIMIT) {
                setGameState('completed');
            } else {
                setupNewWord();
            }

        } catch (error) {
            toast({ variant: 'destructive', title: "Error Saving Progress" });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const renderContent = () => {
        if (gameState === 'loading') {
            return <div className="flex justify-center items-center h-48"><Loader2 className="h-10 w-10 animate-spin"/></div>
        }
        if (gameState === 'completed') {
            return (
                <div className="text-center h-48 flex flex-col justify-center items-center">
                    <Check className="h-12 w-12 text-green-500 mb-4"/>
                    <h3 className="font-bold text-xl">All Done for Today!</h3>
                    <p className="text-muted-foreground">You've solved all the words. Come back tomorrow for more!</p>
                </div>
            )
        }

        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center items-center gap-2 min-h-[4rem]">
                    <AnimatePresence>
                        {scrambledWord.split('').map((char, index) => (
                             <motion.div
                                key={`${currentWord}-${index}`}
                                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: index * 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                                className="w-12 h-16 bg-muted flex items-center justify-center text-3xl font-bold rounded-lg shadow-inner"
                            >
                                {char.toUpperCase()}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                <div className="flex items-center gap-2">
                    <Input 
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Your answer..."
                        className="h-12 text-lg text-center"
                        disabled={isSubmitting}
                    />
                    <Button type="submit" size="icon" className="h-12 w-12" disabled={isSubmitting}>
                       {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                    </Button>
                </div>
                 <Button type="button" variant="outline" onClick={handleSkip} className="w-full" disabled={isSubmitting}>
                    <RotateCw className="mr-2 h-4 w-4"/> Skip Word
                </Button>
            </form>
        )
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 items-start">
             <Card className="w-full md:max-w-md">
                <CardHeader>
                    <CardTitle>Word Unscramble</CardTitle>
                    <CardDescription>Unscramble the letters to form a word from the selected category.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as WordCategory)} className="w-full mb-6">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="programming"><Code className="mr-2 h-4 w-4" /> Code</TabsTrigger>
                            <TabsTrigger value="science"><FlaskConical className="mr-2 h-4 w-4" /> Science</TabsTrigger>
                            <TabsTrigger value="general"><Globe className="mr-2 h-4 w-4" /> General</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    {renderContent()}
                </CardContent>
            </Card>
            <Card className="flex-1 w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Award className="text-amber-500"/> How to Play</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                        <Brain className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                        <p>You get <span className="font-bold text-foreground">5 total words</span> to solve each day across all categories.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                        <p>Earn <span className="font-bold text-foreground">{CREDIT_PER_WORD} credit</span> for each word you solve correctly.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <HelpCircle className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                        <p>Choose a category and test your knowledge. Good luck!</p>
                    </div>
                     <div className="pt-4">
                        <p className="font-bold text-foreground">Progress Today: <span className={cn(solvedWords.length > 0 && "text-primary")}>{solvedWords.length} / {DAILY_WORD_LIMIT}</span></p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

