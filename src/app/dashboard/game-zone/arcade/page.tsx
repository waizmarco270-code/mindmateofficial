
'use client';
import Link from "next/link";
import { ArrowLeft, Orbit, Rocket, Bird } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const arcadeGames = [
    {
        title: "Astro Ascent",
        description: "Land your rocket safely, but watch your fuel!",
        icon: Rocket,
        href: "/dashboard/game-zone/arcade/astro-ascent",
        color: "from-purple-500 to-indigo-500",
    },
    {
        title: "Flappy Mind",
        description: "Guide the book through a maze of distractions.",
        icon: Bird,
        href: "/dashboard/game-zone/arcade/flappy-mind",
        color: "from-sky-500 to-cyan-500",
    },
    {
        title: "Dimension Shift",
        description: "Switch dimensions to phase through obstacles.",
        icon: Orbit,
        href: "/dashboard/game-zone/arcade/dimension-shift",
        color: "from-rose-500 to-red-500",
    },
];

export default function ArcadeHubPage() {
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {arcadeGames.map((game, index) => (
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
