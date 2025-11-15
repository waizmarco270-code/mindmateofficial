
'use client';
import { useState } from 'react';
import { useRoadmaps, Roadmap, RoadmapMilestone } from "@/hooks/use-roadmaps";
import { Button } from "@/components/ui/button";
import { PlusCircle, Map, Loader2, Sparkles, FilePlus, Trash2 } from "lucide-react";
import { RoadmapCreation } from "@/components/roadmap/roadmap-creation";
import { RoadmapView } from "@/components/roadmap/roadmap-view";
import { TaskPlanner } from "@/components/roadmap/task-planner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import roadmapTemplates from '@/app/lib/roadmap-templates.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export function RoadmapPageContent() {
    const { roadmaps, selectedRoadmap, setSelectedRoadmapId, loading, updateRoadmap, addRoadmap, deleteRoadmap } = useRoadmaps();
    const [viewState, setViewState] = useState<'list' | 'create' | 'plan'>('list');
    const [planningRoadmap, setPlanningRoadmap] = useState<Roadmap | null>(null);
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const { toast } = useToast();

    const handleCreationComplete = (newRoadmapData: Parameters<typeof addRoadmap>[0]) => {
        setViewState('list');
        const newRoadmap = {
            ...newRoadmapData,
            id: Date.now().toString(), // temporary ID
            userId: '', // temporary
            startDate: new Date().toISOString(),
            dailyStudyTime: {},
            weeklyReflections: {},
            milestones: newRoadmapData.milestones || [],
        };
        setPlanningRoadmap(newRoadmap);
        setViewState('plan');
    };
    
    const handlePlanningComplete = async (milestones: Roadmap['milestones']) => {
        if (!planningRoadmap) return;

        // If it's a new roadmap from a template, create it now
        if (!roadmaps.some(r => r.id === planningRoadmap.id)) {
             const newRoadmapId = await addRoadmap({
                name: planningRoadmap.name,
                examDate: planningRoadmap.examDate,
                duration: planningRoadmap.duration,
                milestones: milestones,
            });
             if (newRoadmapId) {
                setSelectedRoadmapId(newRoadmapId);
            }
        } else { // It's an existing roadmap
            await updateRoadmap(planningRoadmap.id, { milestones });
            setSelectedRoadmapId(planningRoadmap.id);
        }

        setPlanningRoadmap(null);
        setViewState('list');
    }
    
    const handleSelectTemplate = (template: typeof roadmapTemplates[0]) => {
        const examDate = new Date();
        examDate.setDate(examDate.getDate() + template.duration);
        
        handleCreationComplete({
            name: template.name,
            examDate: examDate.toISOString(),
            duration: template.duration,
            milestones: template.milestones as RoadmapMilestone[],
        });
        setIsTemplateDialogOpen(false);
    }
    
    const handleDelete = async (roadmap: Roadmap) => {
        try {
            await deleteRoadmap(roadmap.id);
            toast({ title: "Roadmap Deleted", description: `"${roadmap.name}" has been permanently removed.` });
        } catch (error) {
             toast({ variant: 'destructive', title: "Error", description: "Could not delete the roadmap." });
        }
    }

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }
    
    if (viewState === 'create') {
        return <RoadmapCreation onCancel={() => setViewState('list')} onComplete={handleCreationComplete} />;
    }
    
    if (viewState === 'plan' && planningRoadmap) {
        return <TaskPlanner roadmap={planningRoadmap} onComplete={(milestones) => handlePlanningComplete(milestones)} onCancel={() => setViewState('list')} />;
    }
    
    if (selectedRoadmap) {
        return <RoadmapView roadmap={selectedRoadmap} onBack={() => setSelectedRoadmapId(null)} onPlan={() => { setPlanningRoadmap(selectedRoadmap); setViewState('plan'); }} />;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Your Roadmaps</h2>
                </div>
                 <Button onClick={() => setIsTemplateDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create New Roadmap
                </Button>
            </div>
            
            {roadmaps.length === 0 ? (
                <div className="text-center border-2 border-dashed rounded-lg p-12 space-y-4">
                    <h3 className="text-xl font-semibold">No Roadmaps Yet</h3>
                    <p className="text-muted-foreground">Create your first roadmap to start planning your journey.</p>
                     <Button onClick={() => setIsTemplateDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Create New Roadmap
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roadmaps.map(roadmap => (
                         <div key={roadmap.id} className="p-6 border rounded-lg flex flex-col gap-4 hover:bg-muted/50 transition-colors">
                            <div className="cursor-pointer flex-1" onClick={() => setSelectedRoadmapId(roadmap.id)}>
                                <h3 className="font-bold text-lg">{roadmap.name}</h3>
                                <p className="text-sm text-muted-foreground">{roadmap.duration} days</p>
                            </div>
                            <div className="border-t pt-4">
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full">
                                            <Trash2 className="mr-2 h-4 w-4"/> Delete Roadmap
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete this roadmap?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the "{roadmap.name}" roadmap and all of its data.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(roadmap)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Create a New Roadmap</DialogTitle>
                        <DialogDescription>Start with a blank canvas or use a pre-made template to get going faster.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="hover:border-primary transition-colors h-full flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><FilePlus/> Create from Scratch</CardTitle>
                                <CardDescription className="flex-1">Build a completely new, personalized roadmap from the ground up.</CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto">
                                <Button className="w-full" onClick={() => { setIsTemplateDialogOpen(false); setViewState('create'); }}>Start Fresh</Button>
                            </CardContent>
                        </Card>
                        <Card className="hover:border-primary transition-colors h-full flex flex-col">
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Sparkles/> Use a Template</CardTitle>
                                <CardDescription className="flex-1">Choose a pre-built template and customize it to fit your needs.</CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto grid grid-cols-1 gap-2">
                                {roadmapTemplates.map(template => (
                                    <Button key={template.id} variant="secondary" onClick={() => handleSelectTemplate(template)}>{template.name}</Button>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
