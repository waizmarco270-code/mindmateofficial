
'use client';
import { WordHuntGame } from "@/components/entertainment/word-hunt";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function WordHuntPage() {
    return (
        <div className="space-y-4">
            <Link href="/dashboard/game-zone/word-games" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Word Games</Link>
            <WordHuntGame />
        </div>
    )
}
