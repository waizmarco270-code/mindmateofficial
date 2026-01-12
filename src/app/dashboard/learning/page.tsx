
'use client';

import { useState, useMemo } from 'react';
import { useAdmin } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Film, Search, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function LearningHubPage() {
    const { videoCategories, videoLectures, loading } = useAdmin();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCategories = useMemo(() => {
        if (!videoCategories || !videoLectures) return [];

        return videoCategories
            .map(category => {
                const lectures = videoLectures.filter(lec =>
                    lec.categoryId === category.id &&
                    lec.title.toLowerCase().includes(searchTerm.toLowerCase())
                );
                return { ...category, lectures };
            })
            .filter(category =>
                category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.lectures.length > 0
            );
    }, [videoCategories, videoLectures, searchTerm]);


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <Film className="h-8 w-8 text-primary" />
                  Learning Hub
                </h1>
                <p className="text-muted-foreground">Curated video lectures and tutorials to help you master your subjects.</p>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search lectures or categories..."
                    className="pl-10 h-12 text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading && (
                <div className="space-y-6">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i}>
                            <Skeleton className="h-8 w-1/3 mb-4" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {Array.from({ length: 4 }).map((_, j) => (
                                    <Skeleton key={j} className="h-56 w-full" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredCategories.length === 0 && (
                <Card className="text-center py-16 border-dashed">
                    <CardHeader>
                         <div className="mx-auto bg-muted p-3 rounded-full w-fit mb-4"><BookOpen className="h-8 w-8 text-muted-foreground" /></div>
                        <CardTitle>No Content Found</CardTitle>
                        <CardDescription>
                            {searchTerm ? "No lectures or categories matched your search." : "Lectures and tutorials will appear here once they are added by an admin."}
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}

            {!loading && filteredCategories.map(category => (
                <div key={category.id} className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold">{category.name}</h2>
                        <p className="text-muted-foreground">{category.description}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {category.lectures.map(lecture => (
                            <Link href={`/dashboard/learning/${lecture.id}`} key={lecture.id}>
                                <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                    <div className="aspect-video relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={lecture.thumbnailUrl} alt={lecture.title} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" />
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="text-base line-clamp-2">{lecture.title}</CardTitle>
                                        <CardDescription className="text-xs line-clamp-3">{lecture.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
