
'use client';

import { useState, useMemo } from 'react';
import { useAdmin } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Search, Sparkles, Zap, Map, Users, Gem, ShieldCheck, Play, ArrowRight, Book } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const iconMap: Record<string, any> = {
    'Focus & Study': Zap,
    'Nexus & Tasks': Map,
    'Social & Clans': Users,
    'Economy & Rewards': Gem,
    'System & Rules': ShieldCheck,
};

export default function GuideCenterPage() {
    const { videoCategories, videoLectures, loading } = useAdmin();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCategories = useMemo(() => {
        if (!videoCategories || !videoLectures) return [];

        return videoCategories
            .map(category => {
                const lectures = videoLectures.filter(lec =>
                    lec.categoryId === category.id &&
                    (lec.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                     category.name.toLowerCase().includes(searchTerm.toLowerCase()))
                );
                return { ...category, lectures };
            })
            .filter(category => category.lectures.length > 0);
    }, [videoCategories, videoLectures, searchTerm]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Hero Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center border-2 border-primary/20 shadow-2xl">
                    <Book className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent uppercase">
                    MindMate Guide Center
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
                    Master the protocol. Learn how to structure your study, optimize focus, and claim your status as a Legend.
                </p>
            </motion.div>

            <div className="relative max-w-3xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                <Input
                    placeholder="Search for a briefing..."
                    className="pl-12 h-14 text-lg rounded-2xl bg-card/50 backdrop-blur-md border-primary/10 shadow-xl focus-visible:ring-primary/30"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full rounded-3xl" />)}
                </div>
            ) : filteredCategories.length === 0 ? (
                <div className="text-center py-20 opacity-40">
                    <BookOpen className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-xl font-bold uppercase tracking-widest">No briefings found</p>
                </div>
            ) : (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-16"
                >
                    {filteredCategories.map(category => {
                        const Icon = iconMap[category.name] || Book;
                        return (
                            <section key={category.id} className="space-y-8">
                                <div className="flex items-center gap-4 border-b border-primary/10 pb-4">
                                    <div className="p-3 rounded-2xl bg-primary/5 text-primary">
                                        <Icon className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight">{category.name}</h2>
                                        <p className="text-sm text-muted-foreground">{category.description}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {category.lectures.map(guide => (
                                        <motion.div key={guide.id} variants={itemVariants}>
                                            <Link href={`/dashboard/guide/${guide.id}`}>
                                                <Card className="group overflow-hidden rounded-[2rem] border-primary/5 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-card/50 backdrop-blur-sm">
                                                    <div className="aspect-video relative overflow-hidden">
                                                        <img 
                                                            src={guide.thumbnailUrl} 
                                                            alt={guide.title} 
                                                            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" 
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                                                <Play className="h-8 w-8 text-white fill-white" />
                                                            </div>
                                                        </div>
                                                        <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                                                            Briefing
                                                        </div>
                                                    </div>
                                                    <CardHeader className="p-6">
                                                        <CardTitle className="text-xl font-black leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                            {guide.title}
                                                        </CardTitle>
                                                        <CardDescription className="text-sm line-clamp-3 mt-2 font-medium">
                                                            {guide.description}
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardFooter className="px-6 pb-6 pt-0">
                                                        <div className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                                            <span>Initialize Guide</span>
                                                            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-2 transition-transform" />
                                                        </div>
                                                    </CardFooter>
                                                </Card>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )
                    })}
                </motion.div>
            )}

            <div className="p-8 rounded-[3rem] bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 text-center space-y-4">
                <ShieldCheck className="h-12 w-12 text-primary mx-auto" />
                <h3 className="text-2xl font-black uppercase italic">Still having doubts?</h3>
                <p className="text-muted-foreground font-medium">Our support commanders are ready to assist you 24/7.</p>
                <Button asChild variant="outline" className="rounded-2xl h-12 px-8 border-primary/20">
                    <Link href="/dashboard/help">Contact Support Command</Link>
                </Button>
            </div>
        </div>
    );
}
