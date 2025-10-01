
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
        color: "from-blue-500 to-sky-500",
        shadow: "shadow-blue-500/30"
    },
    {
        title: "Class 12 Resources",
        description: "Advanced materials, previous year papers, and in-depth guides for all streams.",
        icon: GraduationCap,
        href: "/dashboard/resources/class-12",
        color: "from-purple-500 to-indigo-500",
        shadow: "shadow-purple-500/30"
    },
    {
        title: "JEE Resources",
        description: "Unlock premium content for Mains and Advanced, including mock tests and formula sheets.",
        icon: Rocket,
        href: "/dashboard/resources/jee",
        color: "from-amber-500 to-orange-500",
        shadow: "shadow-amber-500/30"
    },
    {
        title: "NEET Resources",
        description: "Specialized study materials for medical aspirants, covering biology, physics, and chemistry.",
        icon: Stethoscope,
        href: "/dashboard/resources/neet",
        color: "from-green-500 to-emerald-500",
        shadow: "shadow-green-500/30"
    },
    {
        title: "Class 6-9 Resources",
        description: "Foundational concepts, interactive guides, and practice exercises for middle school.",
        icon: BrainCircuit,
        href: "/dashboard/resources/class-6-9",
        color: "from-rose-500 to-red-500",
        shadow: "shadow-rose-500/30"
    },
    {
        title: "General Resources",
        description: "A collection of free, useful documents and links to aid your studies.",
        icon: BookMarked,
        href: "/dashboard/resources/general",
        color: "from-slate-500 to-gray-500",
        shadow: "shadow-slate-500/30"
    },
]

export default function ResourcesHubPage() {
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Resource Library</h1>
                <p className="text-muted-foreground">Your central hub for all study materials. Select a category to begin.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resourceCategories.map((category, index) => (
                    <motion.div
                        key={category.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full"
                    >
                        <Link href={category.href} className="block h-full group">
                           <Card className={cn(
                               "h-full group relative overflow-hidden flex flex-col justify-between transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 bg-slate-900 border-slate-800",
                               category.shadow
                            )}>
                               <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-tr", category.color)}></div>
                               <CardHeader>
                                   <div className="flex items-center gap-4">
                                       <div className={cn("p-3 rounded-lg bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600")}>
                                            <category.icon className="h-6 w-6 text-white"/>
                                       </div>
                                       <CardTitle className="text-xl">{category.title}</CardTitle>
                                   </div>
                               </CardHeader>
                               <CardContent>
                                   <p className="text-muted-foreground">{category.description}</p>
                               </CardContent>
                               <CardFooter>
                                    <Button variant="outline" className="w-full bg-slate-800/50 border-slate-700 group-hover:bg-slate-800 group-hover:border-slate-600 transition-colors">
                                       View Resources <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                   </Button>
                               </CardFooter>
                           </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>

        </div>
    );
}
