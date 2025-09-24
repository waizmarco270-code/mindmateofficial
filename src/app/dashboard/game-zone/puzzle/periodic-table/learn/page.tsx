
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Atom, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SignedOut } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';

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

export default function ElementQuestLearnHubPage() {
    return (
        <div className="space-y-8">
            <div>
                 <Link href="/dashboard/game-zone/puzzle/periodic-table" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block"><ArrowLeft className="inline h-4 w-4 mr-1"/>Back to Modes</Link>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <Atom className="h-8 w-8 text-primary" />
                  Element Quest: Learn Mode
                </h1>
                <p className="text-muted-foreground">Select a block to explore its elements and their properties.</p>
            </div>

            <Card className="relative">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Choose a Block to Learn</CardTitle>
                    <CardDescription>Select a block to see all its elements in place.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                    {blocks.map((block, index) => (
                        <motion.div
                            key={block.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                             <Link href={`/dashboard/game-zone/puzzle/periodic-table/learn/${block.id}-block`} className="block h-full group">
                               <Card className={cn(
                                   "h-full flex flex-col justify-between text-center p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br",
                                   block.color
                                )}>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{block.name}</h3>
                                        <p className="text-sm text-white/80 mt-2">{block.description}</p>
                                    </div>
                                    <Button variant="secondary" className="mt-6 w-full">
                                       Explore Block <ArrowRight className="ml-2 h-4 w-4" />
                                   </Button>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
