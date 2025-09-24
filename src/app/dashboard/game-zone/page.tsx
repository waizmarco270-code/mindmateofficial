
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Orbit, Swords, Brain, Newspaper, Dice5, Gamepad2, Crown } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';


const gameCategories = [
    {
        title: "Arcade",
        description: "Test your reflexes in fast-paced action games.",
        icon: Orbit,
        href: "/dashboard/game-zone/arcade",
        color: "from-rose-500 to-red-500",
        shadow: "shadow-rose-500/30"
    },
    {
        title: "Strategy",
        description: "Challenge your mind with classic strategy games.",
        icon: Swords,
        href: "/dashboard/game-zone/strategy",
        color: "from-amber-500 to-orange-500",
        shadow: "shadow-amber-500/30"
    },
    {
        title: "Puzzle",
        description: "Solve clever puzzles and subject-based sprints.",
        icon: Brain,
        href: "/dashboard/game-zone/puzzle",
        color: "from-purple-500 to-indigo-500",
        shadow: "shadow-purple-500/30"
    },
    {
        title: "Word Games",
        description: "Unscramble and hunt for words to test your vocabulary.",
        icon: Newspaper,
        href: "/dashboard/game-zone/word-games",
        color: "from-sky-500 to-blue-500",
        shadow: "shadow-sky-500/30"
    },
     {
        title: "Memory",
        description: "Train your brain by remembering complex patterns.",
        icon: Dice5,
        href: "/dashboard/game-zone/memory",
        color: "from-green-500 to-emerald-500",
        shadow: "shadow-green-500/30"
    },
];

export default function GameZoneHubPage() {
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <Gamepad2 className="h-8 w-8 text-primary" />
                  Game Zone
                </h1>
                <p className="text-muted-foreground">Relax, play some games, and earn credits!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {gameCategories.map((category, index) => (
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
                                   <div className="flex items-center gap-4">
                                       <div className={cn("p-3 rounded-lg bg-gradient-to-br", category.color)}>
                                            <category.icon className="h-6 w-6 text-white"/>
                                       </div>
                                       <CardTitle>{category.title}</CardTitle>
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
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                 >
                     <Link href="/dashboard/game-zone/premium" className="block h-full">
                        <Card className="h-full group relative overflow-hidden flex flex-col justify-between transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 shadow-yellow-500/30 border-yellow-500/50">
                             <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-tr from-yellow-400 to-amber-600"></div>
                             <div className="absolute inset-0 w-full h-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:400%_100%]"></div>
                             <CardHeader>
                                   <div className="flex items-center gap-4">
                                       <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500">
                                            <Crown className="h-6 w-6 text-white animate-gold-shine"/>
                                       </div>
                                       <CardTitle className="text-white [text-shadow:0_0_10px_#f59e0b]">Premium Games</CardTitle>
                                   </div>
                               </CardHeader>
                               <CardContent>
                                   <p className="text-amber-100/80">Exclusive games with unique challenges and legendary rewards.</p>
                               </CardContent>
                               <CardContent>
                                    <Button variant="outline" className="w-full bg-background/50 group-hover:bg-background transition-colors">
                                       Explore <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                   </Button>
                               </CardContent>
                        </Card>
                     </Link>
                 </motion.div>
            </div>

        </div>
    );
}

    
