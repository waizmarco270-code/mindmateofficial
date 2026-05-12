'use client';

import { useState } from 'react';
import { useInstitution } from '@/hooks/use-institution';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Users, Target, Zap, 
    ShieldCheck, Gem, Trophy, 
    Clock, MessageSquare, Plus,
    X, CheckCircle, ShieldAlert,
    LayoutDashboard, History, Send,
    UserCog, Crown, Star, MoreVertical,
    BarChart3, ShieldX, Trash2, Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export function ProctorCommand() {
    const { academy, students, directives, deployDirective, setStudentRole, rewardStudent, leaveAcademy } = useInstitution();
    const { toast } = useToast();
    
    const [isDirectiveOpen, setIsDirectiveOpen] = useState(false);
    const [directiveText, setDirectiveText] = useState('');
    const [directiveType, setDirectiveType] = useState<'global' | 'subject' | 'urgent'>('global');
    
    const [rewardUser, setRewardUser] = useState<any>(null);
    const [rewardAmt, setRewardAmt] = useState(50);
    const [rewardMsg, setRewardMsg] = useState('');

    const stats = [
        { label: 'Total Citizens', val: students.length, icon: Users, color: 'text-primary' },
        { label: 'Avg Discipline', val: '88%', icon: ShieldCheck, color: 'text-emerald-400' },
        { label: 'Active Missions', val: directives.length, icon: Target, color: 'text-rose-400' },
        { label: 'Sovereign Pulse', val: 'Active', icon: Zap, color: 'text-yellow-400' },
    ];

    const handleDeploy = async () => {
        if (!directiveText.trim()) return;
        await deployDirective(directiveText, directiveType);
        setDirectiveText('');
        setIsDirectiveOpen(false);
    };

    const handleReward = async () => {
        if (!rewardUser || !rewardAmt) return;
        await rewardStudent(rewardUser.uid, rewardAmt, rewardMsg);
        setRewardUser(null);
        setRewardAmt(50);
        setRewardMsg('');
    };

    if (!academy) return null;

    return (
        <div className="space-y-8 pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="p-1.5 rounded-[2rem] border-2 border-primary animate-gold-shine shadow-2xl">
                        <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                            <AvatarImage src={academy.logoUrl || undefined} />
                            <AvatarFallback className="bg-muted text-3xl font-black">{academy.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </div>
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase italic text-white leading-none">{academy.name}</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Proctor Terminal v1.0</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="p-3 bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center px-6">
                        <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Join Code</p>
                        <p className="text-xl font-black text-white tracking-widest">{academy.joinCode}</p>
                    </div>
                    <Button onClick={() => setIsDirectiveOpen(true)} className="h-14 px-8 rounded-2xl font-black uppercase italic shadow-xl bg-primary text-white">
                        <Send className="mr-3 h-5 w-5"/> DEPLOY DIRECTIVE
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <Card key={i} className="bg-white/5 border-white/5 rounded-3xl overflow-hidden relative group hover:border-primary/30 transition-all">
                        <div className="absolute inset-0 bg-grid-white/5 opacity-5" />
                        <CardContent className="p-6 flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">{s.label}</p>
                                <p className="text-3xl font-black italic">{s.val}</p>
                            </div>
                            <s.icon className={cn("h-6 w-6 opacity-20 group-hover:opacity-100 transition-opacity", s.color)} />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* STUDENT REGISTRY */}
                <Card className="lg:col-span-8 bg-black/20 border-white/5 rounded-[3rem] overflow-hidden">
                    <CardHeader className="p-8 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black uppercase italic flex items-center gap-3"><Users className="text-primary"/> Citizen Registry</CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Live Surveillance Data</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[600px]">
                            <div className="divide-y divide-white/5">
                                {students.map((student) => (
                                    <div key={student.uid} className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors group">
                                        <div className="flex items-center gap-6 flex-1 min-w-0">
                                            <div className="relative">
                                                <Avatar className="h-14 w-14 border-2 border-white/10">
                                                    <AvatarImage src={student.photoURL} />
                                                    <AvatarFallback>U</AvatarFallback>
                                                </Avatar>
                                                <div className="absolute -bottom-1 -right-1 p-1 bg-background rounded-full border border-white/10 shadow-lg">
                                                    <BadgeIcon role={student.institutionRole} />
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-black text-lg uppercase italic tracking-tighter truncate">{student.displayName}</h4>
                                                    <Badge variant="outline" className="text-[8px] font-black uppercase">{student.institutionRole || 'Citizen'}</Badge>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <div className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-primary opacity-50"/><span className="text-[10px] font-bold text-muted-foreground uppercase">{Math.round((student.totalStudyTime || 0) / 3600)}h STUDY</span></div>
                                                    <div className="flex items-center gap-1.5"><Trophy className="h-3 w-3 text-amber-500 opacity-50"/><span className="text-[10px] font-bold text-muted-foreground uppercase">{student.credits} CR</span></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => setRewardUser(student)} className="rounded-xl h-10 px-4 font-black uppercase text-[9px] bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300">
                                                GIFT BOUNTY
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-white/5"><UserCog className="h-4 w-4"/></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-white/10 rounded-2xl p-2">
                                                    <DropdownMenuItem className="p-3 rounded-xl font-bold gap-3" onClick={() => setStudentRole(student.uid, 'monitor')}>
                                                        <ShieldCheck className="h-4 w-4 text-primary" /> Appoint Monitor
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="p-3 rounded-xl font-bold gap-3" onClick={() => setStudentRole(student.uid, 'student')}>
                                                        <Users className="h-4 w-4 text-slate-400" /> Revoke Privilege
                                                    </DropdownMenuItem>
                                                    <Separator className="my-2 bg-white/5" />
                                                    <DropdownMenuItem className="p-3 rounded-xl font-bold gap-3 text-red-500 hover:bg-red-500/10">
                                                        <ShieldX className="h-4 w-4" /> Purge Registry
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* ACTIVE DIRECTIVES */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-slate-900/60 border-white/5 rounded-[2.5rem]">
                        <CardHeader className="p-8 border-b border-white/5 bg-white/5">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-rose-500 flex items-center gap-2">
                                <Megaphone className="h-4 w-4" /> Global Missions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-96 p-6">
                                <div className="space-y-4">
                                    {directives.map(d => (
                                        <div key={d.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 relative group">
                                            <div className="flex justify-between items-start">
                                                <Badge className={cn(
                                                    "text-[8px] font-black uppercase",
                                                    d.type === 'urgent' ? "bg-red-600" : "bg-primary"
                                                )}>{d.type}</Badge>
                                                <span className="text-[8px] font-bold text-muted-foreground uppercase">{format(d.createdAt.toDate(), 'MMM d')}</span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-200 italic leading-snug">"{d.text}"</p>
                                            <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                                                <p className="text-[8px] font-black uppercase text-primary/60">Pulse Sent</p>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3 text-red-500"/></Button>
                                            </div>
                                        </div>
                                    ))}
                                    {directives.length === 0 && <div className="py-12 text-center opacity-20 italic text-sm">No active directives.</div>}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20 rounded-[2.5rem] p-8 text-center space-y-4">
                        <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto border-2 border-primary/20 shadow-xl">
                            <BarChart3 className="h-10 w-10 text-primary" />
                        </div>
                        <h4 className="text-xl font-black uppercase italic text-white tracking-tighter leading-none">Synergy Statistics</h4>
                        <p className="text-xs font-medium text-slate-400">Advanced cognitive analysis for the entire academy will manifest in the next briefing.</p>
                        <Button variant="outline" className="w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest border-primary/20 bg-primary/5">GENERATE BRIEFING</Button>
                    </Card>
                </div>
            </div>

            {/* DIRECTIVE MODAL */}
            <Dialog open={isDirectiveOpen} onOpenChange={setIsDirectiveOpen}>
                <DialogContent className="max-w-xl bg-slate-950 border-primary/30 rounded-[3rem] p-0 overflow-hidden shadow-2xl">
                    <div className="p-8 sm:p-12 space-y-8">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter text-white">Deploy Directive</DialogTitle>
                            <DialogDescription className="text-sm font-medium text-slate-400">Inject a mission objective into the roadmaps of all academy citizens.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Directive Text</Label>
                                <Textarea value={directiveText} onChange={e => setDirectiveText(e.target.value)} placeholder="e.g. Master the first 5 chapters of Organic Chemistry by Sunday..." className="h-32 bg-black/40 border-white/10 rounded-2xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Mission Tier</Label>
                                <Select value={directiveType} onValueChange={(v: any) => setDirectiveType(v)}>
                                    <SelectTrigger className="h-14 font-black bg-black/40"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="global">Standard Protocol</SelectItem>
                                        <SelectItem value="subject">Subject Specific</SelectItem>
                                        <SelectItem value="urgent">High Priority (Urgent)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleDeploy} disabled={!directiveText.trim()} className="w-full h-16 rounded-[2.5rem] bg-primary font-black uppercase text-lg shadow-xl shadow-primary/20 italic">INITIALIZE BROADCAST <Send className="ml-2 h-5 w-5"/></Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* REWARD MODAL */}
            <Dialog open={!!rewardUser} onOpenChange={() => setRewardUser(null)}>
                <DialogContent className="max-w-md bg-slate-950 border-emerald-500/30 rounded-[2.5rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase italic text-emerald-400">Dispatch Bounty</DialogTitle>
                        <DialogDescription className="font-bold">Protocol: Meritocratic Asset Injection</DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-6">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                            <Avatar className="h-12 w-12 border-2 border-emerald-500/30"><AvatarImage src={rewardUser?.photoURL}/></Avatar>
                            <div><p className="font-black text-lg uppercase tracking-tight">{rewardUser?.displayName}</p><p className="text-[10px] font-bold text-muted-foreground uppercase">{rewardUser?.mindMateId}</p></div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-emerald-500">Bounty Amount (Credits)</Label>
                            <Input type="number" value={rewardAmt} onChange={e => setRewardAmt(Number(e.target.value))} className="h-14 text-3xl font-black text-center bg-black/40 border-emerald-500/20" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-emerald-500">Encouragement Directive</Label>
                            <Input value={rewardMsg} onChange={e => setRewardMsg(e.target.value)} placeholder="e.g. Exceptional Focus session!" className="h-12 bg-black/40" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleReward} className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase shadow-xl shadow-emerald-900/20">AUTHORIZE TRANSFER</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function BadgeIcon({ role }: { role: any }) {
    if (role === 'proctor') return <Crown className="h-3 w-3 text-yellow-500 fill-current" />;
    if (role === 'monitor') return <ShieldCheck className="h-3 w-3 text-primary fill-current" />;
    return <Users className="h-3 w-3 text-slate-400" />;
}
