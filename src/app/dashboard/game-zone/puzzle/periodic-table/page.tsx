
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
        description: 'Explore the periodic table. No timer, no pressure.',
        icon: Book,
        href: '/dashboard/game-zone/puzzle/periodic-table/learn',
        shape: 'hexagon',
        color: 'from-blue-500 to-sky-500',
        shadow: 'shadow-blue-500/30'
    },
    {
        id: 'challenge',
        title: 'Challenge Mode',
        description: 'Race against the clock to place elements correctly.',
        icon: Sparkles,
        href: '/dashboard/game-zone/puzzle/periodic-table/challenge',
        shape: 'triangle',
        color: 'from-red-500 to-rose-500',
        shadow: 'shadow-red-500/30'
    },
     {
        id: 'practice',
        title: 'Practice Mode',
        description: 'Test your knowledge with hints and a relaxed pace.',
        icon: Brain,
        href: '#',
        shape: 'circle',
        color: 'from-amber-500 to-yellow-500',
        shadow: 'shadow-amber-500/30',
        disabled: true
    },
];

const Shape = ({ shape, className }: { shape: string, className?: string }) => {
    switch (shape) {
        case 'hexagon':
            return <div className={cn("hexagon-clipper", className)}><div className={cn("h-full w-full bg-gradient-to-br", className)}></div></div>;
        case 'triangle':
             return <div className={cn("triangle-clipper", className)}><div className={cn("h-full w-full bg-gradient-to-br", className)}></div></div>;
        case 'circle':
        default:
            return <div className={cn("rounded-full", className)}><div className={cn("h-full w-full rounded-full bg-gradient-to-br", className)}></div></div>;
    }
}

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 pt-10">
                {gameModes.map((mode, index) => (
                    <motion.div
                        key={mode.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={cn("relative flex flex-col items-center text-center group", mode.disabled && "opacity-50 cursor-not-allowed")}
                    >
                         <Link href={mode.href} className={cn("block h-full w-full", mode.disabled && "pointer-events-none")}>
                           <motion.div
                             animate={{ y: [-5, 5] }}
                             transition={{
                                repeat: Infinity,
                                repeatType: "reverse",
                                duration: 2.5,
                                delay: index * 0.2,
                                ease: "easeInOut"
                             }}
                             className={cn(
                               "relative h-48 w-48 flex items-center justify-center transition-all duration-300 ease-in-out group-hover:scale-110", 
                               mode.shadow, 'hover:shadow-2xl'
                             )}
                           >
                              <Shape shape={mode.shape} className={cn("h-full w-full absolute", mode.color)} />
                              <div className="absolute inset-0 bg-grid-slate-800/30 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                               <div className="relative z-10 flex flex-col items-center justify-center p-4 text-white">
                                 <mode.icon className="h-16 w-16 mb-2 text-shadow-glow" />
                               </div>
                           </motion.div>

                            <div className="mt-6">
                                <h3 className="text-2xl font-bold">{mode.title}</h3>
                                <p className="text-muted-foreground mt-1 h-12">{mode.description}</p>
                                 <Button variant="outline" className="mt-4 bg-background/50 group-hover:bg-background transition-colors">
                                   {mode.disabled ? 'Coming Soon' : `Start ${mode.title}`} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                               </Button>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
