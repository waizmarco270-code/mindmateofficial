
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export function MarcoAiLaunchCard() {
    const { isSignedIn } = useUser();

    return (
        <Card className="relative group overflow-hidden border-0 bg-transparent mb-8">
            <div className="absolute inset-0 blue-nebula-bg z-0"></div>
            <div id="particle-container" className="[mask-image:linear-gradient(to_bottom,white_20%,transparent_75%)]">
                {[...Array(12)].map((_, i) => <div key={i} className="particle"></div>)}
            </div>
            <CardContent className="relative z-10 p-6 flex flex-col md:flex-row items-center text-center md:text-left gap-6">
                <div className="p-4 bg-primary/20 border-2 border-primary/50 rounded-full animate-pulse">
                    <Bot className="h-12 w-12 text-primary" />
                </div>
                <div className="flex-1">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary">COMING SOON</h2>
                    <CardTitle className="text-3xl lg:text-4xl font-bold mt-1">Marco AI 👑🔥</CardTitle>
                    <CardDescription className="text-slate-300 mt-2 max-w-lg mx-auto md:mx-0">
                        The revolutionary AI study partner is preparing for launch. Get ready!
                    </CardDescription>
                </div>
                <div className="flex flex-col items-center bg-black/20 p-4 rounded-lg border border-white/10">
                    <p className="text-lg font-bold font-code text-cyan-300">LAUNCHING ON</p>
                    <p className="text-4xl font-bold font-serif text-white mt-1">2nd October</p>
                </div>
            </CardContent>
            {isSignedIn && (
                <div className="relative z-10 p-4 bg-amber-500/10 border-t border-amber-500/20 text-center text-amber-300 text-sm font-semibold flex items-center justify-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    Save up 1000 credits to unlock this legendary feature on day one, or you'll miss out!
                </div>
            )}
        </Card>
    );
}
