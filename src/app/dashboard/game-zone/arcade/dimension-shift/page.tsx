
'use client';
import { DimensionShiftGame } from "@/components/entertainment/dimension-shift";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DimensionShiftPage() {
    return (
        <div className="space-y-4">
            <Link href="/dashboard/game-zone/arcade" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Arcade</Link>
            <DimensionShiftGame />
        </div>
    )
}
