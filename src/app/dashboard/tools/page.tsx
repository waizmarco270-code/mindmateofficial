
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Percent, LayoutList, Wrench, Lock, FileText, Scale, BookCopy, Image as ImageIcon, QrCode, Youtube, Instagram } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/hooks/use-admin';
import { FeatureUnlockDialog } from '@/components/dashboard/feature-unlock-dialog';
import { lockableFeatures, type LockableFeature } from '@/lib/features';
import { Separator } from '@/components/ui/separator';

const toolCategories = [
    {
        id: 'percentage-calculator',
        title: "Percentage Calculator",
        description: "Calculate your exam percentage based on the 'Best of 5' rule.",
        icon: Percent,
        href: "/dashboard/calculator",
        color: "from-lime-500 to-green-500",
        shadow: "shadow-lime-500/30"
    },
    {
        id: 'timetable-generator',
        title: "Timetable Generator",
        description: "Create a personalized study schedule tailored to your daily routine.",
        icon: LayoutList,
        href: "/dashboard/timetable-generator",
        color: "from-sky-500 to-blue-500",
        shadow: "shadow-sky-500/30"
    },
    {
        id: 'quick-notepad',
        title: "Quick Notepad",
        description: "Jot down thoughts and ideas. Your notes save automatically.",
        icon: FileText,
        href: "/dashboard/tools/notepad",
        color: "from-fuchsia-500 to-purple-500",
        shadow: "shadow-fuchsia-500/30"
    },
    {
        id: 'unit-converter',
        title: "Unit Converter",
        description: "Convert between various units for length, mass, temperature, and more.",
        icon: Scale,
        href: "/dashboard/tools/unit-converter",
        color: "from-red-500 to-orange-500",
        shadow: "shadow-red-500/30"
    },
    {
        id: 'syllabus',
        title: "Syllabus Explorer",
        description: "View and track syllabus for exams like JEE, NEET, and CBSE boards.",
        icon: BookCopy,
        href: "/dashboard/tools/syllabus",
        color: "from-cyan-500 to-teal-500",
        shadow: "shadow-cyan-500/30"
    },
    {
        id: 'image-to-pdf',
        title: "Image to PDF",
        description: "Combine multiple images into a single PDF document.",
        icon: ImageIcon,
        href: "/dashboard/tools/image-to-pdf",
        color: "from-blue-500 to-indigo-500",
        shadow: "shadow-blue-500/30"
    },
    {
        id: 'qr-code-generator',
        title: "QR Code Generator",
        description: "Create custom QR codes for links, text, and more.",
        icon: QrCode,
        href: "/dashboard/tools/qr-code-generator",
        color: "from-slate-500 to-gray-500",
        shadow: "shadow-slate-500/30"
    }
];

const distractionTools = [
    {
        id: 'instagram',
        title: "Instagram Reels",
        description: "Take a 'short' break with endless scrolling.",
        icon: Instagram,
        href: "/dashboard/tools/instagram",
        color: "from-rose-500 via-pink-500 to-purple-500",
        shadow: "shadow-pink-500/30"
    },
    {
        id: 'youtube',
        title: "YouTube Shorts",
        description: "Just one more video... we promise.",
        icon: Youtube,
        href: "/dashboard/tools/youtube",
        color: "from-red-600 to-red-800",
        shadow: "shadow-red-500/30"
    },
]

export default function ToolsPage() {
    const { featureLocks, currentUserData } = useAdmin();
    const [featureToUnlock, setFeatureToUnlock] = useState<LockableFeature | null>(null);

    const handleFeatureClick = (e: React.MouseEvent, featureId: LockableFeature['id'], isLocked: boolean) => {
        if (isLocked) {
            e.preventDefault();
            const feature = lockableFeatures.find(f => f.id === featureId);
            if (feature) {
                setFeatureToUnlock(feature);
            }
        }
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <Wrench className="h-8 w-8 text-primary" />
                  Student Tools
                </h1>
                <p className="text-muted-foreground">A collection of utilities to help with your studies and... other things.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {toolCategories.map((category, index) => {
                    const featureId = category.id as LockableFeature['id'];
                    const isLocked = featureLocks ? (featureLocks[featureId]?.isLocked && !currentUserData?.unlockedFeatures?.includes(featureId)) : false;

                    return (
                        <motion.div
                            key={category.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className="h-full"
                        >
                            <Link href={isLocked ? '#' : category.href} className="block h-full group" onClick={(e) => handleFeatureClick(e, featureId, isLocked)}>
                               <Card className={cn(
                                   "h-full group relative overflow-hidden flex flex-col justify-between transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1",
                                   category.shadow,
                                   isLocked && "opacity-70 hover:opacity-100"
                                )}>
                                   <div className={cn("absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-br", category.color)}></div>
                                   <CardHeader>
                                       <div className="flex items-center justify-between">
                                            <div className={cn("p-3 rounded-lg bg-gradient-to-br", category.color)}>
                                                <category.icon className="h-6 w-6 text-white"/>
                                            </div>
                                           {isLocked && <Lock className="h-5 w-5 text-white/70"/>}
                                       </div>
                                        <CardTitle className="pt-3">{category.title}</CardTitle>
                                   </CardHeader>
                                   <CardContent className="flex-1">
                                       <p className="text-sm text-muted-foreground">{category.description}</p>
                                   </CardContent>
                               </Card>
                            </Link>
                        </motion.div>
                    )
                })}
            </div>
            
            <Separator />
            
            <div>
                 <h2 className="text-2xl font-bold tracking-tight">Distraction Zone</h2>
                <p className="text-muted-foreground">Admins are not responsible for any lost time here. Enter at your own risk.</p>
            </div>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                 {distractionTools.map((tool, index) => (
                    <motion.div
                        key={tool.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="h-full"
                    >
                         <Link href={tool.href} className="block h-full group">
                               <Card className={cn("h-full group relative overflow-hidden flex flex-col justify-between transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1", tool.shadow)}>
                                   <div className={cn("absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-br", tool.color)}></div>
                                   <CardHeader>
                                        <div className={cn("p-3 rounded-lg bg-gradient-to-br w-fit", tool.color)}>
                                            <tool.icon className="h-6 w-6 text-white"/>
                                        </div>
                                        <CardTitle className="pt-3">{tool.title}</CardTitle>
                                   </CardHeader>
                                   <CardContent className="flex-1">
                                       <p className="text-sm text-muted-foreground">{tool.description}</p>
                                   </CardContent>
                               </Card>
                         </Link>
                    </motion.div>
                 ))}
            </div>


            {featureToUnlock && (
                <FeatureUnlockDialog 
                    feature={featureToUnlock}
                    isOpen={!!featureToUnlock}
                    onOpenChange={(isOpen) => !isOpen && setFeatureToUnlock(null)}
                />
            )}
        </div>
    );
}
