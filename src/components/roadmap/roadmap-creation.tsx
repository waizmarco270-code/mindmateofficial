'use client';
import { useState } from 'react';
import { Roadmap, RoadmapMilestone, RoadmapCategory, RoadmapTask, useRoadmaps } from '@/hooks/use-roadmaps';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { PlusCircle, ArrowLeft, CheckCircle, Loader2, CalendarIcon, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';
import { generateRoadmap } from '@/ai/flows/roadmap-flow';


interface RoadmapCreationProps {
    onCancel: () => void;
    onComplete: (newRoadmapId: string) => void;
}

export function RoadmapCreation({ onCancel, onComplete }: RoadmapCreationProps) {
    const { addRoadmap } = useRoadmaps();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mode, setMode] = useState<'manual' | 'ai'>('manual');
    
    // Form State
    const [name, setName] = useState('');
    const [examDate, setExamDate] = useState<Date | undefined>(new Date());
    const [duration, setDuration] = useState(90);
    const [aiGoal, setAiGoal] = useState('');

    const handleSubmit = async () => {
        if(!name.trim()) {
            toast({ variant: 'destructive', title: "Roadmap name is required."});
            return;
        }
        if(!examDate) {
            toast({ variant: 'destructive', title: "Exam date is required."});
            return;
        }

        setIsSubmitting(true);
        try {
             const roadmapData: Omit<Roadmap, 'id' | 'userId' | 'startDate' | 'dailyStudyTime' | 'weeklyReflections'> = {
                name,
                examDate: examDate.toISOString(),
                duration,
                milestones: []
             };
             
             if (mode === 'ai' && aiGoal.trim()) {
                 const aiGeneratedPlan = await generateRoadmap({
                     goal: aiGoal,
                     duration: duration
                 });
                 roadmapData.milestones = aiGeneratedPlan.milestones;
             }
             
            const newRoadmapId = await addRoadmap(roadmapData);
            toast({ title: "Roadmap Created!", description: "Your new roadmap is ready." });

            if (newRoadmapId) {
                // If using AI, we skip the manual planning step as it's pre-filled
                 onComplete(newRoadmapId);
            } else {
                throw new Error("Failed to get new roadmap ID");
            }
        } catch (error) {
             toast({ variant: 'destructive', title: "Error", description: "Could not create roadmap. The AI might be unavailable." });
             setIsSubmitting(false);
        }
    };


    return (
         <div className="space-y-8">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={onCancel}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create a New Roadmap</h1>
                    <p className="text-muted-foreground">Let's set up your plan for success.</p>
                </div>
            </div>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Roadmap Details</CardTitle>
                     <div className="flex items-center gap-2 pt-2">
                        <Button variant={mode === 'manual' ? 'default' : 'outline'} onClick={() => setMode('manual')}>Manual Setup</Button>
                        <Button variant={mode === 'ai' ? 'default' : 'outline'} onClick={() => setMode('ai')} className="flex items-center gap-2">
                            <Wand2 className="h-4 w-4"/> Generate with AI
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="roadmap-name">Roadmap Name</Label>
                        <Input id="roadmap-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Mission: IIT Bombay"/>
                    </div>
                     <div className="space-y-2">
                        <Label>Target Exam Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !examDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {examDate ? format(examDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={examDate}
                                    onSelect={setExamDate}
                                    initialFocus
                                    disabled={(date) => date < new Date()}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div className="space-y-2">
                        <Label>Duration ({duration} days)</Label>
                        <Slider value={[duration]} onValueChange={v => setDuration(v[0])} min={7} max={365} step={1} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1 Week</span>
                            <span>1 Year</span>
                        </div>
                    </div>
                    {mode === 'ai' && (
                        <div className="space-y-2 pt-4 border-t">
                            <Label htmlFor="ai-goal">Describe Your Goal</Label>
                            <p className="text-xs text-muted-foreground">
                                The AI will generate a plan based on this. Be specific!
                            </p>
                            <Textarea 
                                id="ai-goal" 
                                value={aiGoal} 
                                onChange={e => setAiGoal(e.target.value)} 
                                placeholder="e.g., 'Master calculus for JEE Mains in 60 days' or 'Complete Class 12 Physics syllabus, focusing on important chapters for boards'."
                                rows={4}
                            />
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                        {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <CheckCircle className="mr-2 h-4 w-4"/>}
                        {mode === 'ai' ? 'Generate & Create' : 'Create Roadmap'}
                    </Button>
                </CardFooter>
            </Card>

         </div>
    );
}
