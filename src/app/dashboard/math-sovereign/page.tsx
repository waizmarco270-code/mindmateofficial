'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sigma, Trophy, ArrowRight, BrainCircuit, 
    Calculator, Star, Flame, Zap, 
    Table as TableIcon, Square, Cuboid, 
    CheckCircle, History, Info, ChevronRight,
    Check, Lock, Gem, Book, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableMaster } from '@/components/math-sovereign/table-master';
import { RootMaster } from '@/components/math-sovereign/root-master';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/hooks/use-admin';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';
import { Progress } from '@/components/ui/progress';

export default function MathSovereignHub() {
    const { user } = useUser();
    const { currentUserData, claimAllTablesBounty } = useAdmin();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('hub');
    const [isMasterySheetOpen, setIsMasterySheetOpen] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);

    const masteredCount = currentUserData?.masteredTables?.length || 0;
    const isBountyClaimable = masteredCount >= 19;
    const hasClaimedBounty = currentUserData?.hasClaimedAllTablesBounty;

    const stats = [
        { 
            label: 'Table Mastery', 
            val: `${masteredCount} / 19`, 
            icon: TableIcon, 
            color: 'text-blue-400',
            onClick: () => setIsMasterySheetOpen(true)
        },
        { 
            label: 'Root Proficiency', 
            val: 'Stable', 
            icon: Zap, 
            color: 'text-yellow-400' 
        },
        { 
            label: 'Perfect Runs', 
            val: String(currentUserData?.masteredTables?.length || 0), 
            icon: Trophy, 
            color: 'text-emerald-400' 
        }
    ];

    const handleClaimBounty = async () => {
        if (!user || isClaiming || !isBountyClaimable || hasClaimedBounty) return;
        setIsClaiming(true);
        try {
            await claimAllTablesBounty(user.id);
            toast({ title: "GRAND ARCHITECT BOUNTY", description: "+500 Credits injected into your mainframe." });
        } finally {
            setIsClaiming(false);
        }
    };

    if (activeTab === 'tables') return <TableMaster onBack={() => setActiveTab('hub')} />;
    if (activeTab === 'roots') return <RootMaster onBack={() => setActiveTab('hub')} />;

    return (
        <div className="space-y-12 pb-40 max-w-6xl mx-auto relative overflow-hidden">
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
                    <Card key={i} className="bg-black/40 border-white/5 backdrop-blur-xl rounded-[2rem] overflow-hidden group cursor-pointer" onClick={s.onClick}>
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

            {/* ULTIMATE BOUNTY SECTION */}
            <div className="relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <Card className={cn(
                        "relative overflow-hidden border-2 rounded-[3rem] shadow-2xl transition-all duration-700",
                        isBountyClaimable && !hasClaimedBounty ? "border-green-500/50 bg-green-500/5" : "border-white/5 bg-slate-900/60"
                    )}>
                        <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                        <CardHeader className="text-center p-8 sm:p-12 relative z-10">
                            <div className="flex justify-center mb-6">
                                <div className={cn(
                                    "p-6 rounded-full border-4 transition-all duration-1000",
                                    isBountyClaimable && !hasClaimedBounty ? "bg-green-500/10 border-green-500 animate-bounce" : "bg-white/5 border-white/10"
                                )}>
                                    <Trophy className={cn("h-12 w-12", isBountyClaimable && !hasClaimedBounty ? "text-green-500" : "text-slate-700")} />
                                </div>
                            </div>
                            <CardTitle className="text-4xl font-black uppercase italic tracking-tighter text-white">Grand Architect Bounty</CardTitle>
                            <CardDescription className="text-lg font-medium text-slate-400">
                                Protocol: Master all 19 tables in the Matrix to unlock the ultimate mainframe reward.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 sm:px-12 pb-12 relative z-10 text-center">
                            <div className="max-w-md mx-auto space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                                        <span>Matrix Synchronization</span>
                                        <span>{masteredCount} / 19 TABLES</span>
                                    </div>
                                    <Progress value={(masteredCount / 19) * 100} className="h-2" indicatorClassName="animated-rainbow-progress" />
                                </div>

                                <Button 
                                    size="lg" 
                                    className={cn(
                                        "w-full h-20 rounded-[2rem] text-2xl font-black uppercase italic shadow-2xl transition-all",
                                        isBountyClaimable && !hasClaimedBounty ? "bg-green-500 hover:bg-green-600 text-black shadow-green-500/20" : "bg-white/5 text-white/20 border-white/5 cursor-not-allowed"
                                    )}
                                    disabled={!isBountyClaimable || hasClaimedBounty || isClaiming}
                                    onClick={handleClaimBounty}
                                >
                                    {isClaiming ? <Loader2 className="animate-spin mr-2" /> : hasClaimedBounty ? <CheckCircle className="mr-2" /> : <Lock className="mr-2" />}
                                    {hasClaimedBounty ? 'BOUNTY SECURED' : isBountyClaimable ? 'CLAIM 500 CREDITS' : 'BOUNTY LOCKED'}
                                </Button>
                                
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">
                                    {isBountyClaimable ? "Authorized for immediate claim." : `Requires ${19 - masteredCount} more perfect calibrations.`}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* MASTERY INSPECTION DIALOG */}
            <Dialog open={isMasterySheetOpen} onOpenChange={setIsMasterySheetOpen}>
                <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-3xl border-primary/20 rounded-[3rem] p-0 overflow-hidden shadow-2xl">
                    <div className="h-32 bg-gradient-to-br from-blue-500/20 via-background to-background relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                        <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white/40 hover:text-white z-50 rounded-full h-10 w-10" onClick={() => setIsMasterySheetOpen(false)}><X className="h-6 w-6"/></Button>
                    </div>
                    <div className="px-8 pb-12 -mt-12 relative z-10">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="h-20 w-20 rounded-[1.5rem] bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center shadow-xl">
                                <TableIcon className="h-10 w-10 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black uppercase italic tracking-tighter">Mastery Registry</h3>
                                <p className="text-xs font-black uppercase text-primary tracking-[0.2em]">Verified Matrix Connections</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                            {Array.from({ length: 19 }).map((_, i) => {
                                const table = i + 2;
                                const isMastered = currentUserData?.masteredTables?.includes(table);
                                return (
                                    <div key={table} className={cn(
                                        "p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all",
                                        isMastered ? "bg-green-500/10 border-green-500/50 text-green-400 shadow-lg shadow-green-500/10" : "bg-white/5 border-white/5 text-slate-700"
                                    )}>
                                        <p className="text-[8px] font-black uppercase mb-1">Table</p>
                                        <p className="text-2xl font-black italic">{table}</p>
                                        {isMastered && <Check className="h-3 w-3 mt-1" strokeWidth={4} />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
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
                <div className={cn("p-6 rounded-3xl bg-black/40 border border-white/10 group-hover:scale-110 transition-transform duration-500", color)}>
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
