
'use client';
import { RockPaperScissorsGame } from "@/components/entertainment/rock-paper-scissors";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RockPaperScissorsPage() {
    return (
        <div className="space-y-4">
            <Link href="/dashboard/game-zone/strategy" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Strategy Games</Link>
            <RockPaperScissorsGame />
        </div>
    )
}
