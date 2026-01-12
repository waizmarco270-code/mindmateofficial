
'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/use-admin';
import { useImmersive } from '@/hooks/use-immersive';
import { Loader2, ArrowLeft, ChevronsRight, MonitorPlay } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LecturePage() {
    const { setIsImmersive } = useImmersive();
    const { lectureId } = useParams();
    const router = useRouter();
    const { videoLectures, loading } = useAdmin();

    useEffect(() => {
        setIsImmersive(true);
        return () => setIsImmersive(false);
    }, [setIsImmersive]);

    const { lecture, nextLecture } = useMemo(() => {
        const allLectures = videoLectures || [];
        const currentLecture = allLectures.find(lec => lec.id === lectureId);
        
        if (!currentLecture) return { lecture: null, nextLecture: null };

        const lecturesInCategory = allLectures
            .filter(lec => lec.categoryId === currentLecture.categoryId)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            
        const currentIndex = lecturesInCategory.findIndex(lec => lec.id === lectureId);
        const next = currentIndex !== -1 && currentIndex < lecturesInCategory.length - 1
            ? lecturesInCategory[currentIndex + 1]
            : null;

        return { lecture: currentLecture, nextLecture: next };
    }, [lectureId, videoLectures]);


    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }
    
    if (!lecture) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center bg-background text-center p-4">
                 <MonitorPlay className="h-16 w-16 text-muted-foreground mb-4"/>
                <h2 className="text-2xl font-bold">Lecture Not Found</h2>
                <p className="text-muted-foreground">This video may have been removed or the link is incorrect.</p>
                <Button asChild className="mt-6">
                    <Link href="/dashboard/learning">
                        <ArrowLeft className="mr-2 h-4 w-4"/> Back to Learning Hub
                    </Link>
                </Button>
            </div>
        )
    }
    
    const youtubeVideoId = lecture.youtubeUrl.split('v=')[1]?.split('&')[0] || lecture.youtubeUrl.split('/').pop();

    return (
        <div className="h-full w-full flex flex-col lg:flex-row bg-background text-foreground">
            <div className="lg:flex-1 lg:h-full flex flex-col">
                <div className="w-full aspect-video bg-black flex items-center justify-center">
                    <iframe
                        src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1`}
                        title={lecture.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                </div>
            </div>
            <div className="lg:w-96 lg:h-full flex-shrink-0 border-l bg-background flex flex-col">
                <div className="p-4 border-b">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/dashboard/learning">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hub
                        </Link>
                    </Button>
                </div>
                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                    <h1 className="text-2xl font-bold leading-tight">{lecture.title}</h1>
                    <p className="text-sm text-muted-foreground">{lecture.description}</p>
                </div>
                {nextLecture && (
                    <div className="p-4 border-t">
                        <Button asChild className="w-full">
                            <Link href={`/dashboard/learning/${nextLecture.id}`}>
                                Next Lecture <ChevronsRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
