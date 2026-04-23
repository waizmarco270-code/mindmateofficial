
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sigma, Trophy, ArrowRight, BrainCircuit, 
    Calculator, Star, Flame, Zap, 
    Table as TableIcon, Square, Cuboid, 
    CheckCircle, History, Info, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableMaster } from '@/components/math-sovereign/table-master';
import { RootMaster } from '@/components/math-sovereign/root-master';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/hooks/use-admin';

export default function MathSovereignHub() {
    const { currentUserData } = useAdmin();
    const [activeTab, setActiveTab] = useState('hub');

    const stats = [
        { label: 'Table Mastery', val: 'N/A', icon: TableIcon, color: 'text-blue-400' },
        { label: 'Power Level', val: 'N/A', icon: Zap, color: 'text-yellow-400' },
        { label: 'Perfect Runs', val: '0', icon: Trophy, color: 'text-emerald-400' }
    ];

    if (activeTab === 'tables') return <TableMaster onBack={() => setActiveTab('hub')} />;
    if (activeTab === 'roots') return <RootMaster onBack={() => setActiveTab('hub')} />;

    return (
        <div className="space-y-12 pb-20 max-w-6xl mx-auto relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 blue-nebula-bg opacity-30" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4 relative z-10"
            >
                <div className="mx-auto w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center border-2 border-primary/20 shadow-2xl backdrop-blur-md">
                    <Sigma className="h-12 w-12 text-primary animate-pulse" />
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
                    Math Sovereign
                </h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Protocol: Numerical Dominance</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {stats.map((s, i) => (
                    <Card key={i} className="bg-black/40 border-white/5 backdrop-blur-xl rounded-[2rem] overflow-hidden group">
                        <div className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
                                <p className="text-3xl font-black text-white italic">{s.val}</p>
                            </div>
                            <div className={cn("p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform", s.color)}>
                                <s.icon className="h-6 w-6" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                <ProtocolCard 
                    title="The Table Matrix"
                    desc="Master multiplication tables from 2 to 20. Essential for competitive calculation speeds."
                    icon={TableIcon}
                    gradient="from-blue-500/20 to-transparent"
                    border="border-blue-500/30"
                    color="text-blue-400"
                    onClick={() => setActiveTab('tables')}
                />
                <ProtocolCard 
                    title="Power & Root Forge"
                    desc="Master Squares (1-30) and Cubes (1-25). Memorize the structure of escalation."
                    icon={Zap}
                    gradient="from-yellow-500/20 to-transparent"
                    border="border-yellow-500/30"
                    color="text-yellow-400"
                    onClick={() => setActiveTab('roots')}
                />
            </div>

            <Card className="relative z-10 border-primary/20 bg-slate-900 shadow-2xl rounded-[3rem] overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                <CardHeader className="p-8 sm:p-12 text-center">
                    <CardTitle className="text-3xl font-black uppercase italic tracking-tight">Daily Sovereign Challenge</CardTitle>
                    <CardDescription className="text-base text-slate-400 font-medium">Complete one perfect run in every domain to claim the Daily Treasury Bonus.</CardDescription>
                </CardHeader>
                <CardContent className="px-8 sm:px-12 pb-12">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <ChallengeRequirement label="Table Strike" done={false} />
                        <ChallengeRequirement label="Square Sync" done={false} />
                        <ChallengeRequirement label="Cube Forge" done={false} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function ProtocolCard({ title, desc, icon: Icon, gradient, border, color, onClick }: any) {
    return (
        <Card 
            className={cn("relative overflow-hidden cursor-pointer group hover:scale-[1.02] transition-all duration-500 rounded-[3rem] border-2", border)}
            onClick={onClick}
        >
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", gradient)} />
            <CardContent className="p-10 flex flex-col items-center text-center gap-6 relative z-10">
                <div className={cn("p-6 rounded-3xl bg-black/40 border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-2xl", color)}>
                    <Icon className="h-12 w-12" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">{title}</h3>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-xs">{desc}</p>
                </div>
                <Button variant="ghost" className="mt-4 font-black uppercase text-[10px] tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity">
                    Initialize Protocol <ArrowRight className="ml-2 h-4 w-4"/>
                </Button>
            </CardContent>
        </Card>
    );
}

function ChallengeRequirement({ label, done }: { label: string, done: boolean }) {
    return (
        <div className={cn(
            "p-4 rounded-2xl border-2 flex items-center justify-between transition-all",
            done ? "bg-green-500/10 border-green-500/50 text-green-500" : "bg-white/5 border-white/5 text-slate-500"
        )}>
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
            {done ? <CheckCircle className="h-4 w-4"/> : <CircleIcon className="h-4 w-4 opacity-20"/>}
        </div>
    );
}

function CircleIcon({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/></svg>;
}
