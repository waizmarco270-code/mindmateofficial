
'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/use-admin';
import { useImmersive } from '@/hooks/use-immersive';
import { Loader2, ArrowLeft, ChevronsRight, MonitorPlay, BookOpen, ShieldCheck, Zap } from 'lucide-react';
import { CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function GuideDetailPage() {
    const { setIsImmersive } = useImmersive();
    const { guideId } = useParams();
    const router = useRouter();
    const { videoLectures, videoCategories, loading } = useAdmin();

    useEffect(() => {
        setIsImmersive(true);
        return () => setIsImmersive(false);
    }, [setIsImmersive]);

    const { guide, nextGuide, category } = useMemo(() => {
        const allGuides = videoLectures || [];
        const currentGuide = allGuides.find(g => g.id === guideId);
        
        if (!currentGuide) return { guide: null, nextGuide: null, category: null };

        const categoryData = videoCategories.find(c => c.id === currentGuide.categoryId);

        const guidesInCategory = allGuides
            .filter(g => g.categoryId === currentGuide.categoryId)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            
        const currentIndex = guidesInCategory.findIndex(g => g.id === guideId);
        const next = currentIndex !== -1 && currentIndex < guidesInCategory.length - 1
            ? guidesInCategory[currentIndex + 1]
            : null;

        return { guide: currentGuide, nextGuide: next, category: categoryData };
    }, [guideId, videoLectures, videoCategories]);


    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!guide) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center bg-background text-center p-4">
                 <MonitorPlay className="h-16 w-16 text-muted-foreground mb-4"/>
                <h2 className="text-2xl font-bold">Briefing Not Found</h2>
                <p className="text-muted-foreground">This guide may have been removed or updated.</p>
                <Button asChild className="mt-6 rounded-2xl h-12 px-8">
                    <Link href="/dashboard/guide">
                        <ArrowLeft className="mr-2 h-4 w-4"/> Back to Guide Center
                    </Link>
                </Button>
            </div>
        )
    }
    
    const youtubeVideoId = guide.youtubeUrl.split('v=')[1]?.split('&')[0] || guide.youtubeUrl.split('/').pop();

    return (
        <div className="h-full w-full flex flex-col lg:flex-row bg-background text-foreground">
            <div className="lg:flex-1 lg:h-full flex flex-col bg-black">
                <div className="w-full h-full relative group">
                    <iframe
                        src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1`}
                        title={guide.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                </div>
            </div>
            
            <div className="lg:w-[400px] lg:h-full flex-shrink-0 border-l border-primary/10 bg-card/50 backdrop-blur-xl flex flex-col overflow-hidden">
                <div className="p-6 border-b border-primary/10 flex items-center justify-between">
                    <Button asChild variant="ghost" size="sm" className="rounded-xl hover:bg-primary/10">
                        <Link href="/dashboard/guide">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Exit Briefing
                        </Link>
                    </Button>
                    <ShieldCheck className="h-5 w-5 text-primary opacity-50" />
                </div>

                <SimpleScrollArea className="flex-1">
                    <div className="p-8 space-y-8">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{category?.name || 'Protocol'}</p>
                                <h1 className="text-3xl font-black tracking-tight leading-none uppercase italic">{guide.title}</h1>
                            </div>
                            <div className="h-1.5 w-16 bg-primary rounded-full" />
                            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                {guide.description}
                            </p>
                        </motion.div>

                        <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
                            <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                <Zap className="h-4 w-4 text-yellow-400" />
                                Key Objectives
                            </h4>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-xs font-medium text-muted-foreground">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                                    Watch the visual briefing completely.
                                </li>
                                <li className="flex items-start gap-3 text-xs font-medium text-muted-foreground">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                                    Implement the strategy in your next session.
                                </li>
                            </ul>
                        </div>
                    </div>
                </SimpleScrollArea>

                {nextGuide && (
                    <div className="p-6 border-t border-primary/10 bg-primary/5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3 px-1">Up Next</p>
                        <Button asChild className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20 font-black text-sm uppercase italic">
                            <Link href={`/dashboard/guide/${nextGuide.id}`}>
                                Next Briefing <ChevronsRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

function SimpleScrollArea({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={cn("overflow-y-auto", className)}>{children}</div>;
}
