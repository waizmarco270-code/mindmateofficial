
'use client';
import { WordUnscrambleGame } from "@/components/entertainment/word-unscramble";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function WordUnscramblePage() {
    return (
        <div className="space-y-4">
            <Link href="/dashboard/game-zone/word-games" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Word Games</Link>
            <WordUnscrambleGame />
        </div>
    )
}
