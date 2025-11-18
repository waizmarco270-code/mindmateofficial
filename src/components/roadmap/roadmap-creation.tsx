
'use client';
import { useState } from 'react';
import { Roadmap, useRoadmaps } from '@/hooks/use-roadmaps';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { PlusCircle, ArrowLeft, CheckCircle, Loader2, CalendarIcon, Wand2, Brain, Dumbbell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';

interface RoadmapCreationProps {
    onCancel: () => void;
    onComplete: (newRoadmapData: Omit<Roadmap, 'id' | 'userId'>) => void;
}

export function RoadmapCreation({ onCancel, onComplete }: RoadmapCreationProps) {
    const { addRoadmap } = useRoadmaps();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form State
    const [name, setName] = useState('');
    const [examDate, setExamDate] = useState<Date | undefined>(new Date());
    const [duration, setDuration] = useState(90);
    const [includeNoFap, setIncludeNoFap] = useState(false);
    const [includeWorkout, setIncludeWorkout] = useState(false);

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
             const newRoadmapData: Omit<Roadmap, 'id' | 'userId'> = {
                name,
                examDate: examDate.toISOString(),
                duration,
                startDate: new Date().toISOString(),
                milestones: [],
                dailyStudyTime: {},
                weeklyReflections: {},
                hasNoFapTracker: includeNoFap,
                noFapStartDate: includeNoFap ? new Date().toISOString() : undefined,
                relapseHistory: [],
                hasWorkoutTracker: includeWorkout,
                workoutLog: {}
             };
             
            onComplete(newRoadmapData);

        } catch (error) {
             toast({ variant: 'destructive', title: "Error", description: "Could not create roadmap." });
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
                     <div className="space-y-4 pt-4 border-t">
                        <Label className="text-base font-semibold">Discipline Trackers (Optional)</Label>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <Label htmlFor="nofap-tracker" className="flex items-center gap-3 cursor-pointer">
                                <Brain className="h-5 w-5 text-purple-400" />
                                <span className="font-medium">Include NoFap Tracker</span>
                            </Label>
                            <Switch id="nofap-tracker" checked={includeNoFap} onCheckedChange={setIncludeNoFap} />
                        </div>
                         <div className="flex items-center justify-between p-4 border rounded-lg">
                            <Label htmlFor="workout-tracker" className="flex items-center gap-3 cursor-pointer">
                                <Dumbbell className="h-5 w-5 text-orange-400" />
                                <span className="font-medium">Include Workout Tracker</span>
                            </Label>
                            <Switch id="workout-tracker" checked={includeWorkout} onCheckedChange={setIncludeWorkout} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                        {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <CheckCircle className="mr-2 h-4 w-4"/>}
                        Create Roadmap & Plan Tasks
                    </Button>
                </CardFooter>
            </Card>

         </div>
    );
}
