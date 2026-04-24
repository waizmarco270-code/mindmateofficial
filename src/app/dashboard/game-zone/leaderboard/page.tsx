
'use client';

import { ArenaLeaderboard } from '@/components/game-zone/arena-leaderboard';
import { motion } from 'framer-motion';
import { Orbit, Trophy, Globe, History, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ArcadeArenaPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden pb-40">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 cyber-grid-bg opacity-30" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(244,63,94,0.15)_0%,_transparent_70%)]" />
                <div className="absolute inset-0 red-nebula-bg opacity-20" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl space-y-12">
                <header className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <Button asChild variant="ghost" className="rounded-full h-12 w-12 bg-white/5 border border-white/10 text-white hover:bg-rose-500/20 hover:text-rose-400 transition-all">
                            <Link href="/dashboard/game-zone"><ChevronLeft/></Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <Orbit className="h-10 w-10 text-rose-500 animate-pulse" />
                                <h1 className="text-5xl sm:text-6xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent leading-none">
                                    SKILL ARENA
                                </h1>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500/60">Registry Verification Active</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" className="rounded-2xl border-white/10 bg-white/5 font-black uppercase text-[10px] tracking-widest px-8 h-12">
                            <Link href="/dashboard/leaderboard">
                                <Globe className="mr-2 h-4 w-4"/> Global Registry
                            </Link>
                        </Button>
                    </div>
                </header>

                <ArenaLeaderboard />
            </div>
        </div>
    );
}
