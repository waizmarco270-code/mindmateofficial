
'use client';
import { MathematicsLegendGame } from "@/components/entertainment/mathematics-legend";
import Link from 'next/link';

export default function MathematicsLegendPage() {
    return (
        <div className="space-y-4">
            <Link href="/dashboard/game-zone/puzzle" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Puzzle Games</Link>
            <MathematicsLegendGame />
        </div>
    )
}

    