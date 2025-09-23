
'use client';
import { FlappyMindGame } from "@/components/entertainment/flappy-mind";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function FlappyMindPage() {
    return (
        <div className="space-y-4">
            <Link href="/dashboard/game-zone/arcade" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Arcade</Link>
            <FlappyMindGame />
        </div>
    )
}
