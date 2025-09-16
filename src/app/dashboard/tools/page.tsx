'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Percent, LayoutList, Wrench } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';


const toolCategories = [
    {
        title: "Percentage Calculator",
        description: "Calculate your exam percentage based on the 'Best of 5' rule.",
        icon: Percent,
        href: "/dashboard/calculator",
        color: "from-lime-500 to-green-500",
        shadow: "shadow-lime-500/30"
    },
    {
        title: "Timetable Generator",
        description: "Create a personalized study schedule tailored to your daily routine.",
        icon: LayoutList,
        href: "/dashboard/timetable-generator",
        color: "from-sky-500 to-blue-500",
        shadow: "shadow-sky-500/30"
    },
]

export default function ToolsHubPage() {
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <Wrench className="h-8 w-8 text-primary" />
                  Tools
                </h1>
                <p className="text-muted-foreground">A collection of utilities to help with your studies.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {toolCategories.map((category, index) => (
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
                                       Open Tool <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
