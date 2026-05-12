'use client';

import { useState } from 'react';
import { useInstitution } from '@/hooks/use-institution';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    School, ShieldAlert, Zap, 
    Trophy, Rocket, ShieldCheck, 
    Target, LayoutDashboard, History,
    Users, UserCog, Crown, Star, 
    BarChart3, Settings, Clock,
    Megaphone, Timer, Lock, ArrowRight,
    Sparkles, Construction, Globe, Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function InstitutionHubPage() {
    // Note: underlying hooks are kept for future re-activation but logic is currently bypassed by the maintenance view.
    const { academy } = useInstitution();

    return (
        <div className="min-h-full flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 blue-nebula-bg opacity-30" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.15)_0%,_transparent_70%)]" />
                <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl w-full relative z-10 space-y-12"
            >
                <header className="text-center space-y-6">
                    <div className="mx-auto w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center border-2 border-primary/20 shadow-2xl backdrop-blur-md relative">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            className="absolute -inset-4 border border-dashed border-primary/30 rounded-full"
                        />
                        <School className="h-12 w-12 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
                            Academy Hub
                        </h1>
                        <div className="flex items-center justify-center gap-3">
                            <Badge className="bg-amber-500 text-black font-black uppercase tracking-widest px-4 py-1">
                                PROTOCOL: RESTRICTED ACCESS
                            </Badge>
                        </div>
                    </div>
                </header>

                <Card className="bg-slate-900/60 border-primary/30 backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                    <CardHeader className="p-8 sm:p-12 text-center relative z-10 border-b border-white/5 bg-primary/5">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full bg-amber-500/10 border-2 border-amber-500/20 text-amber-500 animate-pulse">
                                <Construction className="h-10 w-10" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-black uppercase italic text-white tracking-tight">Phase 1: Deployment</CardTitle>
                        <CardDescription className="text-lg font-medium text-slate-400 mt-2 max-w-xl mx-auto">
                            The Institutional Monitoring ecosystem is currently undergoing core calibration. Full proctoring authority will manifest in a future briefing.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-8 sm:p-12 space-y-12 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FeaturePreview 
                                icon={LayoutDashboard} 
                                label="Proctor Command" 
                                desc="A centralized mission-control terminal for teachers and academy heads."
                                color="text-emerald-400"
                            />
                            <FeaturePreview 
                                icon={ShieldCheck} 
                                label="Live Surveillance" 
                                desc="Real-time monitoring of student focus sessions and discipline fidelity."
                                color="text-sky-400"
                            />
                            <FeaturePreview 
                                icon={Crown} 
                                label="Centurion Ranks" 
                                desc="Appoint student monitors with peer governance authority and special badges."
                                color="text-yellow-400"
                            />
                            <FeaturePreview 
                                icon={Target} 
                                label="Strategic Directives" 
                                desc="Inject bulk study objectives directly into student roadmaps with auto-verification."
                                color="text-rose-400"
                            />
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                            <div className="p-4 rounded-2xl bg-primary/10 text-primary shadow-xl">
                                <Info className="h-8 w-8" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-lg font-black uppercase italic text-white">Why Academy Hub?</h4>
                                <p className="text-sm text-slate-400 leading-relaxed font-medium italic">
                                    "Standard study is solitary. Academy study is elite. We are building the tools for institutes to forge high-performance student fleets through data-driven accountability."
                                </p>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="p-8 sm:p-12 pt-0 relative z-10 flex flex-col gap-4">
                        <Button asChild size="lg" className="w-full h-16 rounded-2xl font-black text-xl italic shadow-xl shadow-primary/20">
                            <Link href="/dashboard">RETURN TO MAIN HUD <ArrowRight className="ml-2"/></Link>
                        </Button>
                        <p className="text-[10px] text-center font-black uppercase tracking-[0.4em] text-slate-600">Sovereign Registry Persistence: ACTIVE</p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}

function FeaturePreview({ icon: Icon, label, desc, color }: any) {
    return (
        <div className="p-6 rounded-[2rem] bg-black/40 border border-white/5 space-y-4 group hover:border-primary/20 transition-all">
            <div className={cn("p-3 rounded-2xl bg-white/5 w-fit border border-white/5 group-hover:scale-110 transition-transform", color)}>
                <Icon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
                <h4 className="font-black uppercase italic text-white">{label}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
