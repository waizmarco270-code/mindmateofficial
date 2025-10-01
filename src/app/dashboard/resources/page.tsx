
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookMarked, BrainCircuit, Dna, Rocket, Stethoscope, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';


const resourceCategories = [
    {
        title: "Class 10 Resources",
        description: "Comprehensive notes, guides, and practice materials for your board exams.",
        icon: GraduationCap,
        href: "/dashboard/resources/class-10",
        color: "from-blue-800 via-slate-900 to-slate-900",
        shadow: "shadow-blue-500/20",
        iconColor: 'text-blue-400',
    },
    {
        title: "Class 12 Resources",
        description: "Advanced materials, previous year papers, and in-depth guides for all streams.",
        icon: GraduationCap,
        href: "/dashboard/resources/class-12",
        color: "from-purple-800 via-slate-900 to-slate-900",
        shadow: "shadow-purple-500/20",
        iconColor: 'text-purple-400',
    },
    {
        title: "JEE Resources",
        description: "Unlock premium content for Mains and Advanced, including mock tests and formula sheets.",
        icon: Rocket,
        href: "/dashboard/resources/jee",
        color: "from-amber-800 via-slate-900 to-slate-900",
        shadow: "shadow-amber-500/20",
        iconColor: 'text-amber-400',
    },
    {
        title: "NEET Resources",
        description: "Specialized study materials for medical aspirants, covering biology, physics, and chemistry.",
        icon: Stethoscope,
        href: "/dashboard/resources/neet",
        color: "from-green-800 via-slate-900 to-slate-900",
        shadow: "shadow-green-500/20",
        iconColor: 'text-green-400',
    },
    {
        title: "Class 6-9 Resources",
        description: "Foundational concepts, interactive guides, and practice exercises for middle school.",
        icon: BrainCircuit,
        href: "/dashboard/resources/class-6-9",
        color: "from-rose-800 via-slate-900 to-slate-900",
        shadow: "shadow-rose-500/20",
        iconColor: 'text-rose-400',
    },
    {
        title: "General Resources",
        description: "A collection of free, useful documents and links to aid your studies.",
        icon: BookMarked,
        href: "/dashboard/resources/general",
        color: "from-slate-800 via-slate-900 to-slate-900",
        shadow: "shadow-slate-500/20",
        iconColor: 'text-slate-400',
    },
]

export default function ResourcesHubPage() {
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Resource Library</h1>
                <p className="text-muted-foreground">Your central hub for all study materials. Select a category to begin.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {resourceCategories.map((category, index) => (
                    <motion.div
                        key={category.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full"
                    >
                         <Link href={category.href} className="group block h-full">
                           <Card className={cn("group relative text-white overflow-hidden rounded-xl p-px hover:shadow-lg transition-all duration-300 flex flex-col justify-center h-full", category.shadow)}>
                                <div className={cn("absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 z-0 opacity-80", category.color)}></div>
                                <div className="absolute inset-0 bg-grid-slate-800/50 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <CardContent className="p-4 sm:p-6 text-center relative z-10 space-y-3">
                                    <category.icon className={cn("h-10 w-10 mx-auto", category.iconColor)} />
                                    <h3 className="text-lg font-semibold">{category.title}</h3>
                                    <p className="text-xs text-slate-400 hidden sm:block">{category.description}</p>
                                </CardContent>
                            </Card>
                         </Link>
                    </motion.div>
                ))}
            </div>

        </div>
    );
}
