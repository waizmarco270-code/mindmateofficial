'use client';

import { useState } from 'react';
import { useInstitution } from '@/hooks/use-institution';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    School, Users, Plus, 
    ArrowRight, Loader2, ShieldCheck, 
    Zap, Gem, Trophy, Globe,
    ChevronRight, Info, ShieldAlert,
    Building2, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProctorCommand } from '@/components/institution/proctor-command';
import { StudentHub } from '@/components/institution/student-hub';
import { useAdmin } from '@/hooks/use-admin';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function InstitutionHubPage() {
    const { academy, loading, createAcademy, joinAcademy } = useInstitution();
    const { currentUserData } = useAdmin();
    const { toast } = useToast();

    const [view, setView] = useState<'hub' | 'create' | 'join'>('hub');
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setIsSubmitting(true);
        try {
            await createAcademy(name, desc);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;
        setIsSubmitting(true);
        try {
            await joinAcademy(code);
        } catch (e: any) {
            toast({ variant: 'destructive', title: "Join Error", description: e.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex h-full w-full items-center justify-center p-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );

    if (academy) {
        return currentUserData?.institutionRole === 'proctor' ? <ProctorCommand /> : <StudentHub />;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
            <header className="text-center space-y-4">
                <div className="mx-auto w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center border-2 border-primary/20 shadow-2xl backdrop-blur-md">
                    <School className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">Academy Hub</h1>
                <p className="text-slate-400 font-medium max-w-xl mx-auto text-lg leading-relaxed">
                    Protocol: Professional-Grade Institutional Monitoring. <br />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Enterprise Architecture v1.0</span>
                </p>
            </header>

            <AnimatePresence mode="wait">
                {view === 'hub' && (
                    <motion.div 
                        key="hub"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
                    >
                        <SelectionCard 
                            icon={Building2} 
                            label="PROCTOR INGRESS" 
                            desc="Establish a new academy. Monitor students, set directives, and manage hierarchies."
                            color="text-emerald-400"
                            onClick={() => setView('create')}
                            badge="TEACHERS / ADMINS"
                        />
                        <SelectionCard 
                            icon={Users} 
                            label="CITIZEN JOIN" 
                            desc="Enter an existing academy registry using a valid Sovereign code."
                            color="text-sky-400"
                            onClick={() => setView('join')}
                            badge="STUDENTS"
                        />
                    </motion.div>
                )}

                {view === 'create' && (
                    <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto">
                        <Card className="bg-slate-900/60 border-primary/20 rounded-[3rem] overflow-hidden shadow-2xl">
                            <CardHeader className="p-8 sm:p-12 border-b border-white/5 bg-primary/5">
                                <Button variant="ghost" size="sm" onClick={() => setView('hub')} className="mb-4 rounded-full text-slate-500 hover:text-white"><ArrowRight className="rotate-180 mr-2 h-4 w-4"/> Back</Button>
                                <CardTitle className="text-3xl font-black italic uppercase text-primary">Initialize Academy</CardTitle>
                                <CardDescription>Forge a private ecosystem for your student fleet.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 sm:p-12 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Institution Name</Label>
                                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Imperial Science Academy" className="h-14 bg-black/20 text-lg font-bold rounded-2xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Operational Intel</Label>
                                    <Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Brief description of your academy..." className="bg-black/20 rounded-2xl min-h-[120px]" />
                                </div>
                                <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-4">
                                    <ShieldAlert className="h-6 w-6 text-amber-500 shrink-0" />
                                    <p className="text-xs font-medium text-amber-200/60 leading-relaxed italic">"As a Proctor, you will have root-access visibility into your students' Focus Sessions, Study Hours, and Milestone progress."</p>
                                </div>
                            </CardContent>
                            <CardFooter className="p-8 sm:p-12 pt-0">
                                <Button onClick={handleCreate} disabled={isSubmitting || !name.trim()} className="w-full h-16 rounded-[2rem] text-xl font-black uppercase italic shadow-xl">
                                    {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <Plus className="mr-2"/>} ESTABLISH REGISTRY
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}

                {view === 'join' && (
                    <motion.div key="join" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-xl mx-auto">
                        <Card className="bg-slate-900/60 border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                            <CardHeader className="p-8 sm:p-12 border-b border-white/5">
                                <Button variant="ghost" size="icon" onClick={() => setView('hub')} className="mb-4 rounded-full"><ArrowRight className="rotate-180"/></Button>
                                <CardTitle className="text-3xl font-black italic uppercase tracking-tighter">Enter Academy</CardTitle>
                                <CardDescription>Provide your Sovereign Code to link with your Proctor.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 sm:p-12 space-y-8">
                                <div className="space-y-4 text-center">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Academy Join Code</Label>
                                    <Input 
                                        value={code} 
                                        onChange={e => setCode(e.target.value.toUpperCase())} 
                                        placeholder="XXXXXX" 
                                        className="h-20 text-center text-5xl font-black tracking-[0.5em] bg-black/40 border-primary/20 rounded-3xl focus-visible:ring-primary/30"
                                        maxLength={6}
                                    />
                                </div>
                                <div className="p-6 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 text-center">
                                    <p className="text-xs text-slate-400 font-medium italic">"Uplinking will share your study logs and progress with the Academy Proctor."</p>
                                </div>
                            </CardContent>
                            <CardFooter className="p-8 sm:p-12 pt-0">
                                <Button onClick={handleJoin} disabled={isSubmitting || code.length < 6} className="w-full h-16 rounded-2xl text-xl font-black uppercase bg-primary shadow-xl">
                                    {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <Zap className="mr-2 h-6 w-6 fill-current"/>}
                                    AUTHORIZE UPLINK
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SelectionCard({ icon: Icon, label, desc, onClick, color, badge }: any) {
    return (
        <Card 
            className="bg-black/40 border-2 border-white/5 cursor-pointer group hover:bg-primary/10 hover:border-primary/30 transition-all duration-500 rounded-[3rem] overflow-hidden relative"
            onClick={onClick}
        >
            <div className="absolute inset-0 bg-grid-white/5 opacity-5" />
            <div className="absolute top-6 right-6">
                <Badge variant="outline" className="text-[8px] font-black tracking-widest border-white/10 uppercase">{badge}</Badge>
            </div>
            <CardContent className="p-12 flex flex-col items-center text-center gap-6 relative z-10">
                <div className={cn("p-6 rounded-3xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500", color)}>
                    <Icon className="h-10 w-10" />
                </div>
                <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">{label}</h3>
                    <p className="text-slate-500 font-medium text-sm mt-2 leading-relaxed">{desc}</p>
                </div>
                <Button variant="ghost" className="mt-4 font-black uppercase text-[10px] tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity">
                    Initialize <ChevronRight className="ml-1 h-3 w-3"/>
                </Button>
            </CardContent>
        </Card>
    );
}
