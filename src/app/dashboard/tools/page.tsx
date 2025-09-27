
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Percent, LayoutList, Wrench, Lock, FileText, Scale, BookCopy, Image as ImageIcon, QrCode, ScanText } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/hooks/use-admin';
import { FeatureUnlockDialog } from '@/components/dashboard/feature-unlock-dialog';
import { lockableFeatures, type LockableFeature } from '@/lib/features';

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
    },
    {
        id: 'handwriting-to-text',
        title: "Handwriting to Text",
        description: "Convert handwritten notes into digital text using AI.",
        icon: ScanText,
        href: "/dashboard/tools/handwriting-to-text",
        color: "from-purple-500 to-violet-500",
        shadow: "shadow-purple-500/30"
    }
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
                <p className="text-muted-foreground">A collection of utilities to help with your studies.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {toolCategories.map((category, index) => {
                    const featureId = category.id as LockableFeature['id'];
                    // Fallback to a default lock state if not defined, though they should be.
                    const isLocked = featureLocks ? (featureLocks[featureId]?.isLocked && !currentUserData?.unlockedFeatures?.includes(featureId)) : false;

                    return (
                        <motion.div
                            key={category.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Link href={isLocked ? '#' : category.href} className="block h-full" onClick={(e) => handleFeatureClick(e, featureId, isLocked)}>
                               <Card className={cn(
                                   "h-full group relative overflow-hidden flex flex-col justify-between transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2",
                                   category.shadow,
                                   isLocked && "opacity-70 hover:opacity-100"
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
                                           {isLocked && <Lock className="h-5 w-5 text-white/70"/>}
                                       </div>
                                   </CardHeader>
                                   <CardContent>
                                       <p className="text-muted-foreground">{category.description}</p>
                                   </CardContent>
                                   <CardContent>
                                        <Button variant="outline" className="w-full bg-background/50 group-hover:bg-background transition-colors">
                                           {isLocked ? 'Unlock Feature' : 'Open Tool'} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                       </Button>
                                   </CardContent>
                               </Card>
                            </Link>
                        </motion.div>
                    )
                })}
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
