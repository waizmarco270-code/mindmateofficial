
'use client';
import { SubjectSprintGame } from "@/components/entertainment/subject-sprint";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SubjectSprintPage() {
    return (
        <div className="space-y-4">
            <Link href="/dashboard/game-zone/puzzle" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Puzzle Games</Link>
            <SubjectSprintGame />
        </div>
    )
}
