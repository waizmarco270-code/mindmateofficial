
'use client';
import Link from "next/link";
import { ArrowLeft, Swords } from "lucide-react";
import { TicTacToeGame } from "@/components/entertainment/tic-tac-toe";

export default function StrategyGamesPage() {
    return (
        <div className="space-y-8">
            <div>
                <Link href="/dashboard/entertainment" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Entertainment Zone</Link>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Swords className="h-8 w-8 text-primary" />
                    Strategy Games
                </h1>
                <p className="text-muted-foreground">Challenge your mind with classic strategy games.</p>
            </div>
            <TicTacToeGame />
        </div>
    )
}
