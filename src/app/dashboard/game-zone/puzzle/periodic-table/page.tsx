
'use client';
import { PeriodicTableGame } from "@/components/entertainment/periodic-table-game";
import Link from 'next/link';

export default function PeriodicTableGamePage() {
    return (
        <div className="space-y-4">
            <Link href="/dashboard/game-zone/puzzle" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Puzzle Games</Link>
            <PeriodicTableGame />
        </div>
    )
}
