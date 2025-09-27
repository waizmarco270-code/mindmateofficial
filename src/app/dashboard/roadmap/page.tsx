'use client';
import { useState } from 'react';
import { useRoadmaps } from "@/hooks/use-roadmaps";
import { Button } from "@/components/ui/button";
import { PlusCircle, Map, Loader2 } from "lucide-react";
import { RoadmapCreation } from "@/components/roadmap/roadmap-creation";
import { RoadmapView } from "@/components/roadmap/roadmap-view";
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RoadmapPage() {
    const { roadmaps, selectedRoadmap, setSelectedRoadmapId, loading } = useRoadmaps();
    const [isCreating, setIsCreating] = useState(false);

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }
    
    if (isCreating) {
        return <RoadmapCreation onCancel={() => setIsCreating(false)} />;
    }
    
    if (selectedRoadmap) {
        return <RoadmapView roadmap={selectedRoadmap} onBack={() => setSelectedRoadmapId(null)} />;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Map className="h-8 w-8 text-primary" />
                        Your Roadmaps
                    </h1>
                    <p className="text-muted-foreground">
                        Your personalized plans for success. Select a roadmap to view or create a new one.
                    </p>
                </div>
                 <Button onClick={() => setIsCreating(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create New Roadmap
                </Button>
            </div>
            
            {roadmaps.length === 0 ? (
                <div className="text-center border-2 border-dashed rounded-lg p-12 space-y-4">
                    <h2 className="text-xl font-semibold">No Roadmaps Yet</h2>
                    <p className="text-muted-foreground">Create your first roadmap to start planning your journey.</p>
                    <Button onClick={() => setIsCreating(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Create New Roadmap
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roadmaps.map(roadmap => (
                         <Card key={roadmap.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedRoadmapId(roadmap.id)}>
                            <CardHeader>
                                <CardTitle>{roadmap.name}</CardTitle>
                                <CardDescription className="capitalize">{roadmap.targetExam.replace(/-/g, ' ')} - {roadmap.duration} days</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
