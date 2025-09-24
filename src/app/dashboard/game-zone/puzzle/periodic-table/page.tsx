
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Atom, ArrowRight, Book, Sparkles, Brain } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SignedOut } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';

const gameModes = [
    {
        id: 'learn',
        title: 'Learn Mode',
        description: 'Explore the periodic table blocks. Click on elements to see their details. No timer, no pressure.',
        icon: Book,
        href: '/dashboard/game-zone/puzzle/periodic-table/learn',
        color: 'from-blue-500 to-sky-500',
        shadow: 'shadow-blue-500/30'
    },
    {
        id: 'practice',
        title: 'Practice Mode',
        description: 'Test your knowledge with hints and a relaxed pace. (Coming Soon!)',
        icon: Brain,
        href: '#',
        color: 'from-amber-500 to-yellow-500',
        shadow: 'shadow-amber-500/30',
        disabled: true
    },
    {
        id: 'challenge',
        title: 'Challenge Mode',
        description: 'Race against the clock to place elements correctly. A true test of your memory and speed.',
        icon: Sparkles,
        href: '/dashboard/game-zone/puzzle/periodic-table/challenge',
        color: 'from-red-500 to-rose-500',
        shadow: 'shadow-red-500/30'
    },
];

export default function ElementQuestHubPage() {
    return (
        <div className="space-y-8">
            <div>
                 <Link href="/dashboard/game-zone/puzzle" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Puzzle Games</Link>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <Atom className="h-8 w-8 text-primary" />
                  Element Quest
                </h1>
                <p className="text-muted-foreground">Learn, practice, and challenge your knowledge of the periodic table.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {gameModes.map((mode, index) => (
                    <motion.div
                        key={mode.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={cn(mode.disabled && "opacity-50 cursor-not-allowed")}
                    >
                         <Link href={mode.href} className={cn("block h-full", mode.disabled && "pointer-events-none")}>
                           <Card className={cn(
                               "h-full group relative overflow-hidden flex flex-col justify-between transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2",
                               mode.shadow
                            )}>
                               <div className={cn("absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-tr", mode.color)}></div>
                               <CardHeader>
                                   <div className="flex items-center gap-4">
                                       <div className={cn("p-3 rounded-lg bg-gradient-to-br", mode.color)}>
                                            <mode.icon className="h-6 w-6 text-white"/>
                                       </div>
                                       <CardTitle>{mode.title}</CardTitle>
                                   </div>
                               </CardHeader>
                               <CardContent>
                                   <p className="text-muted-foreground">{mode.description}</p>
                               </CardContent>
                               <CardContent>
                                    <Button variant="outline" className="w-full bg-background/50 group-hover:bg-background transition-colors">
                                       {mode.disabled ? 'Coming Soon' : `Start ${mode.title}`} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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

