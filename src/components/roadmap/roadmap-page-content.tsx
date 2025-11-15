
'use client';
import { useState } from 'react';
import { useRoadmaps, Roadmap, RoadmapMilestone, RoadmapCategory } from "@/hooks/use-roadmaps";
import { Button } from "@/components/ui/button";
import { PlusCircle, Map, Loader2, Sparkles, FilePlus, Trash2, Upload } from "lucide-react";
import { RoadmapCreation } from "@/components/roadmap/roadmap-creation";
import { RoadmapView } from "@/components/roadmap/roadmap-view";
import { TaskPlanner } from "@/components/roadmap/task-planner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import roadmapTemplates from '@/app/lib/roadmap-templates.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { z } from 'zod';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const RoadmapTaskSchema = z.object({
  text: z.string().min(1),
  // We can omit id and completed as they will be added internally
});

const RoadmapCategorySchema = z.object({
  title: z.string().min(1),
  color: z.string().startsWith('#').length(7),
  tasks: z.array(RoadmapTaskSchema).min(1),
});

const RoadmapMilestoneSchema = z.object({
  day: z.number().int().positive(),
  categories: z.array(RoadmapCategorySchema).min(1),
});

const RoadmapImportSchema = z.object({
  name: z.string().min(1, "Roadmap name is required."),
  duration: z.number().int().positive("Duration must be a positive number."),
  examDate: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid exam date format."),
  milestones: z.array(RoadmapMilestoneSchema).min(1, "Roadmap must have at least one milestone."),
});

export function RoadmapPageContent() {
    const { roadmaps, selectedRoadmap, setSelectedRoadmapId, loading, updateRoadmap, addRoadmap, deleteRoadmap } = useRoadmaps();
    const [viewState, setViewState] = useState<'list' | 'create' | 'plan'>('list');
    const [planningRoadmap, setPlanningRoadmap] = useState<Roadmap | null>(null);
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const { toast } = useToast();
    
    const handleCreationComplete = async (newRoadmapData: Omit<Roadmap, 'id' | 'userId' | 'startDate' | 'dailyStudyTime' | 'weeklyReflections'>) => {
        setViewState('list'); // Go back to list while it processes
        const newRoadmapId = await addRoadmap(newRoadmapData);
        if (newRoadmapId) {
            const newRoadmap = {
                ...newRoadmapData,
                id: newRoadmapId,
                userId: '', // placeholder
                startDate: new Date().toISOString(),
                dailyStudyTime: {},
                weeklyReflections: {},
            };
            setPlanningRoadmap(newRoadmap);
            setViewState('plan');
        } else {
            toast({ variant: 'destructive', title: 'Error creating roadmap.' });
        }
    };
    
    const handlePlanningComplete = async (milestones: Roadmap['milestones']) => {
        if (!planningRoadmap) return;

        await updateRoadmap(planningRoadmap.id, { milestones });
        setSelectedRoadmapId(planningRoadmap.id);

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
            milestones: template.milestones.map(m => ({
                ...m,
                categories: m.categories.map(c => ({
                    ...c,
                    id: `cat-${Date.now()}-${Math.random()}`,
                    tasks: c.tasks.map(t => ({...t, id: `task-${Date.now()}-${Math.random()}`}))
                }))
            })),
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

     const handleRoadmapImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/json') {
            toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please upload a valid .json file.' });
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target?.result;
            if (typeof content !== 'string') return;
            
            setIsImporting(true);
            try {
                const jsonData = JSON.parse(content);
                const validationResult = RoadmapImportSchema.safeParse(jsonData);

                if (!validationResult.success) {
                    const errorMessage = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');
                    toast({ variant: 'destructive', title: 'Invalid JSON Format', description: errorMessage, duration: 10000 });
                    return;
                }
                
                // Add internal IDs to the imported data
                const roadmapDataToCreate = {
                    ...validationResult.data,
                    milestones: validationResult.data.milestones.map(m => ({
                        ...m,
                        categories: m.categories.map(c => ({
                            ...c,
                            id: `cat-${Date.now()}-${Math.random()}`,
                            tasks: c.tasks.map(t => ({...t, id: `task-${Date.now()}-${Math.random()}`, completed: false}))
                        }))
                    }))
                };

                const newId = await addRoadmap(roadmapDataToCreate);
                if (newId) {
                    toast({ title: "Roadmap Imported!", description: `"${validationResult.data.name}" has been added.` });
                    setSelectedRoadmapId(newId);
                    setIsTemplateDialogOpen(false);
                } else {
                    throw new Error("Failed to create roadmap in database.");
                }

            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Import Failed', description: error.message });
            } finally {
                setIsImporting(false);
                if (event.target) event.target.value = ''; // Reset file input
            }
        };
        reader.readAsText(file);
    };
    
     const jsonExample = `{
  "name": "JEE Advanced 60-Day Plan",
  "duration": 60,
  "examDate": "2025-05-26T00:00:00.000Z",
  "milestones": [
    {
      "day": 1,
      "categories": [
        {
          "title": "Physics",
          "color": "#ef4444",
          "tasks": [ { "text": "Revise Kinematics" } ]
        }
      ]
    }
  ]
}`.trim();


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
        return <TaskPlanner roadmap={planningRoadmap} onComplete={(milestones) => handlePlanningComplete(milestones)} onCancel={() => { setViewState('list'); setPlanningRoadmap(null); }} />;
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
                                <CardDescription className="flex-1">Choose a pre-built template or import your own AI-generated plan.</CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto grid grid-cols-1 gap-2">
                                {roadmapTemplates.map(template => (
                                    <Button key={template.id} variant="secondary" onClick={() => handleSelectTemplate(template)}>{template.name}</Button>
                                ))}
                                 <div className="relative my-2">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
                                </div>
                                <div className="space-y-2">
                                    <Input id="roadmap-import" type="file" accept=".json" onChange={handleRoadmapImport} disabled={isImporting} className="text-xs"/>
                                    {isImporting && <p className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin"/>Importing...</p>}
                                </div>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="format-guide">
                                        <AccordionTrigger className="text-xs">View Import Format Guide</AccordionTrigger>
                                        <AccordionContent><pre className="p-2 bg-muted rounded-md text-xs whitespace-pre-wrap">{jsonExample}</pre></AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
