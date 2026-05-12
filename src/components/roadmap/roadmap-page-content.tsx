'use client';
import { useState } from 'react';
import { useRoadmaps, Roadmap, RoadmapMilestone, RoadmapCategory } from "@/hooks/use-roadmaps";
import { Button } from "@/components/ui/button";
import { PlusCircle, Map, Loader2, Sparkles, FilePlus, Trash2, Upload, Bot, Brain, ArrowRight, ExternalLink, MessageSquare, ChevronRight, X } from "lucide-react";
import { RoadmapCreation } from "@/components/roadmap/roadmap-creation";
import { RoadmapView } from "@/components/roadmap/roadmap-view";
import { TaskPlanner } from "@/components/roadmap/task-planner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import roadmapTemplates from '@/app/lib/roadmap-templates.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '@/components/ui/badge';
import { z } from 'zod';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const RoadmapTaskSchema = z.object({
  text: z.string().min(1),
  completed: z.boolean().default(false),
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
    const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
    const [aiRequest, setAiRequest] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const { toast } = useToast();
    
    const handleCreationComplete = async (newRoadmapData: Omit<Roadmap, 'id' | 'userId' | 'startDate' | 'dailyStudyTime' | 'weeklyReflections' | 'monthlyTargets' | 'relapseHistory' | 'workoutLog'>) => {
        setViewState('list'); 
        const newRoadmapId = await addRoadmap(newRoadmapData);
        if (newRoadmapId) {
            const newRoadmap = {
                ...newRoadmapData,
                id: newRoadmapId,
                userId: '', 
                startDate: new Date().toISOString(),
                dailyStudyTime: {},
                weeklyReflections: {},
                monthlyTargets: {},
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
                    tasks: c.tasks.map(t => ({...t, id: `task-${Date.now()}-${Math.random()}`, completed: false}))
                }))
            })),
        });
        setIsTemplateDialogOpen(false);
    }
    
    const handleLaunchAi = (provider: 'chatgpt' | 'gemini') => {
        if (!aiRequest.trim()) {
            toast({ variant: 'destructive', title: "Requirements missing", description: "Please tell the AI what you need to study." });
            return;
        }

        const prompt = `You are the MindMate Strategic Architect. Your mission is to generate a high-fidelity study roadmap JSON file for a student based on these requirements: "${aiRequest}".

The student is using the MindMate app. You MUST generate a JSON object that follows this strict schema:

{
  "name": "Title of the Mission",
  "duration": number (total number of days),
  "examDate": "YYYY-MM-DD format",
  "milestones": [
    {
      "day": number (the day number from 1 to duration),
      "categories": [
        {
          "title": "Subject or Category Name",
          "color": "Hex color code e.g. #ef4444",
          "tasks": [ { "text": "Specific study task" } ]
        }
      ]
    }
  ]
}

CRITICAL INSTRUCTIONS:
1. Generate the roadmap to be scientifically efficient and balanced.
2. PROVIDE A DOWNLOAD LINK for a file named 'roadmap.json' containing ONLY this JSON data.
3. If you cannot provide a direct file link, provide the EXACT JSON in a code block and tell the user to save it as 'roadmap.json'.
4. AFTER providing the file, command the user to return to the MindMate Command Center at https://mindmate.emitygate.com/dashboard/roadmap and use the 'Import Strategic Plan' tool.
5. Do not include any text outside the JSON block unless it is to provide the download link.

BEGIN GENERATION PROTOCOL NOW.`;

        const urls = {
            chatgpt: `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
            gemini: `https://gemini.google.com/app?prompt=${encodeURIComponent(prompt)}`
        };

        window.open(urls[provider], '_blank');
        setIsAiDialogOpen(false);
        setAiRequest('');
        toast({ title: "AI Forge Uplinked!", description: "Follow the AI instructions to generate and download your plan." });
    };

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

        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
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
                    toast({ title: "Strategic Path Injected!", description: `"${validationResult.data.name}" is now live in the mainframe.` });
                    setSelectedRoadmapId(newId);
                    setIsTemplateDialogOpen(false);
                } else {
                    throw new Error("Failed to create roadmap in database.");
                }

            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Injection Failed', description: error.message });
            } finally {
                setIsImporting(false);
                if (event.target) event.target.value = ''; 
            }
        };
        reader.readAsText(file);
    };

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center p-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
        <div className="space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Strategic Path Registry</h2>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Authorized Command Roadmaps</p>
                </div>
                 <Button onClick={() => setIsTemplateDialogOpen(true)} className="rounded-2xl h-14 px-8 font-black uppercase italic shadow-xl shadow-primary/20">
                    <PlusCircle className="mr-2 h-5 w-5" /> INITIALIZE NEW PATH
                </Button>
            </div>
            
            {roadmaps.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card className="text-center bg-black/20 border-2 border-dashed border-white/5 rounded-[3rem] p-16 sm:p-24 space-y-8">
                        <div className="mx-auto w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center border border-primary/20 shadow-2xl">
                            <Map className="h-12 w-12 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black uppercase italic text-white">Registry Empty</h3>
                            <p className="text-slate-400 font-medium max-w-sm mx-auto">No strategic paths have been manifest. Initialize your first mission to begin your ascent.</p>
                        </div>
                        <Button onClick={() => setIsTemplateDialogOpen(true)} size="lg" className="h-16 px-10 rounded-2xl font-black uppercase italic shadow-2xl">
                            <Sparkles className="mr-3 h-6 w-6"/> GENERATE STRATEGIC PATH
                        </Button>
                    </Card>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roadmaps.map((roadmap, i) => (
                         <motion.div 
                            key={roadmap.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                         >
                             <Card className="bg-slate-900/60 border-white/5 rounded-[2.5rem] flex flex-col gap-6 hover:border-primary/30 transition-all duration-500 group shadow-lg">
                                <div className="p-8 flex-1 cursor-pointer" onClick={() => setSelectedRoadmapId(roadmap.id)}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                                            <Map className="h-6 w-6" />
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">{roadmap.duration} DAYS</Badge>
                                    </div>
                                    <h3 className="font-black text-2xl uppercase italic tracking-tighter text-white group-hover:text-primary transition-colors">{roadmap.name}</h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Registry Record • Active</p>
                                </div>
                                <div className="px-8 pb-8 flex gap-3">
                                    <Button variant="outline" className="flex-1 rounded-xl h-12 font-black uppercase text-[10px] tracking-widest border-white/10 hover:bg-primary/10 hover:text-primary transition-all" onClick={() => setSelectedRoadmapId(roadmap.id)}>
                                        INSPECT
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-red-500/40 hover:text-red-500 hover:bg-red-500/10">
                                                <Trash2 className="h-5 w-5"/>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-slate-950 border-red-600/50 rounded-[2.5rem]">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="text-red-600 uppercase italic font-black text-2xl">PURGE RECORD?</AlertDialogTitle>
                                                <AlertDialogDescription className="text-slate-300">
                                                    This will permanently remove the "{roadmap.name}" roadmap from the sovereign registry. This directive is irreversible.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="border-white/10 font-bold">ABORT</AlertDialogCancel>
                                                <AlertDialogAction className="bg-red-600 font-black uppercase" onClick={() => handleDelete(roadmap)}>EXECUTE PURGE</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </Card>
                         </motion.div>
                    ))}
                </div>
            )}
            
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-3xl border-primary/20 rounded-[3rem] p-0 overflow-hidden shadow-2xl">
                    <div className="p-8 sm:p-12 border-b bg-primary/5">
                        <DialogHeader>
                            <DialogTitle className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter text-white">Initialize Strategic Path</DialogTitle>
                            <DialogDescription className="font-bold text-slate-400">Choose your ingress method for mission planning.</DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* AI FORGE OPTION */}
                        <Card className="hover:border-purple-500/50 transition-all duration-500 h-full flex flex-col bg-purple-500/5 border-purple-500/20 group cursor-pointer" onClick={() => { setIsTemplateDialogOpen(false); setIsAiDialogOpen(true); }}>
                            <CardHeader className="p-8 pb-4">
                                <div className="p-4 rounded-3xl bg-purple-500/10 text-purple-400 w-fit mb-6 border border-purple-500/30 group-hover:scale-110 transition-transform">
                                    <Bot className="h-10 w-10 animate-pulse" />
                                </div>
                                <CardTitle className="text-2xl font-black uppercase italic text-white flex items-center gap-3">AEGIS ARCHITECT</CardTitle>
                                <CardDescription className="font-medium text-slate-400 leading-relaxed mt-2">Generate and discuss your entire strategic path with external AI (ChatGPT/Gemini) then import the result.</CardDescription>
                            </CardHeader>
                            <CardFooter className="p-8 pt-0 mt-auto">
                                <Button className="w-full h-14 rounded-2xl font-black uppercase italic bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-900/20">INITIALIZE AI FORGE <ArrowRight className="ml-2 h-5 w-5"/></Button>
                            </CardFooter>
                        </Card>

                        {/* TEMPLATE/MANUAL OPTIONS */}
                        <div className="space-y-6">
                            <Card className="hover:border-primary/50 transition-all duration-500 bg-white/5 border-white/10 group cursor-pointer" onClick={() => { setIsTemplateDialogOpen(false); setViewState('create'); }}>
                                <CardHeader className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-110 transition-transform"><FilePlus className="h-6 w-6"/></div>
                                        <div>
                                            <CardTitle className="text-xl font-black uppercase italic text-white">Manual Forge</CardTitle>
                                            <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">Start with a blank blueprint</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 px-2">
                                    <Sparkles className="h-4 w-4 text-amber-500" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Standard Templates</h4>
                                </div>
                                <div className="grid gap-2">
                                    {roadmapTemplates.map(template => (
                                        <Button key={template.id} variant="outline" onClick={() => handleSelectTemplate(template)} className="h-12 justify-between rounded-xl border-white/10 bg-black/20 font-bold uppercase text-[10px] tracking-widest hover:bg-primary/10 hover:text-primary group px-4">
                                            {template.name} <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all"/>
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <Separator className="bg-white/5" />

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 px-2">
                                    <Upload className="h-4 w-4 text-emerald-500" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Import Strategic Plan</h4>
                                </div>
                                <div className="relative group">
                                    <Input id="roadmap-import" type="file" accept=".json" onChange={handleRoadmapImport} disabled={isImporting} className="hidden" />
                                    <Button asChild variant="outline" className="w-full h-14 border-2 border-dashed border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-emerald-500 font-black uppercase rounded-2xl cursor-pointer">
                                        <label htmlFor="roadmap-import">
                                            {isImporting ? <Loader2 className="animate-spin mr-2 h-5 w-5"/> : <Upload className="mr-2 h-5 w-5"/>}
                                            UPLOAD JSON RECORD
                                        </label>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* AI FORGE DIALOG */}
            <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
                <DialogContent className="max-w-xl bg-slate-950 border-purple-500/30 rounded-[3rem] p-0 overflow-hidden shadow-2xl">
                    <div className="p-8 sm:p-12 border-b bg-purple-500/5">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter text-purple-400 flex items-center gap-3">
                                <Bot className="h-8 w-8" /> Aegis External Architect
                            </DialogTitle>
                            <DialogDescription className="font-bold text-slate-400 text-sm mt-2">Generate your master plan using OpenAI or Google Intelligence.</DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 sm:p-12 space-y-8">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" /> Mission Briefing
                            </Label>
                            <Textarea 
                                value={aiRequest} 
                                onChange={e => setAiRequest(e.target.value)} 
                                placeholder="Describe your study goal, duration, and target exam... (e.g. 'I want to master 10th Math in 30 days starting from Algebra')" 
                                className="bg-black/40 border-white/10 rounded-2xl min-h-[150px] text-base font-medium leading-relaxed italic"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button 
                                onClick={() => handleLaunchAi('chatgpt')} 
                                disabled={!aiRequest.trim()}
                                className="h-16 rounded-2xl font-black uppercase italic bg-white text-black hover:bg-slate-200 shadow-xl"
                            >
                                <span className="flex items-center gap-2"><PlusCircle className="h-5 w-5"/> ChatGPT</span>
                            </Button>
                            <Button 
                                onClick={() => handleLaunchAi('gemini')} 
                                disabled={!aiRequest.trim()}
                                className="h-16 rounded-2xl font-black uppercase italic bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/20"
                            >
                                <span className="flex items-center gap-2"><Brain className="h-5 w-5"/> Gemini</span>
                            </Button>
                        </div>

                        <div className="p-6 rounded-[2rem] bg-purple-500/5 border border-purple-500/20">
                            <h5 className="font-black uppercase text-[10px] tracking-widest text-purple-400 mb-3 flex items-center gap-2">
                                <Info className="h-3.5 w-3.5" /> THE PROTOCOL
                            </h5>
                            <ol className="text-[10px] font-medium text-slate-400 space-y-2 list-decimal list-inside italic">
                                <li>Launch the AI terminal above.</li>
                                <li>The AI will provide a <b className="text-white">roadmap.json</b> file.</li>
                                <li>Save the file to your device.</li>
                                <li>Return here and use the <b className="text-white">Import</b> tool to activate it.</li>
                            </ol>
                        </div>
                    </div>
                    <DialogFooter className="p-6 bg-muted/10 border-t border-white/5">
                        <DialogClose asChild><Button variant="ghost" className="w-full font-bold uppercase text-[10px] tracking-widest">ABORT DRIVE</Button></DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
