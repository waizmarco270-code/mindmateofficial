'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Gem, VenetianMask, Layers, Key, TowerControl, Gift } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRewards } from '@/hooks/use-rewards';
import { Badge } from '@/components/ui/badge';


const rewardCategories = [
    {
        title: "Crystal Growth",
        description: "Invest your credits and watch them grow over time. A test of patience.",
        icon: Gem,
        href: "/dashboard/reward/crystal-growth",
        color: "from-blue-500 to-sky-500",
        shadow: "shadow-blue-500/30"
    },
    {
        title: "Codebreaker",
        description: "Crack the secret 4-digit code in 6 tries to win a scaling prize.",
        icon: Key,
        href: "/dashboard/reward/codebreaker",
        color: "from-green-500 to-emerald-500",
        shadow: "shadow-green-500/30",
        tag: "New"
    },
    {
        title: "Trivia Tower",
        description: "Climb the tower of questions. Risk it all for the grand prize.",
        icon: TowerControl,
        href: "/dashboard/reward/trivia-tower",
        color: "from-purple-500 to-indigo-500",
        shadow: "shadow-purple-500/30",
        tag: "New"
    },
    {
        title: "Card Flip",
        description: "Find the hidden prize to advance. One loss ends your daily run.",
        icon: Layers,
        href: "/dashboard/reward/card-flip",
        color: "from-red-500 to-rose-500",
        shadow: "shadow-red-500/30",
        tag: "Luck"
    },
    {
        title: "Scratch Card",
        description: "A classic daily chance to scratch and win instant credit prizes.",
        icon: VenetianMask,
        href: "/dashboard/reward/scratch-card",
        color: "from-amber-500 to-orange-500",
        shadow: "shadow-amber-500/30",
        tag: "Luck"
    },
]

export default function RewardZoneHubPage() {
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <Gift className="h-8 w-8 text-primary" />
                  Reward Zone
                </h1>
                <p className="text-muted-foreground">Claim your daily rewards and test your luck for a chance to win prizes!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rewardCategories.map((category, index) => (
                    <motion.div
                        key={category.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <Link href={category.href} className="block h-full">
                           <Card className={cn(
                               "h-full group relative overflow-hidden flex flex-col justify-between transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2",
                               category.shadow
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
                                       {category.tag && <Badge variant="secondary">{category.tag}</Badge>}
                                   </div>
                               </CardHeader>
                               <CardContent>
                                   <p className="text-muted-foreground">{category.description}</p>
                               </CardContent>
                               <CardContent>
                                    <Button variant="outline" className="w-full bg-background/50 group-hover:bg-background transition-colors">
                                       Play Now <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                   </Button>
                               </CardContent>
                           </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>

        </div>
    );
}
