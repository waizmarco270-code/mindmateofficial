'use client';
import { useState } from 'react';
import { Roadmap, useRoadmaps } from '@/hooks/use-roadmaps';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { PlusCircle, ArrowLeft, CheckCircle, Loader2, CalendarIcon, Wand2, Brain, Dumbbell, Rocket, Trophy, Target, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Switch } from '../ui/switch';

interface RoadmapCreationProps {
    onCancel: () => void;
    onComplete: (newRoadmapData: Omit<Roadmap, 'id' | 'userId'>) => void;
}

const EXAM_PRESETS = [
    { name: 'JEE Mains (S1)', date: new Date('2026-01-21'), icon: Rocket, color: 'text-rose-400' },
    { name: 'JEE Mains (S2)', date: new Date('2026-04-02'), icon: Rocket, color: 'text-rose-400' },
    { name: '10th Boards', date: new Date('2026-02-15'), icon: Trophy, color: 'text-amber-400' },
    { name: '12th Boards', date: new Date('2026-02-17'), icon: Trophy, color: 'text-amber-400' },
    { name: 'NEET 2026', date: new Date('2026-05-02'), icon: Brain, color: 'text-emerald-400' },
];

export function RoadmapCreation({ onCancel, onComplete }: RoadmapCreationProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form State
    const [name, setName] = useState('');
    const [examDate, setExamDate] = useState<Date | undefined>(new Date());
    const [duration, setDuration] = useState(90);
    const [includeNoFap, setIncludeNoFap] = useState(false);
    const [includeWorkout, setIncludeWorkout] = useState(false);

    const applyPreset = (preset: typeof EXAM_PRESETS[0]) => {
        setName(`Mission: ${preset.name}`);
        setExamDate(preset.date);
        const daysToExam = differenceInDays(preset.date, new Date());
        setDuration(Math.max(30, Math.min(365, daysToExam)));
        toast({ title: "Mission Synchronized", description: `Template applied for ${preset.name}.` });
    };

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
                monthlyTargets: {},
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
         <div className="space-y-8 animate-in fade-in duration-700">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={onCancel} className="rounded-full">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-black uppercase italic tracking-tight">Create Strategic Roadmap</h1>
                    <p className="text-muted-foreground font-medium">Protocol: Long-term Objective Calibration</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-primary/5 border-primary/20 rounded-[2.5rem] p-8">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 flex items-center gap-2">
                            <Sparkles className="h-4 w-4"/> Quick Ingress Templates
                        </h4>
                        <div className="space-y-3">
                            {EXAM_PRESETS.map((preset, i) => (
                                <Button 
                                    key={i} 
                                    variant="outline" 
                                    className="w-full h-14 justify-start gap-4 rounded-2xl border-white/10 bg-black/20 hover:bg-white/5 group transition-all"
                                    onClick={() => applyPreset(preset)}
                                >
                                    <div className={cn("p-2 rounded-xl bg-background", preset.color)}>
                                        <preset.icon className="h-4 w-4" />
                                    </div>
                                    <span className="font-bold uppercase text-[10px] tracking-widest">{preset.name}</span>
                                </Button>
                            ))}
                        </div>
                    </Card>
                </div>

                <Card className="lg:col-span-8 bg-card/40 border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                    <CardHeader className="p-8 sm:p-12 border-b border-white/5 bg-white/5">
                        <CardTitle className="text-xl font-black uppercase tracking-widest italic">Core Mission Config</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 sm:p-12 space-y-8">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Operation Alias</Label>
                            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mission: IIT Bombay" className="h-14 bg-black/20 border-white/10 rounded-2xl text-lg font-bold" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Target Deadline (Exam Date)</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="h-14 w-full justify-start text-left font-bold rounded-2xl bg-black/20 border-white/10">
                                            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                            {examDate ? format(examDate, "PPP") : <span>Set Deadline</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 border-primary/20">
                                        <Calendar mode="single" selected={examDate} onSelect={setExamDate} initialFocus disabled={(date) => date < new Date()} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Temporal Scale ({duration} Days)</Label>
                                <div className="p-4 rounded-2xl bg-black/20 border border-white/10 h-14 flex flex-col justify-center">
                                    <Slider value={[duration]} onValueChange={v => setDuration(v[0])} min={7} max={365} step={1} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Discipline Integration</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-white/5 bg-white/5 hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-3">
                                        <Brain className="h-5 w-5 text-purple-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">NoFap Pulse</span>
                                    </div>
                                    <Switch checked={includeNoFap} onCheckedChange={setIncludeNoFap} />
                                </div>
                                <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-white/5 bg-white/5 hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-3">
                                        <Dumbbell className="h-5 w-5 text-orange-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Stamina Log</span>
                                    </div>
                                    <Switch checked={includeWorkout} onCheckedChange={setIncludeWorkout} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-8 sm:p-12 pt-0">
                        <Button onClick={handleSubmit} disabled={isSubmitting || !name.trim()} className="w-full h-16 rounded-[2rem] text-xl font-black uppercase italic shadow-2xl">
                            {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <Sparkles className="mr-2 h-6 w-6"/>}
                            INITIALIZE MISSION
                        </Button>
                    </CardFooter>
                </Card>
            </div>
         </div>
    );
}
