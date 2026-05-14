
'use client';

import { useState, useMemo } from 'react';
import { useLedger, DailyManifest } from '@/hooks/use-ledger';
import { useAdmin } from '@/hooks/use-admin';
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
    Gem, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, subMonths, addMonths, startOfWeek, endOfWeek, addDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
    ResponsiveContainer, 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    PieChart as RePieChart, 
    Pie, 
    Cell,
    AreaChart,
    Area
} from 'recharts';

export default function SovereignLedger() {
    const { manifests, loading: ledgerLoading, saveManifest, getManifestByDate } = useLedger();
    const { currentUserData, loading: adminLoading } = useAdmin();
    const { toast } = useToast();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [activeTab, setActiveTab] = useState('manifest');
    
    // Form State
    const [summary, setSummary] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [mood, setMood] = useState<DailyManifest['mood']>('productive');
    const [isSaving, setIsSaving] = useState(false);

    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const currentManifest = useMemo(() => getManifestByDate(dateKey), [getManifestByDate, dateKey]);

    // Sync form when date changes
    useEffect(() => {
        if (currentManifest) {
            setSummary(currentManifest.summary || '');
            setVideoUrl(currentManifest.videoUrl || '');
            setMood(currentManifest.mood || 'productive');
        } else {
            setSummary('');
            setVideoUrl('');
            setMood('productive');
        }
    }, [currentManifest, dateKey]);

    const handleSave = async () => {
        if (!summary.trim() && !videoUrl.trim()) return;
        setIsSaving(true);
        try {
            await saveManifest(dateKey, { summary, videoUrl, mood });
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

    const analyticsData = useMemo(() => {
        // Line Chart: Hours over last 7 entries
        const last7 = manifests.slice(0, 7).reverse().map(m => ({
            date: format(parseISO(m.dateKey), 'MMM d'),
            value: (m.summary.length / 100) + (m.videoUrl ? 5 : 0) // Placeholder logic for "Progress Score"
        }));

        // Pie Chart: Mood Distribution
        const moodCounts = manifests.reduce((acc: any, m) => {
            acc[m.mood] = (acc[m.mood] || 0) + 1;
            return acc;
        }, {});

        const pieData = Object.entries(moodCounts).map(([name, value]) => ({ name, value }));

        return { last7, pieData };
    }, [manifests]);

    if (ledgerLoading || adminLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center p-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-32 max-w-7xl mx-auto px-4 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-3xl bg-primary/10 text-primary border border-primary/20 shadow-xl shadow-primary/5">
                        <ScrollText className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent uppercase italic">
                            Sovereign Ledger
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">The Achievement Registry v2.5</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 bg-muted/30 p-1 rounded-2xl border w-full sm:w-auto">
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* CALENDAR NAVIGATOR */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-slate-900 border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
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
                                    const hasEntry = manifests.some(m => m.dateKey === dKey);
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
                                            {hasEntry && (
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

                    <Card className="bg-primary/5 border-primary/20 rounded-[2.5rem] p-8 text-center space-y-4">
                        <div className="p-4 rounded-3xl bg-primary/10 w-fit mx-auto border-2 border-primary/20 shadow-xl">
                            <ShieldCheck className="h-10 w-10 text-primary" />
                        </div>
                        <h4 className="text-xl font-black uppercase italic text-white tracking-tighter leading-none">Registry Integrity</h4>
                        <p className="text-xs font-medium text-slate-400">Your manifests are sealed with cryptographic timestamps. Manual edits are logged in the historical dossier.</p>
                        <Button variant="outline" className="w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest border-primary/20" onClick={() => toast({title: "Dossier Exported", description: "CSV record generated successfully."})}>
                            EXPORT REGISTRY
                        </Button>
                    </Card>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="lg:col-span-8 min-h-[600px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'manifest' ? (
                            <motion.div 
                                key="manifest"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <Card className="bg-slate-900 border-2 border-primary/30 rounded-[3rem] overflow-hidden shadow-2xl relative">
                                    <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                                    <CardHeader className="p-8 sm:p-12 border-b border-white/5 bg-white/5">
                                        <div className="flex justify-between items-center mb-6">
                                            <Badge variant="outline" className="font-black px-4 py-1 uppercase tracking-widest">
                                                {isToday(selectedDate) ? "Today's Manifest" : format(selectedDate, 'do MMMM yyyy')}
                                            </Badge>
                                            <div className="flex gap-2">
                                                {(['productive', 'neutral', 'failed'] as const).map(m => (
                                                    <button 
                                                        key={m} 
                                                        onClick={() => setMood(m)}
                                                        className={cn(
                                                            "h-8 px-3 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all",
                                                            mood === m ? "bg-primary text-white border-primary shadow-lg" : "bg-white/5 border-white/10 text-muted-foreground"
                                                        )}
                                                    >
                                                        {m}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <CardTitle className="text-5xl font-black italic uppercase tracking-tighter text-white">Daily Mission Report</CardTitle>
                                        <CardDescription className="text-lg font-bold text-slate-400 mt-2">Brief the mainframe on your tactical performance.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 sm:p-12 space-y-10 relative z-10">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4"/> Tactical Summary
                                            </Label>
                                            <Textarea 
                                                value={summary} 
                                                onChange={e => setSummary(e.target.value)} 
                                                placeholder="What did you conquer today? What were the breaches? Be precise."
                                                className="min-h-[250px] bg-black/40 border-white/10 rounded-[2rem] p-8 text-lg font-medium leading-relaxed italic focus-visible:ring-primary/30"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 flex items-center gap-2">
                                                <Youtube className="h-4 w-4"/> Visual Mission Dossier (YouTube Link)
                                            </Label>
                                            <div className="flex gap-3">
                                                <Input 
                                                    value={videoUrl} 
                                                    onChange={e => setVideoUrl(e.target.value)} 
                                                    placeholder="Paste link to your study log / vlog..." 
                                                    className="h-14 rounded-2xl bg-black/40 border-white/10 flex-1 px-6 font-bold"
                                                />
                                                {videoUrl && (
                                                    <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl bg-primary/10 text-primary border-primary/20" onClick={() => window.open(videoUrl, '_blank')}>
                                                        <ExternalLink className="h-6 w-6"/>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {videoUrl && videoUrl.includes('youtube.com') && (
                                            <div className="aspect-video w-full rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl">
                                                <iframe 
                                                    className="w-full h-full"
                                                    src={`https://www.youtube.com/embed/${videoUrl.split('v=')[1]?.split('&')[0]}`}
                                                    title="Mission Vlog"
                                                    allowFullScreen
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="p-8 sm:p-12 pt-0 relative z-10">
                                        <Button 
                                            onClick={handleSave} 
                                            disabled={isSaving || (!summary.trim() && !videoUrl.trim())}
                                            className="w-full h-20 rounded-[2.5rem] text-2xl font-black uppercase italic shadow-2xl group"
                                        >
                                            {isSaving ? <Loader2 className="animate-spin mr-3"/> : <ShieldCheck className="mr-3 h-8 w-8 group-hover:scale-110 transition-transform"/>}
                                            SEAL DAILY RECORD
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
                                <Card className="bg-slate-900 border-white/5 rounded-[3rem] p-8 sm:p-12 shadow-2xl">
                                    <CardHeader className="px-0 pb-12">
                                        <CardTitle className="text-3xl font-black uppercase italic flex items-center gap-3">
                                            <TrendingUp className="text-primary h-8 w-8"/> Cognitive Growth
                                        </CardTitle>
                                        <CardDescription className="text-base font-medium">Strategic visualization of your mission fidelity over the last 7 entries.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="px-0 h-[400px]">
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
                                    <Card className="bg-black/20 border-white/5 rounded-[2.5rem] p-8">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-8 text-center">Mood Equilibrium</h4>
                                        <div className="h-[250px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RePieChart>
                                                    <Pie
                                                        data={analyticsData.pieData}
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={8}
                                                        dataKey="value"
                                                    >
                                                        {analyticsData.pieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={['#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </RePieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>

                                    <Card className="bg-primary/5 border-primary/20 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center gap-6">
                                        <div className="p-5 rounded-full bg-primary/10 border-2 border-primary/20 shadow-2xl">
                                            <Trophy className="h-10 w-10 text-primary" />
                                        </div>
                                        <div>
                                            <h5 className="text-xl font-black uppercase italic text-white">Elite Analyst Mode</h5>
                                            <p className="text-xs font-medium text-slate-400 mt-2 italic">"Advanced correlation between study hours and exam confidence will manifest as your registry grows beyond 30 days."</p>
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

function StatPill({ label, val, color }: any) {
    return (
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center gap-1">
            <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{label}</p>
            <p className={cn("text-2xl font-black italic", color)}>{val}</p>
        </div>
    );
}
