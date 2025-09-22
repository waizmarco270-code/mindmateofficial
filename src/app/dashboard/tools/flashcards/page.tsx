
'use client';

import { FlashcardMaker } from '@/components/tools/flashcard-maker';
import { LayoutDashboard } from 'lucide-react';

export default function FlashcardsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <LayoutDashboard className="text-primary"/>
                    Digital Flashcards
                </h1>
                <p className="text-muted-foreground">Create, manage, and study your own flashcard decks for any subject.</p>
            </div>
            <FlashcardMaker />
        </div>
    );
}
