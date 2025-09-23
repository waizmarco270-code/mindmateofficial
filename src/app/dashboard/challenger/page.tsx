
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Swords, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useChallenges } from '@/hooks/use-challenges';
import { Badge } from '@/components/ui/badge';


const challengeCategories = [
    {
        title: "Create Your Own Challenge",
        description: "Forge your own path. Set custom goals, duration, and difficulty.",
        icon: PlusCircle,
        href: "/dashboard/challenger/create",
        color: "from-amber-500 to-orange-500",
        shadow: "shadow-amber-500/30",
        tag: "Custom"
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
                    const href = isActive ? "/dashboard/challenger/custom" : category.href;

                    return (
                        <motion.div
                            key={category.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="w-full max-w-md"
                        >
                            <Link href={href} className="block h-full">
                               <Card className={cn(
                                   "h-full group relative overflow-hidden flex flex-col justify-between transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2",
                                   category.shadow,
                                   isActive && "ring-4 ring-primary"
                                )}>
                                   <div className={cn("absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-tr", category.color)}></div>
                                   <CardHeader>
                                       <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                               <div className={cn("p-3 rounded-lg bg-gradient-to-br", category.color)}>
                                                    <category.icon className="h-6 w-6 text-white"/>
                                               </div>
                                               <CardTitle>{category.title}</CardTitle>
                                           </div>
                                           {isActive && <Badge variant="destructive" className="animate-pulse">ACTIVE</Badge>}
                                       </div>
                                   </CardHeader>
                                   <CardContent>
                                       <p className="text-muted-foreground">{category.description}</p>
                                   </CardContent>
                                   <CardContent>
                                        <Button variant="outline" className="w-full bg-background/50 group-hover:bg-background transition-colors">
                                           {isActive ? "Continue Challenge" : "Create Challenge"} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
