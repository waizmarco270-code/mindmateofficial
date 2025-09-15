
'use client';
import Link from "next/link";
import { ArrowLeft, Newspaper } from "lucide-react";
import { WordHuntGame } from "@/components/entertainment/word-hunt";
import { WordUnscrambleGame } from "@/components/entertainment/word-unscramble";

export default function WordGamesPage() {
    return (
        <div className="space-y-8">
            <div>
                <Link href="/dashboard/entertainment" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Entertainment Zone</Link>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Newspaper className="h-8 w-8 text-primary" />
                    Word Games
                </h1>
                <p className="text-muted-foreground">Test your vocabulary and unscramble words.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <WordHuntGame />
                <WordUnscrambleGame />
            </div>
        </div>
    )
}
