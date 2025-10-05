
'use client';
import { CognitiveCardsGame } from "@/components/entertainment/cognitive-cards";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CognitiveCardsPage() {
    return (
        <div className="space-y-4">
            <Link href="/dashboard/game-zone/memory" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Memory Games</Link>
            <CognitiveCardsGame />
        </div>
    )
}
