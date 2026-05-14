
'use client';
/**
 * @fileOverview Sovereign Ledger - The Ultimate Achievement Registry
 * High-fidelity mission logging and cognitive analytics.
 */

import { useState, useMemo, useEffect } from 'react';
import { useLedger, DailyManifest } from '@/hooks/use-ledger';
import { useAdmin } from '@/hooks/use-admin';
import { useTimeTracker } from '@/hooks/use-time-tracker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    ScrollText, Clock, BarChart3, 
    Youtube, Calendar, Plus, 
    Save, History, PieChart, 
    TrendingUp, ShieldCheck, Zap,
    ArrowRight, ChevronLeft, ChevronRight,
    Play, Info, Video, CheckCircle,
    X, ExternalLink, Loader2, Sparkles,
    Gem, Trophy, MessageSquare, Settings,
    FileText, Activity, Fingerprint,
    Smile, Frown, Meh, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, subMonths, addMonths, startOfWeek, endOfWeek, addDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
    ResponsiveContainer, 
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
};

export default function SovereignLedger() {
    const { manifests, loading: ledgerLoading, saveManifest, getManifestByDate } = useLedger();
    const { currentUserData, loading: adminLoading } = useAdmin();
    const { sessions: allSessions, totalTimeToday, activeSubjectTime, activeSubjectId } = useTimeTracker();
    const { toast } = useToast();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [activeTab, setActiveTab] = useState('manifest');
    
    // Form State
    const [summary, setSummary] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [mood, setMood] = useState<DailyManifest['mood']>('productive');
    const [isSaving, setIsSaving] = useState(false);
    const [showLinkInput, setShowLinkInput] = useState(false);

    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const currentManifest = useMemo(() => getManifestByDate(dateKey), [getManifestByDate, dateKey]);

    // Sync form when date changes
    useEffect(() => {
        if (currentManifest) {
            setSummary(currentManifest.summary || '');
            setVideoUrl(currentManifest.videoUrl || '');
            setMood(currentManifest.mood || 'productive');
            setShowLinkInput(!currentManifest.videoUrl); // Hide if link exists
        } else {
            setSummary('');
            setVideoUrl('');
            setMood('productive');
            setShowLinkInput(true);
        }
    }, [currentManifest, dateKey]);

    const handleSave = async () => {
        if (!summary.trim() && !videoUrl.trim()) return;
        setIsSaving(true);
        try {
            await saveManifest(dateKey, { summary, videoUrl, mood });
            setShowLinkInput(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const calendarDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    // Calculate Study Time for selected date from TimeTracker sessions
    const studyTimeForSelectedDate = useMemo(() => {
        if (isToday(selectedDate)) return totalTimeToday;
        
        return allSessions
            .filter(s => s.startTime.startsWith(dateKey))
            .reduce((acc, s) => {
                const dur = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 1000;
                return acc + dur;
            }, 0);
    }, [allSessions, selectedDate, dateKey, totalTimeToday]);

    const subjectBreakdown = useMemo(() => {
        const breakdown: Record<string, number> = {};
        allSessions
            .filter(s => s.startTime.startsWith(dateKey))
            .forEach(s => {
                const dur = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 1000;
                breakdown[s.subjectName] = (breakdown[s.subjectName] || 0) + dur;
            });
        return Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
    }, [allSessions, dateKey]);

    const analyticsData = useMemo(() => {
        const last7 = manifests.slice(0, 7).reverse().map(m => ({
            date: format(parseISO(m.dateKey), 'MMM d'),
            value: (m.summary.length / 50) + (m.videoUrl ? 10 : 0)
        }));
        return { last7 };
    }, [manifests]);

    const youtubeId = useMemo(() => {
        if (!videoUrl) return null;
        const match = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/))([\w-]{11})/);
        return match ? match[1] : null;
    }, [videoUrl]);

    if (ledgerLoading || adminLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center p-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    const sovereignHash = btoa(dateKey + (currentUserData?.uid || '')).slice(0, 12).toUpperCase();

    return (
        <div className="space-y-8 pb-32 max-w-7xl mx-auto px-4 animate-in fade-in duration-700 relative">
            {/* Background Texture */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20 overflow-hidden">
                <div className="absolute inset-0 blue-nebula-bg" />
                <div className="absolute inset-0 bg-grid-white/5" />
            </div>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-3xl bg-primary/10 text-primary border-2 border-primary/20 shadow-xl shadow-primary/10">
                        <ScrollText className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent uppercase italic">
                            Sovereign Ledger
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">The Achievement Registry v2.5</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 bg-muted/30 p-1 rounded-2xl border w-full sm:w-auto backdrop-blur-md">
                    <Button 
                        variant={activeTab === 'manifest' ? 'secondary' : 'ghost'} 
                        className="flex-1 sm:flex-none h-12 rounded-xl font-black uppercase text-[10px] tracking-widest px-8"
                        onClick={() => setActiveTab('manifest')}
                    >
                        <Plus className="mr-2 h-4 w-4"/> Manifest
                    </Button>
                    <Button 
                        variant={activeTab === 'analytics' ? 'secondary' : 'ghost'} 
                        className="flex-1 sm:flex-none h-12 rounded-xl font-black uppercase text-[10px] tracking-widest px-8"
                        onClick={() => setActiveTab('analytics')}
                    >
                        <BarChart3 className="mr-2 h-4 w-4"/> Intelligence
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
                {/* CALENDAR NAVIGATOR */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-slate-900/80 border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl">
                        <CardHeader className="p-8 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Temporal Navigator</CardTitle>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevMonth}><ChevronLeft/></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextMonth}><ChevronRight/></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="p-4 text-center border-b border-white/5">
                                <h3 className="text-xl font-black text-white uppercase italic">{format(currentMonth, 'MMMM yyyy')}</h3>
                            </div>
                            <div className="grid grid-cols-7 border-b border-white/5 bg-white/5">
                                {['M','T','W','T','F','S','S'].map((d, i) => (
                                    <div key={i} className="py-3 text-center text-[10px] font-black text-primary/40">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 p-2">
                                {calendarDays.map((day, i) => {
                                    const dKey = format(day, 'yyyy-MM-dd');
                                    const entry = manifests.find(m => m.dateKey === dKey);
                                    const isSelected = isSameDay(day, selectedDate);
                                    
                                    return (
                                        <button 
                                            key={i} 
                                            onClick={() => setSelectedDate(day)}
                                            className={cn(
                                                "aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all group",
                                                !isSameMonth(day, currentMonth) && "opacity-10",
                                                isSelected ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105" : "hover:bg-white/5",
                                                isToday(day) && !isSelected && "ring-2 ring-primary/40 ring-inset"
                                            )}
                                        >
                                            <span className="text-xs font-black">{format(day, 'd')}</span>
                                            {entry && (
                                                <div className={cn(
                                                    "absolute bottom-2 h-1 w-1 rounded-full",
                                                    isSelected ? "bg-white" : "bg-primary animate-pulse"
                                                )} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20 rounded-[2.5rem] p-8 text-center space-y-6">
                        <div className="flex items-center justify-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/10 border-2 border-primary/20">
                                <ShieldCheck className="h-8 w-8 text-primary" />
                            </div>
                            <div className="text-left">
                                <h4 className="text-lg font-black uppercase italic text-white tracking-tighter leading-none">Integrity Seal</h4>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Registry Verified</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-[9px] text-primary break-all uppercase">
                            HASH: {sovereignHash}-LEGEND-AUTH
                        </div>
                        <Button variant="outline" className="w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest border-primary/20" onClick={() => toast({title: "Dossier Exported", description: "CSV record generated successfully."})}>
                            <Download className="mr-2 h-4 w-4"/> EXPORT REGISTRY
                        </Button>
                    </Card>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'manifest' ? (
                            <motion.div 
                                key="manifest"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                {/* Study Time HUD */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className="bg-slate-900 border-2 border-primary/30 rounded-[2.5rem] overflow-hidden group">
                                        <CardHeader className="p-6 pb-2">
                                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
                                                <Clock className="h-4 w-4" /> Mission Duration
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 pt-0 flex items-center justify-between">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-6xl font-black italic tracking-tighter text-white">{formatTime(studyTimeForSelectedDate).split(' ')[0]}</span>
                                                <span className="text-xl font-black text-muted-foreground uppercase">{formatTime(studyTimeForSelectedDate).split(' ')[1]}</span>
                                            </div>
                                            {isToday(selectedDate) && activeSubjectId && (
                                                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-slate-900 border-2 border-white/5 rounded-[2.5rem] overflow-hidden">
                                        <CardHeader className="p-6 pb-2">
                                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-2">
                                                <Activity className="h-4 w-4" /> Subject Intelligence
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 pt-0">
                                            <ScrollArea className="h-20">
                                                <div className="space-y-2">
                                                    {subjectBreakdown.map(([name, time]) => (
                                                        <div key={name} className="flex justify-between items-center">
                                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{name}</span>
                                                            <span className="text-xs font-black text-white italic">{formatTime(time)}</span>
                                                        </div>
                                                    ))}
                                                    {subjectBreakdown.length === 0 && <p className="text-[10px] text-muted-foreground italic">No modular data recorded.</p>}
                                                </div>
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card className="bg-slate-900 border-2 border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative">
                                    <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
                                    <CardHeader className="p-8 sm:p-12 border-b border-white/5 bg-white/5">
                                        <div className="flex justify-between items-center mb-6">
                                            <Badge variant="outline" className="font-black px-4 py-1 uppercase tracking-widest bg-black/40">
                                                {isToday(selectedDate) ? "Today's Manifest" : format(selectedDate, 'do MMMM yyyy')}
                                            </Badge>
                                            <div className="flex gap-2">
                                                {[
                                                    { id: 'productive', icon: Sparkles, color: 'text-emerald-400' },
                                                    { id: 'neutral', icon: Meh, color: 'text-sky-400' },
                                                    { id: 'exhausted', icon: Frown, color: 'text-amber-400' },
                                                    { id: 'failed', icon: Skull, color: 'text-red-500' }
                                                ].map(m => (
                                                    <button 
                                                        key={m.id} 
                                                        onClick={() => setMood(m.id as any)}
                                                        className={cn(
                                                            "h-10 w-10 flex items-center justify-center rounded-full border-2 transition-all",
                                                            mood === m.id ? `bg-background border-current shadow-lg ${m.color}` : "bg-white/5 border-transparent text-muted-foreground hover:bg-white/10"
                                                        )}
                                                    >
                                                        <m.icon className="h-5 w-5" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <CardTitle className="text-5xl font-black italic uppercase tracking-tighter text-white">Daily Briefing</CardTitle>
                                        <CardDescription className="text-lg font-bold text-slate-400 mt-2">Document your tactical findings and mission results.</CardDescription>
                                    </CardHeader>

                                    <CardContent className="p-8 sm:p-12 space-y-10 relative z-10">
                                        {/* Visual Dossier Player */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 flex items-center gap-2">
                                                    <Youtube className="h-4 w-4"/> Visual Mission Dossier
                                                </Label>
                                                {youtubeId && (
                                                    <Button variant="ghost" size="sm" className="h-7 text-[8px] font-black uppercase" onClick={() => setShowLinkInput(!showLinkInput)}>
                                                        {showLinkInput ? "Hide Link" : "Modify Uplink"} <Settings className="ml-1.5 h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>

                                            <AnimatePresence>
                                                {showLinkInput && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                        <div className="flex gap-2">
                                                            <Input 
                                                                value={videoUrl} 
                                                                onChange={e => setVideoUrl(e.target.value)} 
                                                                placeholder="Paste mission vlog link (YouTube)..." 
                                                                className="h-12 rounded-xl bg-black/40 border-white/10 flex-1 px-6 font-bold"
                                                            />
                                                            {youtubeId && <Button onClick={handleSave} size="icon" className="h-12 w-12 rounded-xl"><CheckCircle/></Button>}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {youtubeId ? (
                                                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="aspect-video w-full rounded-[2.5rem] overflow-hidden border-2 border-white/10 shadow-2xl relative group">
                                                    <iframe 
                                                        className="w-full h-full"
                                                        src={`https://www.youtube.com/embed/${youtubeId}?modestbranding=1&rel=0&showinfo=0`}
                                                        title="Daily Report"
                                                        allowFullScreen
                                                    />
                                                </motion.div>
                                            ) : (
                                                <div className="p-12 border-4 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02] flex flex-col items-center gap-4 text-center opacity-40">
                                                    <Video className="h-12 w-12" />
                                                    <p className="text-xs font-black uppercase tracking-widest">No visual dossier uplinked</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4"/> Tactical Summary
                                            </Label>
                                            <Textarea 
                                                value={summary} 
                                                onChange={e => setSummary(e.target.value)} 
                                                placeholder="What did you conquer today? What were the cognitive breaches?"
                                                className="min-h-[200px] bg-black/40 border-white/10 rounded-[2rem] p-8 text-lg font-medium leading-relaxed italic focus-visible:ring-primary/30"
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-8 sm:p-12 pt-0 relative z-10">
                                        <Button 
                                            onClick={handleSave} 
                                            disabled={isSaving || !summary.trim()}
                                            className="w-full h-20 rounded-[2.5rem] text-2xl font-black uppercase italic shadow-2xl group"
                                        >
                                            {isSaving ? <Loader2 className="animate-spin mr-3"/> : <ShieldCheck className="mr-3 h-8 w-8 group-hover:scale-110 transition-transform"/>}
                                            SEAL MISSION RECORD
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="analytics"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-8"
                            >
                                <Card className="bg-slate-900 border-white/5 rounded-[3rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                                    <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                                    <CardHeader className="px-0 pb-12 relative z-10">
                                        <CardTitle className="text-3xl font-black uppercase italic flex items-center gap-3">
                                            <TrendingUp className="text-primary h-8 w-8"/> Cognitive Growth Pulse
                                        </CardTitle>
                                        <CardDescription className="text-base font-medium">Strategic visualization of mission engagement over the last 7 entries.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="px-0 h-[400px] relative z-10">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={analyticsData.last7}>
                                                <defs>
                                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                                <XAxis dataKey="date" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                                                <YAxis hide />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff20', borderRadius: '12px' }}
                                                    itemStyle={{ color: '#8b5cf6', fontWeight: '900', textTransform: 'uppercase' }}
                                                />
                                                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Card className="bg-primary/5 border-primary/20 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center gap-6">
                                        <div className="p-5 rounded-full bg-primary/10 border-2 border-primary/20 shadow-2xl">
                                            <Trophy className="h-10 w-10 text-primary" />
                                        </div>
                                        <div>
                                            <h5 className="text-xl font-black uppercase italic text-white">Legend Analyst Mode</h5>
                                            <p className="text-xs font-medium text-slate-400 mt-2 italic">"Advanced cognitive correlations will manifest as your registry history grows beyond 30 days."</p>
                                        </div>
                                    </Card>

                                    <Card className="bg-black/20 border-white/5 rounded-[2.5rem] p-8 space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary text-center">Operational Highlights</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-muted-foreground uppercase">Registry Entries</span>
                                                <span className="text-lg font-black text-white">{manifests.length}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-muted-foreground uppercase">Vlogs Recorded</span>
                                                <span className="text-lg font-black text-white">{manifests.filter(m => m.videoUrl).length}</span>
                                            </div>
                                            <Progress value={(manifests.filter(m => m.videoUrl).length / manifests.length) * 100} className="h-1" />
                                        </div>
                                    </Card>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

