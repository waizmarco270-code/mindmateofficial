
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Swords, Shield, Trophy, Skull, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useChallenges } from '@/hooks/use-challenges';
import { Badge } from '@/components/ui/badge';


const challengeCategories = [
    {
        title: "7-Day Warrior",
        description: "A week-long sprint to build discipline and kickstart your comeback.",
        icon: Shield,
        href: "/dashboard/challenger/7-day-warrior",
        color: "from-green-500 to-emerald-500",
        shadow: "shadow-green-500/30",
        tag: "Beginner"
    },
    {
        title: "14-Day Exclusive",
        description: "Two weeks of intense focus to solidify your study habits and knowledge base.",
        icon: Swords,
        href: "/dashboard/challenger/14-day-exclusive",
        color: "from-blue-500 to-sky-500",
        shadow: "shadow-blue-500/30",
        tag: "Intermediate"
    },
    {
        title: "21-Day Training Arc",
        description: "Three weeks to forge an unbreakable study routine and master your subjects.",
        icon: Trophy,
        href: "/dashboard/challenger/21-day-training-arc",
        color: "from-purple-500 to-indigo-500",
        shadow: "shadow-purple-500/30",
        tag: "Advanced"
    },
    {
        title: "Month Bustor",
        description: "The ultimate 30-day challenge. Emerge as a true academic weapon.",
        icon: Skull,
        href: "/dashboard/challenger/month-bustor",
        color: "from-red-500 to-rose-500",
        shadow: "shadow-red-500/30",
        tag: "Legendary"
    },
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

    // Dynamically adjust grid columns based on number of items
    const gridColsClass = challengeCategories.length === 5 
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" // Your original for odd numbers might need custom layout
        : "grid-cols-1 md:grid-cols-2";

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <Swords className="h-8 w-8 text-primary" />
                  Challenger Zone
                </h1>
                <p className="text-muted-foreground">Forge discipline, complete epic study challenges, and earn legendary rewards.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {challengeCategories.map((category, index) => {
                    const isActive = activeChallenge?.challengeId === category.title || (activeChallenge?.isCustom && category.title === "Create Your Own Challenge");
                    const isDisabled = activeChallenge && !isActive;

                    const href = isActive && activeChallenge?.isCustom ? "/dashboard/challenger/custom" : category.href;


                    return (
                        <motion.div
                            key={category.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={cn(
                                isDisabled && "opacity-50 cursor-not-allowed",
                                category.title === "Create Your Own Challenge" && "lg:col-span-1 md:col-span-2"
                            )}
                        >
                            <Link href={isDisabled ? '#' : href} className={cn("block h-full", isDisabled && "pointer-events-none")}>
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
                                           {category.title === "Create Your Own Challenge" ? "Create Challenge" : (isActive ? "Continue Challenge" : "View Challenge")} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
