'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Orbit, Swords, Brain, Newspaper, Dice5, Gamepad2, Crown, Lock, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/hooks/use-admin';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { lockableFeatures } from '@/lib/features';
import { FeatureUnlockDialog } from '@/components/dashboard/feature-unlock-dialog';
import { Separator } from '@/components/ui/separator';


const gameCategories = [
    {
        id: 'arcade',
        title: "Arcade",
        description: "Test your reflexes in fast-paced action games.",
        icon: Orbit,
        href: "/dashboard/game-zone/arcade",
        color: "text-rose-400",
        shadow: "shadow-rose-500/30"
    },
    {
        id: 'strategy',
        title: "Strategy",
        description: "Challenge your mind with classic strategy games.",
        icon: Swords,
        href: "/dashboard/game-zone/strategy",
        color: "text-amber-400",
        shadow: "shadow-amber-500/30"
    },
    {
        id: 'puzzle',
        title: "Puzzle",
        description: "Solve clever puzzles and subject-based sprints.",
        icon: Brain,
        href: "/dashboard/game-zone/puzzle",
        color: "text-purple-400",
        shadow: "shadow-purple-500/30"
    },
    {
        id: 'word-games',
        title: "Word Games",
        description: "Unscramble and hunt for words to test your vocabulary.",
        icon: Newspaper,
        href: "/dashboard/game-zone/word-games",
        color: "text-sky-400",
        shadow: "shadow-sky-500/30"
    },
     {
        id: 'memory',
        title: "Memory",
        description: "Train your brain by remembering complex patterns.",
        icon: Dice5,
        href: "/dashboard/game-zone/memory",
        color: "text-green-400",
        shadow: "shadow-green-500/30"
    },
];

const PREMIUM_PASSWORD = "freebydev";
const PREMIUM_FEATURE_ID = 'premium-games';

export default function GameZoneHubPage() {
    const { currentUserData, featureLocks } = useAdmin();
    const [isSessionUnlocked, setIsSessionUnlocked] = useState(false);
    const [isUnlockDialogOpen, setIsUnlockDialogOpen] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [featureToUnlock, setFeatureToUnlock] = useState(false);

    const { toast } = useToast();
    const router = useRouter();

    const isPermanentlyUnlocked = currentUserData?.unlockedFeatures?.includes(PREMIUM_FEATURE_ID);
    const isLocked = !isPermanentlyUnlocked && !isSessionUnlocked;
    
    const handlePremiumClick = (e: React.MouseEvent) => {
        if (!isLocked) {
            router.push('/dashboard/game-zone/premium');
        } else {
            e.preventDefault();
            setIsUnlockDialogOpen(true);
        }
    };
    
    const handlePasswordSubmit = () => {
        if (passwordInput.toLowerCase() === PREMIUM_PASSWORD) {
            setIsSessionUnlocked(true);
            setIsUnlockDialogOpen(false);
            setPasswordInput('');
            toast({
                title: "Temporary Access Granted!",
                description: "Redirecting you to the Premium Games section...",
            });
            router.push('/dashboard/game-zone/premium');
        } else {
            toast({
                variant: 'destructive',
                title: 'Incorrect Password',
                description: 'Please try again.',
            });
        }
    };

    const handlePurchaseClick = () => {
        setIsUnlockDialogOpen(false);
        setFeatureToUnlock(true);
    };
    
    const premiumFeatureDetails = lockableFeatures.find(f => f.id === PREMIUM_FEATURE_ID);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <Gamepad2 className="h-8 w-8 text-primary" />
                  Game Zone
                </h1>
                <p className="text-muted-foreground">Relax, play some games, and earn credits!</p>
            </div>
            
            <div className="space-y-8">
                {/* Premium Game Card */}
                <Link href={'/dashboard/game-zone/premium'} className="group block" onClick={handlePremiumClick}>
                    <Card className="cursor-pointer relative overflow-hidden bg-gradient-to-br from-yellow-900/80 via-black to-black border-yellow-700/50 hover:-translate-y-1 transition-transform duration-300 ease-in-out">
                        <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(to_bottom,white_10%,transparent_70%)] group-hover:opacity-100 transition-opacity duration-300"></div>
                        <CardContent className="relative p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
                            <div className="p-3 sm:p-4 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30">
                                <Crown className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-400 animate-gold-shine"/>
                            </div>
                            <div className="flex-1 text-left">
                                <CardTitle className="text-xl sm:text-2xl font-bold text-yellow-400">Premium Games</CardTitle>
                                <p className="text-yellow-400/70 mt-1 text-sm sm:text-base">Exclusive games with unique challenges and legendary rewards.</p>
                            </div>
                            <Button variant="outline" className="bg-transparent text-white border-white/50 hover:bg-white/10 hover:text-white shrink-0">
                                {isLocked ? <Lock className="sm:mr-2 h-4 w-4" /> : <ArrowRight className="sm:ml-2 h-4 w-4" />}
                                <span className="hidden sm:inline ml-2">{isLocked ? 'Unlock' : 'Explore'}</span> 
                            </Button>
                        </CardContent>
                    </Card>
                </Link>
                
                {/* Other Game Categories */}
                <div className="grid grid-cols-2 gap-4">
                    {gameCategories.map((category) => (
                         <Link href={category.href} className="group block" key={category.title}>
                            <Card className="group relative text-white overflow-hidden rounded-xl p-px hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center h-full">
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 z-0 opacity-80"></div>
                                <div className="absolute inset-0 bg-grid-slate-800/50 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <CardContent className="p-4 sm:p-6 text-center relative z-10 space-y-3">
                                    <category.icon className={cn("h-10 w-10 mx-auto", category.color)} />
                                    <h3 className="text-base font-semibold">{category.title}</h3>
                                </CardContent>
                            </Card>
                         </Link>
                    ))}
                </div>
            </div>
            
            <Dialog open={isUnlockDialogOpen} onOpenChange={setIsUnlockDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unlock Premium Games</DialogTitle>
                        <DialogDescription>
                            Choose how you want to access the premium section.
                        </DialogDescription>
                    </DialogHeader>
                     <div className="py-4 space-y-6">
                        <div className="text-center">
                            <Button onClick={handlePurchaseClick} className="w-full h-16 text-lg">Unlock Permanently (100 Credits)</Button>
                             <p className="text-xs text-muted-foreground mt-2">This is a one-time purchase for lifetime access.</p>
                        </div>
                        
                        <div className="relative">
                            <Separator />
                            <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-2 text-sm text-muted-foreground">OR</span>
                        </div>

                        <div className="space-y-4">
                             <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                                <p className="text-sm text-blue-700 dark:text-blue-300">For a temporary trial, use the password below:</p>
                                <p className="font-mono font-bold text-lg text-blue-600 dark:text-blue-200 mt-2 bg-black/20 py-1 px-2 rounded-md inline-block">{PREMIUM_PASSWORD}</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Temporary Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                                />
                            </div>
                             <Button onClick={handlePasswordSubmit} variant="secondary" className="w-full">
                                <KeyRound className="mr-2 h-4 w-4"/> Enter for this Session
                             </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

             {premiumFeatureDetails && (
                <FeatureUnlockDialog
                    feature={premiumFeatureDetails}
                    isOpen={featureToUnlock}
                    onOpenChange={setFeatureToUnlock}
                />
            )}

        </div>
    );
}
