
'use client';
import { AstroAscentGame } from "@/components/entertainment/astro-ascent";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AstroAscentPage() {
    return (
        <div className="space-y-4">
            <Link href="/dashboard/game-zone/arcade" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Arcade</Link>
            <AstroAscentGame />
        </div>
    )
}
