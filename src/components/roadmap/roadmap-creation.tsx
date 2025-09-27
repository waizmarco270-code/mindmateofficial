'use client';
import { useState } from 'react';
import { Roadmap, RoadmapMilestone, RoadmapCategory, RoadmapTask, TargetExam, useRoadmaps } from '@/hooks/use-roadmaps';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { PlusCircle, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


interface RoadmapCreationProps {
    onCancel: () => void;
}

export function RoadmapCreation({ onCancel }: RoadmapCreationProps) {
    const { addRoadmap } = useRoadmaps();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form State
    const [name, setName] = useState('');
    const [targetExam, setTargetExam] = useState<TargetExam>('jee-main-jan');
    const [duration, setDuration] = useState(90);

    const handleSubmit = async () => {
        if(!name.trim()) {
            toast({ variant: 'destructive', title: "Roadmap name is required."});
            return;
        }
        setIsSubmitting(true);
        try {
             const roadmapData = {
                name,
                targetExam,
                duration,
                milestones: [] // Task planning will be a separate step after creation
             };
            await addRoadmap(roadmapData);
            toast({ title: "Roadmap Created!", description: "You can now add milestones and tasks to it." });
            onCancel(); // Go back to the list view
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
                    <CardDescription>Fill in the basic information for your new roadmap.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="roadmap-name">Roadmap Name</Label>
                        <Input id="roadmap-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Mission: IIT Bombay"/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="target-exam">Target Exam</Label>
                        <Select value={targetExam} onValueChange={(v: TargetExam) => setTargetExam(v)}>
                            <SelectTrigger id="target-exam"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="jee-main-jan">JEE Main - January</SelectItem>
                                <SelectItem value="jee-main-apr">JEE Main - April</SelectItem>
                                <SelectItem value="neet">NEET</SelectItem>
                                <SelectItem value="board-12">Class 12 Boards</SelectItem>
                                <SelectItem value="board-10">Class 10 Boards</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Duration ({duration} days)</Label>
                        <Slider value={[duration]} onValueChange={v => setDuration(v[0])} min={7} max={365} step={1} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1 Week</span>
                            <span>1 Year</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                        {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <CheckCircle className="mr-2 h-4 w-4"/>}
                        Create Roadmap
                    </Button>
                </CardFooter>
            </Card>

         </div>
    );
}
