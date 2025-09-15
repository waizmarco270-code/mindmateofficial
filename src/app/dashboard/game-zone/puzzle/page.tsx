
'use client';
import Link from "next/link";
import { ArrowLeft, Brain } from "lucide-react";
import { EmojiQuiz } from "@/components/entertainment/emoji-quiz";
import { SubjectSprintGame } from "@/components/entertainment/subject-sprint";

export default function PuzzleGamesPage() {
    return (
        <div className="space-y-8">
            <div>
                <Link href="/dashboard/game-zone" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Game Zone</Link>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Brain className="h-8 w-8 text-primary" />
                    Puzzle & Knowledge
                </h1>
                <p className="text-muted-foreground">Solve clever puzzles and test your subject knowledge.</p>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <EmojiQuiz />
                <SubjectSprintGame />
            </div>
        </div>
    )
}
