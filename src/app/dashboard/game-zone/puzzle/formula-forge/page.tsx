'use client';

import { FormulaForge } from "@/components/entertainment/formula-forge";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function FormulaForgePage() {
    return (
        <div className="space-y-4">
            <Link href="/dashboard/game-zone/puzzle" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">
                <ArrowLeft className="inline h-4 w-4 mr-1"/> Back to Puzzle Games
            </Link>
            <FormulaForge />
        </div>
    );
}
