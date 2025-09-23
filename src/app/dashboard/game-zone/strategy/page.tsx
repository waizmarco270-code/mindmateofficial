
'use client';
import Link from "next/link";
import { ArrowLeft, Swords, Hand, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const strategyGames = [
    {
        title: "Rock, Paper, Scissors",
        description: "Outsmart the AI in this classic game of wit.",
        icon: Hand,
        href: "/dashboard/game-zone/strategy/rock-paper-scissors",
        color: "from-amber-500 to-yellow-500",
    },
    {
        title: "Tic-Tac-Toe",
        description: "Challenge an unbeatable AI. A true test of strategy.",
        icon: X,
        href: "/dashboard/game-zone/strategy/tic-tac-toe",
        color: "from-blue-500 to-sky-500",
    }
];

export default function StrategyHubPage() {
    return (
        <div className="space-y-8">
            <div>
                <Link href="/dashboard/game-zone" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Game Zone</Link>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Swords className="h-8 w-8 text-primary" />
                    Strategy Games
                </h1>
                <p className="text-muted-foreground">Challenge your mind with classic strategy games.</p>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {strategyGames.map((game, index) => (
                    <motion.div
                        key={game.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                         <Link href={game.href} className="block h-full group">
                            <Card className="h-full flex flex-col justify-between items-center text-center p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                <div>
                                    <div className={`mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br ${game.color} mb-4`}>
                                        <game.icon className="h-10 w-10 text-white" />
                                    </div>
                                    <CardTitle>{game.title}</CardTitle>
                                    <CardDescription className="mt-2">{game.description}</CardDescription>
                                </div>
                                <Button variant="outline" className="mt-6 w-full">Play Now</Button>
                            </Card>
                         </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
