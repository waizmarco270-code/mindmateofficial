'use client';
import { useState, useMemo } from 'react';
import { Roadmap, RoadmapCategory, RoadmapTask } from '@/hooks/use-roadmaps';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, PlusCircle, ArrowLeft, ArrowRight, CheckCircle, Palette, Book, Sparkles, ChevronRight, X, FlaskConical, Sigma, Rocket, Brain, GraduationCap } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import syllabusData from '@/app/lib/syllabus-data.json';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface TaskPlannerProps {
    roadmap: Roadmap;
    onComplete: (milestones: Roadmap['milestones']) => void;
    onCancel: () => void;
}

const categoryColors = [
    '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899'
];

export function TaskPlanner({ roadmap, onComplete, onCancel }: TaskPlannerProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [milestones, setMilestones] = useState<Roadmap['milestones']>(roadmap.milestones || []);
    const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
    const [activeTargetDay, setActiveTargetDay] = useState<number | null>(null);
    const [selectedExam, setSelectedExam] = useState<string>('jee');

    const totalPages = Math.ceil(roadmap.duration / 7);
    const startDay = (currentPage - 1) * 7 + 1;
    const endDay = Math.min(currentPage * 7, roadmap.duration);
    
    const getMilestoneForDay = (day: number) => milestones.find(m => m.day === day);
    
    const updateMilestone = (day: number, newCategories: RoadmapCategory[]) => {
        const existingMilestoneIndex = milestones.findIndex(m => m.day === day);
        if (existingMilestoneIndex > -1) {
            const newMilestones = [...milestones];
            newMilestones[existingMilestoneIndex].categories = newCategories;
            setMilestones(newMilestones);
        } else {
            setMilestones([...milestones, { day, categories: newCategories }]);
        }
    };

    const addCategory = (day: number) => {
        const dayMilestone = getMilestoneForDay(day);
        const newCategories = [...(dayMilestone?.categories || [])];
        newCategories.push({
            id: `cat-${Date.now()}`,
            title: 'New Subject',
            color: categoryColors[Math.floor(Math.random() * categoryColors.length)],
            tasks: [{ id: `task-${Date.now()}`, text: '', completed: false }]
        });
        updateMilestone(day, newCategories);
    };

    const updateCategoryField = (day: number, catIndex: number, field: 'title' | 'color', value: string) => {
        const dayMilestone = getMilestoneForDay(day);
        if(!dayMilestone) return;
        const newCategories = [...dayMilestone.categories];
        (newCategories[catIndex] as any)[field] = value;
        updateMilestone(day, newCategories);
    };

    const removeCategory = (day: number, catIndex: number) => {
        const dayMilestone = getMilestoneForDay(day);
        if(!dayMilestone) return;
        const newCategories = dayMilestone.categories.filter((_, i) => i !== catIndex);
        updateMilestone(day, newCategories);
    };

    const addTask = (day: number, catIndex: number, initialText: string = '') => {
        const dayMilestone = getMilestoneForDay(day);
        if(!dayMilestone) return;
        const newCategories = [...dayMilestone.categories];
        newCategories[catIndex].tasks.push({ id: `task-${Date.now()}-${Math.random()}`, text: initialText, completed: false });
        updateMilestone(day, newCategories);
    };
    
    const handleTaskChange = (day: number, catIndex: number, taskIndex: number, text: string) => {
        const dayMilestone = getMilestoneForDay(day);
        if(!dayMilestone) return;
        const newCategories = [...dayMilestone.categories];
        newCategories[catIndex].tasks[taskIndex].text = text;
        updateMilestone(day, newCategories);
    };

    const removeTask = (day: number, catIndex: number, taskIndex: number) => {
        const dayMilestone = getMilestoneForDay(day);
        if(!dayMilestone) return;
        const newCategories = [...dayMilestone.categories];
        newCategories[catIndex].tasks.splice(taskIndex, 1);
        updateMilestone(day, newCategories);
    };

    const injectChapter = (chapter: string) => {
        if (activeTargetDay === null) return;
        
        const dayMilestone = getMilestoneForDay(activeTargetDay);
        if (!dayMilestone || dayMilestone.categories.length === 0) {
            // Auto-create category if none exist
            const newCategories: RoadmapCategory[] = [{
                id: `cat-${Date.now()}`,
                title: 'Imported Tasks',
                color: '#8b5cf6',
                tasks: [{ id: `task-${Date.now()}`, text: `Study: ${chapter}`, completed: false }]
            }];
            updateMilestone(activeTargetDay, newCategories);
        } else {
            // Inject into the first category for simplicity, or we could add a picker
            addTask(activeTargetDay, 0, `Study: ${chapter}`);
        }
        setIsSyllabusOpen(false);
    };

    return (
        <div className="space-y-8 pb-40 animate-in fade-in duration-700">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">Strategic Planner</h1>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.3em]">Protocol: Mission Deployment v2.5</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={onCancel} className="font-bold text-xs uppercase tracking-widest text-slate-500">Abort Calibration</Button>
                    <Button onClick={() => onComplete(milestones)} className="h-14 px-10 rounded-2xl font-black uppercase italic shadow-xl shadow-primary/20">
                        COMMIT PLAN <CheckCircle className="ml-2 h-5 w-5"/>
                    </Button>
                </div>
            </header>
            
            <Card className="max-w-full mx-auto bg-black/20 border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                <CardHeader className="border-b border-white/5 bg-white/5 p-8 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black uppercase italic">Deployment Range: Days {startDay} — {endDay}</CardTitle>
                        <CardDescription className="font-bold uppercase text-[9px] tracking-widest text-primary">AUTHORIZED REGISTRY • PAGE {currentPage} / {totalPages}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-white/10" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><ArrowLeft/></Button>
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-white/10" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}><ArrowRight/></Button>
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                             {Array.from({ length: endDay - startDay + 1 }).map((_, i) => {
                                const day = startDay + i;
                                const dayMilestone = getMilestoneForDay(day);
                                const dayCategories = dayMilestone?.categories || [];
                                
                                return (
                                    <div key={day} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 space-y-6 flex flex-col h-full group hover:border-primary/30 transition-all shadow-inner">
                                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary italic">Phase {day}</h4>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/20 text-primary" onClick={() => addCategory(day)}>
                                                <PlusCircle className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                        
                                        <div className="space-y-6 flex-1">
                                            {dayCategories.map((cat, catIndex) => (
                                                <div key={cat.id} className="space-y-4">
                                                    <div className="flex items-center justify-between group/cat">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: cat.color }} />
                                                            <Input 
                                                                value={cat.title} 
                                                                onChange={e => updateCategoryField(day, catIndex, 'title', e.target.value)}
                                                                className="h-8 border-none bg-transparent font-black uppercase text-[10px] tracking-widest p-0 focus-visible:ring-0"
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover/cat:opacity-100 transition-opacity">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"><Palette className="h-3.5 w-3.5"/></button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent className="p-2 grid grid-cols-4 gap-1 min-w-0">
                                                                    {categoryColors.map(c => <button key={c} style={{backgroundColor: c}} className="h-5 w-5 rounded-full" onClick={() => updateCategoryField(day, catIndex, 'color', c)} />)}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                            <button className="h-6 w-6 flex items-center justify-center text-red-500/50 hover:text-red-500 transition-colors" onClick={() => removeCategory(day, catIndex)}><X className="h-3.5 w-3.5"/></button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 pl-3">
                                                        {cat.tasks.map((task, taskIndex) => (
                                                            <div key={task.id} className="flex items-center gap-2 group/task">
                                                                <Input 
                                                                    value={task.text} 
                                                                    onChange={e => handleTaskChange(day, catIndex, taskIndex, e.target.value)}
                                                                    placeholder="Mission task..."
                                                                    className="h-10 text-xs bg-black/30 border-white/5 rounded-xl font-medium"
                                                                />
                                                                <button className="h-8 w-8 flex items-center justify-center text-red-500/20 group-hover/task:text-red-500 transition-colors" onClick={() => removeTask(day, catIndex, taskIndex)}><Trash2 className="h-3.5 w-3.5"/></button>
                                                            </div>
                                                        ))}
                                                        <div className="flex gap-2 pt-1">
                                                            <Button variant="ghost" size="sm" className="h-8 rounded-xl font-black uppercase text-[8px] tracking-widest bg-primary/10 text-primary hover:bg-primary/20" onClick={() => addTask(day, catIndex)}>
                                                                <PlusCircle className="mr-1.5 h-3 w-3"/> Task
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="h-8 rounded-xl font-black uppercase text-[8px] tracking-widest bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20" onClick={() => { setActiveTargetDay(day); setIsSyllabusOpen(true); }}>
                                                                <Book className="mr-1.5 h-3 w-3"/> Syllabus
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {dayCategories.length === 0 && (
                                                <div className="py-10 text-center opacity-20 border-2 border-dashed border-white/10 rounded-[1.5rem]">
                                                    <Sparkles className="h-6 w-6 mx-auto mb-2" />
                                                    <p className="text-[8px] font-black uppercase tracking-widest leading-relaxed">No Sprints Initialized <br/> for this phase</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                             })}
                        </motion.div>
                    </AnimatePresence>
                </CardContent>
            </Card>

            <Dialog open={isSyllabusOpen} onOpenChange={setIsSyllabusOpen}>
                <DialogContent className="max-w-3xl bg-background/95 backdrop-blur-3xl border-primary/20 rounded-[3rem] p-0 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b bg-primary/5 flex items-center justify-between">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black uppercase italic text-primary flex items-center gap-3">
                                <Book className="h-8 w-8"/> Syllabus Registry
                            </DialogTitle>
                            <DialogDescription className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Protocol: Direct Core Ingress (Day {activeTargetDay})</DialogDescription>
                        </DialogHeader>
                        <Select value={selectedExam} onValueChange={setSelectedExam}>
                            <SelectTrigger className="w-48 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="jee">JEE Mains</SelectItem>
                                <SelectItem value="neet">NEET</SelectItem>
                                <SelectItem value="class12">12th Boards</SelectItem>
                                <SelectItem value="class10">10th Boards</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <ScrollArea className="h-[500px]">
                        <div className="p-8 space-y-10">
                            {Object.entries((syllabusData as any)[selectedExam] || {}).map(([subject, chapters]: [string, any]) => (
                                <section key={subject} className="space-y-4">
                                    <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                                        <div className="p-1.5 rounded-lg bg-primary/20 text-primary"><Rocket className="h-4 w-4"/></div>
                                        <h4 className="text-sm font-black uppercase tracking-widest italic">{subject}</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {chapters.map((item: any, idx: number) => (
                                            <button 
                                                key={idx} 
                                                onClick={() => injectChapter(item.chapter)}
                                                className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/40 transition-all text-left group shadow-inner"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate pr-2">{item.chapter}</p>
                                                    <Badge variant="outline" className={cn(
                                                        "mt-1 text-[8px] font-black uppercase border-none px-0",
                                                        item.importance === 'high' ? 'text-red-500' : item.importance === 'medium' ? 'text-blue-500' : 'text-green-500'
                                                    )}>
                                                        {item.importance} PRIORITY
                                                    </Badge>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </ScrollArea>
                    <DialogFooter className="p-6 bg-muted/20 border-t">
                        <DialogClose asChild><Button variant="ghost" className="w-full font-black uppercase tracking-widest">Close Registry</Button></DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
