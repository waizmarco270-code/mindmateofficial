
'use client';
import Link from "next/link";
import { ArrowLeft, Dice5 } from "lucide-react";
import { MemoryPatternGame } from "@/components/entertainment/memory-pattern-game";

export default function MemoryGamesPage() {
    return (
        <div className="space-y-8">
            <div>
                <Link href="/dashboard/entertainment" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Entertainment Zone</Link>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Dice5 className="h-8 w-8 text-primary" />
                    Memory Games
                </h1>
                <p className="text-muted-foreground">How good is your memory? Put it to the test!</p>
            </div>
            <MemoryPatternGame />
        </div>
    )
}
