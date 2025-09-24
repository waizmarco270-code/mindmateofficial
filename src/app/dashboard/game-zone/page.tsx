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
        color: "text-rose-400",
        shadow: "shadow-rose-500/30"
    },
    {
        title: "Strategy",
        description: "Challenge your mind with classic strategy games.",
        icon: Swords,
        href: "/dashboard/game-zone/strategy",
        color: "text-amber-400",
        shadow: "shadow-amber-500/30"
    },
    {
        title: "Puzzle",
        description: "Solve clever puzzles and subject-based sprints.",
        icon: Brain,
        href: "/dashboard/game-zone/puzzle",
        color: "text-purple-400",
        shadow: "shadow-purple-500/30"
    },
    {
        title: "Word Games",
        description: "Unscramble and hunt for words to test your vocabulary.",
        icon: Newspaper,
        href: "/dashboard/game-zone/word-games",
        color: "text-sky-400",
        shadow: "shadow-sky-500/30"
    },
     {
        title: "Memory",
        description: "Train your brain by remembering complex patterns.",
        icon: Dice5,
        href: "/dashboard/game-zone/memory",
        color: "text-green-400",
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
            
            <div className="space-y-8">
                {/* Premium Game Card */}
                <Link href="/dashboard/game-zone/premium" className="group block">
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
                                <span className="hidden sm:inline">Explore</span> <ArrowRight className="sm:ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </Link>
                
                {/* Other Game Categories */}
                <div className="grid grid-cols-2 gap-4">
                    {gameCategories.map((category, index) => (
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

        </div>
    );
}
