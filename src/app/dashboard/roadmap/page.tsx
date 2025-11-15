

'use client';
import { RoadmapPageContent } from '@/components/roadmap/roadmap-page-content';
import { Map } from 'lucide-react';


export default function RoadmapPage() {
  return (
    <div className="space-y-8">
       <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Map className="h-8 w-8 text-primary" />
                Roadmap
            </h1>
            <p className="text-muted-foreground">Plan your long-term success and track your progress.</p>
        </div>
        <RoadmapPageContent />
    </div>
  );
}
