
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Atom, ArrowRight, ArrowLeft, Trophy, Award, CheckCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SignedOut, useUser } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';
import { useAdmin, useUsers } from '@/hooks/use-admin';
import { useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface BlockInfo {
    id: 's' | 'p' | 'd' | 'f';
    name: string;
    description: string;
    color: string;
    targetTime: number; // in seconds
}

const blocks: BlockInfo[] = [
    { id: 's', name: 'S-Block', description: 'Master the alkali and alkaline earth metals.', color: 'from-rose-500 to-red-500', targetTime: 60 },
    { id: 'p', name: 'P-Block', description: 'Explore the diverse p-block elements.', color: 'from-amber-500 to-yellow-500', targetTime: 240 },
    { id: 'd', name: 'D-Block', description: 'Dive into the transition metals.', color: 'from-sky-500 to-blue-500', targetTime: 300 },
    { id: 'f', name: 'F-Block', description: 'Challenge yourself with the lanthanides and actinides.', color: 'from-emerald-500 to-green-500', targetTime: 360 },
];

const MILESTONE_REWARDS = {
    100: 50,
    200: 100,
    300: 150,
    400: 200,
};
type Milestone = keyof typeof MILESTONE_REWARDS;

export default function ElementQuestChallengeHubPage() {
    const { user } = useUser();
    const { currentUserData } = useUsers();
    const { claimElementQuestMilestone } = useAdmin();
    const { toast } = useToast();

    const totalScore = useMemo(() => {
        if (!currentUserData?.elementQuestScores) return 0;
        const { s = 0, p = 0, d = 0, f = 0 } = currentUserData.elementQuestScores;
        return s + p + d + f;
    }, [currentUserData]);
    
    const handleClaim = async (milestone: Milestone) => {
        if (!user) return;
        try {
            await claimElementQuestMilestone(user.id, milestone);
            toast({
                title: "Reward Claimed!",
                description: `+${MILESTONE_REWARDS[milestone]} credits have been added to your account.`,
                className: "bg-green-500/10 text-green-700 border-green-500/50"
            });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Claim Failed", description: error.message });
        }
    }


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
            
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <AccordionTrigger>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                           <Info className="h-5 w-5 text-primary"/> How Scoring Works
                        </h3>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2 text-muted-foreground text-sm">
                           <p>Your score is based on how fast you complete each block. The quicker you are, the higher your score!</p>
                           <ul className="list-disc pl-5 space-y-1">
                               <li>Finishing almost instantly gives you the maximum score of <span className="font-bold text-foreground">100 points</span>.</li>
                               <li>Finishing at or after the <span className="font-bold text-foreground">Target Time</span> gives you the minimum score of <span className="font-bold text-foreground">1 point</span>.</li>
                               <li>Your score decreases as you take more time. Aim to be as fast as possible!</li>
                           </ul>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="relative h-full">
                        <SignedOut>
                            <LoginWall title="Unlock Element Quest" description="Sign up to play this periodic table game, test your chemistry knowledge, and master the elements." />
                        </SignedOut>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-bold">Choose Your Challenge</CardTitle>
                            <CardDescription>Each block has a target time. Beat it to maximize your score!</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
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
                                                    <div className="mt-4 text-sm font-bold bg-black/30 text-white/90 rounded-full px-3 py-1 self-center">
                                                       Target: {block.targetTime / 60} min
                                                    </div>
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
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="items-center">
                             <div className="p-3 rounded-lg bg-muted text-center">
                                <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500"/> Total Score</p>
                                <p className="text-3xl font-bold">{totalScore} / 400</p>
                            </div>
                        </CardHeader>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2"><Award className="text-green-500"/> Milestone Rewards</CardTitle>
                            <CardDescription>Claim one-time rewards for reaching score milestones.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {(Object.keys(MILESTONE_REWARDS) as unknown as Milestone[]).map(milestone => {
                                const reward = MILESTONE_REWARDS[milestone];
                                const hasClaimed = currentUserData?.elementQuestMilestonesClaimed?.includes(milestone);
                                const canClaim = totalScore >= milestone && !hasClaimed;

                                return (
                                    <div key={milestone} className={cn(
                                        "flex items-center justify-between p-3 rounded-lg border",
                                        hasClaimed ? "bg-green-500/10 border-green-500/20" : "bg-muted/50"
                                    )}>
                                        <div>
                                            <p className={cn("font-bold", hasClaimed && "text-muted-foreground")}>Score {milestone}</p>
                                            <p className={cn("text-sm font-semibold", hasClaimed ? "text-green-600" : "text-primary")}>+{reward} Credits</p>
                                        </div>
                                        {hasClaimed ? (
                                            <div className="flex items-center gap-2 text-sm font-semibold text-green-600"><CheckCircle className="h-4 w-4"/> Claimed</div>
                                        ) : (
                                            <Button size="sm" disabled={!canClaim} onClick={() => handleClaim(milestone)}>Claim</Button>
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
