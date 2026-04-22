
'use client';

import { ChronosGame } from "@/components/entertainment/chronos-game";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ChronosPage() {
    return (
        <div className="space-y-4">
            <Link href="/dashboard/game-zone/puzzle" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">
                <ArrowLeft className="inline h-4 w-4 mr-1"/> Back to Puzzle Games
            </Link>
            <ChronosGame />
        </div>
    );
}
