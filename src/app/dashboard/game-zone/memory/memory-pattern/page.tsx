
'use client';
import { MemoryPatternGame } from "@/components/entertainment/memory-pattern-game";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function MemoryPatternPage() {
    return (
        <div className="space-y-4">
            <Link href="/dashboard/game-zone/memory" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Memory Games</Link>
            <MemoryPatternGame />
        </div>
    )
}
