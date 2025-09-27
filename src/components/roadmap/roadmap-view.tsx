
'use client';

import { Roadmap } from '@/hooks/use-roadmaps';

// This component will be created in a future step.
// For now, it's a placeholder.
export function RoadmapView({ roadmap, onBack }: { roadmap: Roadmap, onBack: () => void }) {
    return (
        <div>
            <h1>{roadmap.name} (Placeholder)</h1>
            <button onClick={onBack}>Back</button>
        </div>
    )
}
