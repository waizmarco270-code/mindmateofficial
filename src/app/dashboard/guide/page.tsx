
'use client';

import { useState, useMemo } from 'react';
import { useAdmin } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Search, Sparkles, Zap, Map as MapIcon, Users, Gem, ShieldCheck, Play, ArrowRight, Book, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const iconMap: Record<string, any> = {
    'Focus & Study': Zap,
    'Nexus & Tasks': MapIcon,
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
                const lectures = (videoLectures || []).filter(lec =>
                    lec.categoryId === category.id &&
                    (lec.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                     category.name.toLowerCase().includes(searchTerm.toLowerCase()))
                );
                return { ...category, lectures };
            })
            .filter(category => category.lectures && category.lectures.length > 0);
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

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center p-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20 relative">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 blue-nebula-bg opacity-30" />
                <div id="particle-container">
                    {[...Array(15)].map((_, i) => <div key={i} className="particle" />)}
                </div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4 relative z-10"
            >
                <div className="mx-auto w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center border-2 border-primary/20 shadow-2xl backdrop-blur-md">
                    <Book className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent uppercase italic">
                    SOVEREIGN GUIDE
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                    Master the MindMate ecosystem. Access visual briefings on every system protocol.
                </p>
            </motion.div>

            <div className="relative max-w-3xl mx-auto z-10 px-4">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
                <Input
                    placeholder="Search for a mission briefing..."
                    className="pl-14 h-16 text-lg rounded-3xl bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl focus-visible:ring-primary/30"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredCategories.length === 0 ? (
                <div className="text-center py-20 opacity-40 relative z-10">
                    <BookOpen className="h-20 w-20 mx-auto mb-4" />
                    <p className="text-2xl font-black uppercase tracking-widest">No briefings found</p>
                </div>
            ) : (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-20 relative z-10"
                >
                    {filteredCategories.map(category => {
                        const Icon = iconMap[category.name] || Book;
                        return (
                            <section key={category.id} className="space-y-8">
                                <div className="flex items-center gap-6 border-b border-white/5 pb-6 px-4">
                                    <div className="p-4 rounded-3xl bg-primary/10 text-primary border border-primary/20 shadow-xl shadow-primary/5">
                                        <Icon className="h-10 w-10" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black uppercase tracking-tight italic">{category.name}</h2>
                                        <p className="text-slate-400 font-medium">{category.description}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {category.lectures.map(guide => (
                                        <motion.div key={guide.id} variants={itemVariants}>
                                            <Link href={`/dashboard/guide/${guide.id}`}>
                                                <Card className="group overflow-hidden rounded-[2.5rem] border-white/5 hover:border-primary/40 transition-all duration-700 hover:shadow-[0_0_50px_rgba(139,92,246,0.2)] bg-slate-900/40 backdrop-blur-xl h-full flex flex-col">
                                                    <div className="aspect-video relative overflow-hidden">
                                                        <img 
                                                            src={guide.thumbnailUrl} 
                                                            alt={guide.title} 
                                                            className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110" 
                                                        />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                            <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                                                                <Play className="h-10 w-10 text-white fill-white ml-1" />
                                                            </div>
                                                        </div>
                                                        <div className="absolute top-4 right-4 px-4 py-1.5 bg-primary/20 backdrop-blur-xl rounded-full text-[10px] font-black text-primary uppercase tracking-[0.2em] border border-primary/30 shadow-lg">
                                                            Sovereign Data
                                                        </div>
                                                    </div>
                                                    <CardHeader className="p-8">
                                                        <CardTitle className="text-2xl font-black leading-tight group-hover:text-primary transition-colors line-clamp-2 uppercase italic">
                                                            {guide.title}
                                                        </CardTitle>
                                                        <CardDescription className="text-base line-clamp-2 mt-3 font-medium text-slate-400">
                                                            {guide.description}
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardFooter className="px-8 pb-8 pt-0 mt-auto">
                                                        <div className="w-full flex items-center justify-between text-xs font-black uppercase tracking-[0.3em] text-primary group-hover:text-white transition-colors">
                                                            <span>Initialize Briefing</span>
                                                            <ArrowRight className="h-5 w-5 transform group-hover:translate-x-3 transition-transform" />
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

            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="p-12 rounded-[4rem] bg-gradient-to-br from-primary/20 via-black/40 to-black border border-white/5 text-center space-y-6 relative z-10 mx-4 shadow-2xl backdrop-blur-xl"
            >
                <div className="p-5 rounded-full bg-white/5 border border-white/10 w-fit mx-auto shadow-inner">
                    <ShieldCheck className="h-16 w-16 text-primary" />
                </div>
                <h3 className="text-4xl font-black uppercase italic tracking-tight">Need direct assistance?</h3>
                <p className="text-slate-400 text-lg max-w-lg mx-auto font-medium">Our tactical support commanders are available for high-priority inquiries.</p>
                <Button asChild size="lg" className="rounded-2xl h-16 px-12 text-lg font-black uppercase italic shadow-2xl shadow-primary/20 hover:scale-105 transition-transform">
                    <Link href="/dashboard/help">Contact Support Command</Link>
                </Button>
            </motion.div>
        </div>
    );
}
