'use client';
import Link from "next/link";
import { ArrowLeft, Orbit } from "lucide-react";
import { DimensionShiftGame } from "@/components/entertainment/dimension-shift";
import { FlappyMindGame } from "@/components/entertainment/flappy-mind";
import { Separator } from "@/components/ui/separator";

export default function ArcadeGamesPage() {
    return (
        <div className="space-y-8">
            <div>
                <Link href="/dashboard/game-zone" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Game Zone</Link>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Orbit className="h-8 w-8 text-primary" />
                    Arcade Games
                </h1>
                <p className="text-muted-foreground">Test your reflexes in these fast-paced games.</p>
            </div>
            <div className="space-y-12">
                <FlappyMindGame />
                <Separator />
                <DimensionShiftGame />
            </div>
        </div>
    )
}
