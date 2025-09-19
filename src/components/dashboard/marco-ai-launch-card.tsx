
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

const AiBrainIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2a10 10 0 0 0-10 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69a3.6 3.6 0 0 1 .1-2.64s.84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.4.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.73c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
      <path d="M9 12c0 .55.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1h-4c-.55 0-1 .45-1 1Z" />
      <path d="M9 8c0 .55.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1h-4c-.55 0-1 .45-1 1Z" />
      <path d="M15 16c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1s.45-1 1-1h4c.55 0 1 .45 1 1Z" />
      <path d="M12 6V5" />
      <path d="M12 18v1" />
      <path d="M16 8l.7.7" />
      <path d="M8 16l-.7-.7" />
      <path d="M16 16l.7-.7" />
      <path d="M8 8l-.7.7" />
    </svg>
);


export function MarcoAiLaunchCard() {
    const { isSignedIn } = useUser();

    return (
        <Card className="relative group overflow-hidden border-0 bg-transparent mb-8">
            <div className="absolute inset-0 blue-nebula-bg z-0"></div>
            <div id="particle-container" className="[mask-image:linear-gradient(to_bottom,white_20%,transparent_75%)]">
                {[...Array(12)].map((_, i) => <div key={i} className="particle"></div>)}
            </div>
            <CardContent className="relative z-10 p-6 flex flex-col md:flex-row items-center text-center md:text-left gap-6">
                <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-full animate-flicker">
                    <AiBrainIcon className="h-12 w-12 text-red-400" />
                </div>
                <div className="flex-1">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-red-400">COMING SOON</h2>
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
