
'use client';
import { Roadmap, useRoadmaps } from '@/hooks/use-roadmaps';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';

interface RoadmapViewProps {
    roadmap: Roadmap;
    onBack: () => void;
    onPlan: () => void;
}

export function RoadmapView({ roadmap, onBack, onPlan }: RoadmapViewProps) {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{roadmap.name}</h1>
                        <p className="text-muted-foreground capitalize">
                            {roadmap.targetExam.replace(/-/g, ' ')} - {roadmap.duration} Day Plan
                        </p>
                    </div>
                </div>
                 <Button variant="outline" onClick={onPlan}>
                    <Edit className="mr-2 h-4 w-4" /> Plan Tasks
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Roadmap Timeline</CardTitle>
                    <CardDescription>This is where your milestones and progress will be visualized.</CardDescription>
                </CardHeader>
                <CardContent className="min-h-[400px] flex items-center justify-center text-center border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Timeline visualization coming soon!</p>
                </CardContent>
            </Card>
        </div>
    );
}
