
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Atom, ArrowRight, ArrowLeft, Trophy } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SignedOut, useUser } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';
import { useUsers } from '@/hooks/use-admin';
import { useMemo } from 'react';

interface BlockInfo {
    id: 's' | 'p' | 'd' | 'f';
    name: string;
    description: string;
    color: string;
}

const blocks: BlockInfo[] = [
    { id: 's', name: 'S-Block', description: 'Master the alkali and alkaline earth metals.', color: 'from-rose-500 to-red-500' },
    { id: 'p', name: 'P-Block', description: 'Explore the diverse p-block elements.', color: 'from-amber-500 to-yellow-500' },
    { id: 'd', name: 'D-Block', description: 'Dive into the transition metals.', color: 'from-sky-500 to-blue-500' },
    { id: 'f', name: 'F-Block', description: 'Challenge yourself with the lanthanides and actinides.', color: 'from-emerald-500 to-green-500' },
];

export default function ElementQuestChallengeHubPage() {
    const { currentUserData } = useUsers();

    const totalScore = useMemo(() => {
        if (!currentUserData?.elementQuestScores) return 0;
        const { s = 0, p = 0, d = 0, f = 0 } = currentUserData.elementQuestScores;
        return s + p + d + f;
    }, [currentUserData]);


    return (
        <div className="space-y-8">
            <div>
                 <Link href="/dashboard/game-zone/premium" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block"><ArrowLeft className="inline h-4 w-4 mr-1"/>Back to Premium Games</Link>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <Atom className="h-8 w-8 text-primary" />
                  Element Quest: Challenge Mode
                </h1>
                <p className="text-muted-foreground">Select a block to begin your mission to master the periodic table.</p>
            </div>

            <Card className="relative">
                 <SignedOut>
                    <LoginWall title="Unlock Element Quest" description="Sign up to play this periodic table game, test your chemistry knowledge, and master the elements." />
                </SignedOut>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Choose Your Challenge</CardTitle>
                    <CardDescription>Which block of the periodic table will you conquer today?</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                    {blocks.map((block, index) => {
                        const highScore = currentUserData?.elementQuestScores?.[block.id] || 0;
                        return (
                            <motion.div
                                key={block.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Link href={`/dashboard/game-zone/puzzle/periodic-table/${block.id}-block`} className="block h-full group">
                                <Card className={cn(
                                    "h-full flex flex-col justify-between text-center p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br",
                                    block.color
                                )}>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h3 className="text-2xl font-bold text-white">{block.name}</h3>
                                            <p className="text-sm text-white/80 mt-2">{block.description}</p>
                                        </div>
                                        <div className="mt-4">
                                            <div className="text-white/80 text-xs font-semibold mb-2">HIGH SCORE: {highScore}</div>
                                            <Button variant="secondary" className="w-full">
                                                Start Challenge <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                </Link>
                            </motion.div>
                        )
                    })}
                </CardContent>
                 <CardFooter className="justify-center">
                    <div className="p-3 rounded-lg bg-muted text-center">
                        <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500"/> Total Score</p>
                        <p className="text-3xl font-bold">{totalScore} / 400</p>
                    </div>
                 </CardFooter>
            </Card>
        </div>
    );
}
