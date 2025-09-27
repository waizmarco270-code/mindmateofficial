'use client';
import { useState } from 'react';
import { useRoadmaps, Roadmap } from "@/hooks/use-roadmaps";
import { Button } from "@/components/ui/button";
import { PlusCircle, Map, Loader2 } from "lucide-react";
import { RoadmapCreation } from "@/components/roadmap/roadmap-creation";
import { RoadmapView } from "@/components/roadmap/roadmap-view";
import { TaskPlanner } from "@/components/roadmap/task-planner";

export function RoadmapPageContent() {
    const { roadmaps, selectedRoadmap, setSelectedRoadmapId, loading, updateRoadmap } = useRoadmaps();
    const [isCreating, setIsCreating] = useState(false);
    const [isPlanning, setIsPlanning] = useState<Roadmap | null>(null);

    const handleCreationComplete = (newRoadmapId: string) => {
        setIsCreating(false);
        const newRoadmap = roadmaps.find(r => r.id === newRoadmapId);
        if (newRoadmap) {
            setIsPlanning(newRoadmap);
        } else {
             setSelectedRoadmapId(newRoadmapId);
        }
    };
    
    const handlePlanningComplete = (roadmapId: string, milestones: Roadmap['milestones']) => {
        updateRoadmap(roadmapId, { milestones });
        setIsPlanning(null);
        setSelectedRoadmapId(roadmapId);
    }

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }
    
    if (isCreating) {
        return <RoadmapCreation onCancel={() => setIsCreating(false)} onComplete={handleCreationComplete} />;
    }
    
    if (isPlanning) {
        return <TaskPlanner roadmap={isPlanning} onComplete={(milestones) => handlePlanningComplete(isPlanning.id, milestones)} onCancel={() => setIsPlanning(null)} />;
    }
    
    if (selectedRoadmap) {
        return <RoadmapView roadmap={selectedRoadmap} onBack={() => setSelectedRoadmapId(null)} onPlan={() => setIsPlanning(selectedRoadmap)} />;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Your Roadmaps</h2>
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
                    <h3 className="text-xl font-semibold">No Roadmaps Yet</h3>
                    <p className="text-muted-foreground">Create your first roadmap to start planning your journey.</p>
                    <Button onClick={() => setIsCreating(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Create New Roadmap
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roadmaps.map(roadmap => (
                         <div key={roadmap.id} className="p-6 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedRoadmapId(roadmap.id)}>
                            <h3 className="font-bold text-lg">{roadmap.name}</h3>
                            <p className="text-sm text-muted-foreground">{roadmap.duration} days</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
