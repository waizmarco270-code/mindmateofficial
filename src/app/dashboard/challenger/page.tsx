
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Swords } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useChallenges } from '@/hooks/use-challenges';
import { Badge } from '@/components/ui/badge';


const challengeCategories = [
    {
        title: "Create Your Own Challenge",
        description: "Forge your own path. Set custom goals, duration, and difficulty.",
        icon: Swords, // Changed from PlusCircle
    },
];

export default function ChallengerHubPage() {
    const { activeChallenge } = useChallenges();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <Swords className="h-8 w-8 text-primary" />
                  Challenger Zone
                </h1>
                <p className="text-muted-foreground">Forge discipline, complete epic study challenges, and earn legendary rewards.</p>
            </div>
            
            <div className="flex justify-center">
                {challengeCategories.map((category, index) => {
                    const isActive = activeChallenge?.isCustom;
                    const href = isActive ? "/dashboard/challenger/custom" : "/dashboard/challenger/create";

                    return (
                        <motion.div
                            key={category.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="w-full max-w-md"
                        >
                            <Link href={href} className="block h-full group">
                               <Card className={cn(
                                   "h-full relative overflow-hidden flex flex-col justify-between transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 challenger-shimmer border-red-500/30",
                                   isActive && "ring-4 ring-primary"
                                )}>
                                   <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300 bg-grid-slate-800"></div>
                                   <CardHeader>
                                       <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                               <div className={cn("p-3 rounded-lg bg-red-500/10 border border-red-500/20")}>
                                                    <category.icon className="h-8 w-8 text-red-400 group-hover:animate-pulse [filter:drop-shadow(0_0_8px_currentColor)]"/>
                                               </div>
                                               <CardTitle className="text-2xl text-white">{category.title}</CardTitle>
                                           </div>
                                           {isActive && <Badge variant="destructive" className="animate-pulse">ACTIVE</Badge>}
                                       </div>
                                   </CardHeader>
                                   <CardContent>
                                       <p className="text-slate-400">{category.description}</p>
                                   </CardContent>
                                   <CardContent>
                                        <Button variant="outline" className="w-full bg-background/50 group-hover:bg-background transition-colors text-base font-bold">
                                           {isActive ? "Continue Challenge" : "Create Your Legend"} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                       </Button>
                                   </CardContent>
                               </Card>
                            </Link>
                        </motion.div>
                    )
                })}
            </div>

        </div>
    );
}
