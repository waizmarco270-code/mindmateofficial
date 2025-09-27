
'use client';
import { useState } from 'react';
import { useRoadmaps, Roadmap } from "@/hooks/use-roadmaps";
import { Button } from "@/components/ui/button";
import { PlusCircle, Map, Loader2, Trash2 } from "lucide-react";
import { RoadmapCreation } from "@/components/roadmap/roadmap-creation";
import { RoadmapView } from "@/components/roadmap/roadmap-view";
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskPlanner } from '@/components/roadmap/task-planner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function RoadmapPage() {
    const { roadmaps, selectedRoadmap, setSelectedRoadmapId, loading, updateRoadmap, deleteRoadmap } = useRoadmaps();
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
    
    const handleDeleteRoadmap = (e: React.MouseEvent, roadmapId: string) => {
        e.stopPropagation(); // Prevent card click event
        deleteRoadmap(roadmapId);
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
                         <Card key={roadmap.id} className="cursor-pointer hover:bg-muted/50 transition-colors flex flex-col justify-between" onClick={() => setSelectedRoadmapId(roadmap.id)}>
                            <CardHeader>
                                <CardTitle>{roadmap.name}</CardTitle>
                                <CardDescription className="capitalize">{roadmap.targetExam.replace(/-/g, ' ')} - {roadmap.duration} days</CardDescription>
                            </CardHeader>
                             <div className="p-4 pt-0">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                         <Button variant="destructive" className="w-full" onClick={(e) => e.stopPropagation()}>
                                            <Trash2 className="mr-2 h-4 w-4"/> Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This will permanently delete your "{roadmap.name}" roadmap and all its data. This action cannot be undone.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={(e) => handleDeleteRoadmap(e, roadmap.id)}>Delete Roadmap</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
