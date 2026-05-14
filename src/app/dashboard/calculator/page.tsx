'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    Trash2, Plus, Percent, Sparkles, 
    AlertTriangle, Medal, Award, Crown, 
    Star, CheckCircle, Upload, FileText, 
    Zap, Loader2, Search, X, 
    ShieldCheck, Microscope
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, SignedIn, SignedOut } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { Separator } from '@/components/ui/separator';
import { LoginWall } from '@/components/ui/login-wall';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import * as Tesseract from 'tesseract.js';

interface Subject {
  id: number;
  name: string;
  marks: string;
  isCompulsory: boolean;
}

interface Rank {
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
}

type TemplateType = 'class12' | 'class10' | 'custom';

const TEMPLATES: Record<TemplateType, Subject[]> = {
    class12: [
        { id: 1, name: 'English', marks: '', isCompulsory: true },
        { id: 2, name: 'Physics', marks: '', isCompulsory: false },
        { id: 3, name: 'Chemistry', marks: '', isCompulsory: false },
        { id: 4, name: 'Maths', marks: '', isCompulsory: false },
        { id: 5, name: 'PHE', marks: '', isCompulsory: false },
    ],
    class10: [
        { id: 1, name: 'English', marks: '', isCompulsory: true },
        { id: 2, name: 'Hindi', marks: '', isCompulsory: false },
        { id: 3, name: 'Maths', marks: '', isCompulsory: false },
        { id: 4, name: 'Science', marks: '', isCompulsory: false },
        { id: 5, name: 'Social Science', marks: '', isCompulsory: false },
        { id: 6, name: 'IT', marks: '', isCompulsory: false },
    ],
    custom: [
        { id: 1, name: '', marks: '', isCompulsory: false },
        { id: 2, name: '', marks: '', isCompulsory: false },
        { id: 3, name: '', marks: '', isCompulsory: false },
        { id: 4, name: '', marks: '', isCompulsory: false },
        { id: 5, name: '', marks: '', isCompulsory: false },
    ],
};

const SUBJECT_KEYWORDS = [
    'ENGLISH', 'PHYSICS', 'CHEMISTRY', 'MATHEMATICS', 'MATHS', 'BIOLOGY', 'HINDI', 
    'SANSKRIT', 'COMPUTER SCIENCE', 'INFORMATICS', 'HISTORY', 'GEOGRAPHY', 'CIVICS', 
    'ECONOMICS', 'POLITICAL SCIENCE', 'ACCOUNTANCY', 'BUSINESS STUDIES', 'SOCIOLOGY', 
    'PSYCHOLOGY', 'PHYSICAL EDUCATION', 'PHE', 'PAINTING', 'DANCE', 'MUSIC', 'IT', 'AI'
];

const CALCULATION_COST = 2;
const SCAN_COST = 10;

const getRank = (percentage: number): Rank => {
    if (percentage >= 98) return { title: "The Scholar", description: "Absolutely phenomenal! A truly exceptional score.", icon: Crown, color: "text-yellow-400" };
    if (percentage >= 95) return { title: "Elite Achiever", description: "Outstanding performance! You're in the top tier.", icon: Award, color: "text-purple-400" };
    if (percentage >= 90) return { title: "High Distinction", description: "Excellent work! A truly impressive result.", icon: Star, color: "text-blue-400" };
    if (percentage >= 85) return { title: "Distinction", description: "Great job! You've clearly mastered the material.", icon: CheckCircle, color: "text-green-500" };
    if (percentage >= 80) return { title: "First Class", description: "A very strong performance. Well done!", icon: CheckCircle, color: "text-green-500/80" };
    if (percentage >= 70) return { title: "Very Good", description: "A solid result. Keep up the good work!", icon: Medal, color: "text-muted-foreground" };
    return { title: "Good Effort", description: "A respectable score. Keep pushing forward!", icon: Medal, color: "text-muted-foreground" };
}

export default function PercentageCalculatorPage() {
  const { user } = useUser();
  const { currentUserData, addCreditsToUser } = useUsers();
  const { toast } = useToast();

  const [template, setTemplate] = useState<TemplateType>('class12');
  const [subjects, setSubjects] = useState<Subject[]>(TEMPLATES['class12']);
  const [result, setResult] = useState<{ percentage: number; bestSubjects: Subject[] } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSubjects(TEMPLATES[template]);
    setResult(null);
  }, [template]);

  const handleSubjectChange = (id: number, field: keyof Subject, value: string | boolean) => {
    setSubjects(
      subjects.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const addSubject = () => {
    if (template !== 'custom') setTemplate('custom');
    setSubjects([...subjects, { id: Date.now(), name: '', marks: '', isCompulsory: false }]);
  };

  const removeSubject = (id: number) => {
    if (subjects.length > 2) {
      if (template !== 'custom') setTemplate('custom');
      setSubjects(subjects.filter((s) => s.id !== id));
    } else {
        toast({ variant: 'destructive', title: 'Minimum Subjects', description: 'You need at least 2 subjects to calculate.'});
    }
  };

  const handleCalculate = () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Sign In Required', description: `You need to sign in to perform calculations.`});
        return;
    }
    
    const hasMaster = currentUserData?.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();
    if (!hasMaster && (currentUserData?.credits ?? 0) < CALCULATION_COST) {
        toast({ variant: 'destructive', title: 'Insufficient Credits', description: `You need ${CALCULATION_COST} credits to perform this calculation.`});
        return;
    }

    const validSubjects = subjects.filter(s => s.name.trim() !== '' && s.marks.trim() !== '' && !isNaN(parseFloat(s.marks)) && parseFloat(s.marks) >= 0 && parseFloat(s.marks) <= 100);

    if (validSubjects.length < 5) {
      toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please provide at least 5 valid subjects with marks between 0 and 100.' });
      return;
    }
    
    setIsCalculating(true);

    const compulsorySubjects = validSubjects.filter(s => s.isCompulsory);
    const optionalSubjects = validSubjects.filter(s => !s.isCompulsory);

    optionalSubjects.sort((a, b) => parseFloat(b.marks) - parseFloat(a.marks));
    
    const neededOptionals = 5 - compulsorySubjects.length;
    
    if (neededOptionals < 0) {
        toast({ variant: 'destructive', title: 'Too Many Compulsory Subjects', description: 'You can have a maximum of 5 compulsory subjects.' });
        setIsCalculating(false);
        return;
    }

    const bestOptionalSubjects = optionalSubjects.slice(0, neededOptionals);
    const bestSubjects = [...compulsorySubjects, ...bestOptionalSubjects];
    
    const totalMarks = bestSubjects.reduce((acc, s) => acc + parseFloat(s.marks), 0);
    const percentage = (totalMarks / (5 * 100)) * 100;
    
    setResult({ percentage, bestSubjects });
    if (!hasMaster) addCreditsToUser(user.id, -CALCULATION_COST);
    toast({ title: 'Calculation Successful!', description: `${CALCULATION_COST} credits have been deducted.` });
    
    setIsCalculating(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const hasMaster = currentUserData?.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();
    if (!hasMaster && (currentUserData?.credits ?? 0) < SCAN_COST) {
        toast({ variant: 'destructive', title: 'Insufficient Credits', description: `Scanning requires ${SCAN_COST} credits.` });
        return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setIsScanDialogOpen(true);

    try {
        // Tesseract local OCR protocol
        const worker = await Tesseract.createWorker({
            logger: m => {
                if (m.status === 'recognizing text') setScanProgress(Math.floor(m.progress * 100));
            }
        });

        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        
        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();

        // HEURISTIC PARSING PROTOCOL (Non-AI)
        const lines = text.toUpperCase().split('\n');
        const detectedSubjects: Subject[] = [];
        
        lines.forEach((line, index) => {
            SUBJECT_KEYWORDS.forEach(keyword => {
                if (line.includes(keyword)) {
                    // Look for numbers following the keyword
                    const scoreMatch = line.match(/\b([3-9]\d|100)\b/); 
                    if (scoreMatch) {
                        detectedSubjects.push({
                            id: Date.now() + index + Math.random(),
                            name: keyword.charAt(0) + keyword.slice(1).toLowerCase(),
                            marks: scoreMatch[0],
                            isCompulsory: keyword === 'ENGLISH'
                        });
                    }
                }
            });
        });

        if (detectedSubjects.length > 0) {
            setTemplate('custom');
            setSubjects(detectedSubjects);
            if (!hasMaster) addCreditsToUser(user.id, -SCAN_COST);
            toast({ title: "Signal Decoded!", description: `Injected ${detectedSubjects.length} subjects into the form.` });
        } else {
            toast({ variant: 'destructive', title: "Detection Failed", description: "The mainframe could not find valid patterns in your marksheet." });
        }

    } catch (err) {
        toast({ variant: 'destructive', title: "Scanner Error", description: "Temporal breach in the scanning drive." });
    } finally {
        setIsScanning(false);
        setIsScanDialogOpen(false);
    }
  };
  
  const resultRank = result ? getRank(result.percentage) : null;

  return (
    <div className="space-y-8 pb-32">
       <div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-3">
            <Percent className="text-primary h-10 w-10"/> Percentage Calculator
        </h1>
        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.3em] ml-1">Sovereign Results v2.5</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
        <SignedOut>
            <LoginWall title="Sign In to Use Calculator" description="Create a free account to use the percentage calculator and other powerful study tools." className="lg:col-span-3"/>
        </SignedOut>
        <SignedIn>
        <div className="lg:col-span-2 space-y-6">
            <Card className="relative overflow-hidden bg-slate-900 border-primary/20 shadow-2xl rounded-[2.5rem]">
                <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                <CardHeader className="relative z-10 p-8 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black uppercase italic text-white flex items-center gap-3">
                            <Zap className="h-5 w-5 text-primary"/> Manual Ingress
                        </CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Enter values for Best of 5 Logic</CardDescription>
                    </div>
                    <Tabs value={template} onValueChange={(v) => setTemplate(v as TemplateType)} className="w-auto bg-black/40 p-1 rounded-xl border border-white/10">
                        <TabsList className="bg-transparent h-9 gap-1">
                            <TabsTrigger value="class12" className="text-[10px] font-black uppercase rounded-lg">12th</TabsTrigger>
                            <TabsTrigger value="class10" className="text-[10px] font-black uppercase rounded-lg">10th</TabsTrigger>
                            <TabsTrigger value="custom" className="text-[10px] font-black uppercase rounded-lg">Manual</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent className="relative z-10 p-8 space-y-4">
                    {subjects.map((subject, index) => (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={subject.id} className="grid grid-cols-12 items-center gap-x-4 gap-y-2 p-3 rounded-2xl bg-black/20 border border-white/5 group hover:border-primary/20 transition-all">
                            <div className="col-span-12 sm:col-span-5">
                                <Label className="text-[9px] font-black uppercase text-muted-foreground mb-1 ml-1 block">Subject Identity</Label>
                                <Input
                                    value={subject.name}
                                    onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                                    disabled={template !== 'custom' || subject.name === 'English'}
                                    className="h-11 bg-black/40 border-white/10 font-bold"
                                />
                            </div>
                            <div className="col-span-5 sm:col-span-3">
                                <Label className="text-[9px] font-black uppercase text-muted-foreground mb-1 ml-1 block">Score</Label>
                                <Input
                                    type="number"
                                    value={subject.marks}
                                    onChange={(e) => handleSubjectChange(subject.id, 'marks', e.target.value)}
                                    min="0"
                                    max="100"
                                    className="h-11 bg-black/40 border-white/10 font-black text-primary"
                                />
                            </div>
                            <div className="col-span-5 sm:col-span-3 flex items-center justify-center pt-5">
                                 <Checkbox
                                    id={`compulsory-${subject.id}`}
                                    checked={subject.isCompulsory}
                                    onCheckedChange={(checked) => handleSubjectChange(subject.id, 'isCompulsory', Boolean(checked))}
                                    disabled={template !== 'custom' || subject.name === 'English'}
                                    className="border-white/20 data-[state=checked]:bg-primary"
                                />
                                <Label htmlFor={`compulsory-${subject.id}`} className="text-[9px] font-black uppercase text-muted-foreground ml-2">Compulsory</Label>
                            </div>
                            <div className="col-span-2 sm:col-span-1 flex justify-end pt-5">
                                {!(template !== 'custom' || subject.name === 'English') && (
                                    <Button variant="ghost" size="icon" onClick={() => removeSubject(subject.id)} className="h-9 w-9 text-red-500/40 hover:text-red-500 hover:bg-red-500/10">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    <div className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-4">
                         <Button variant="outline" onClick={addSubject} className="h-12 rounded-xl font-black uppercase text-[10px] tracking-widest border-white/10 bg-white/5">
                            <Plus className="mr-2 h-4 w-4" /> ADD SUBJECT
                        </Button>
                        <Button onClick={handleCalculate} disabled={isCalculating} className="h-14 px-10 rounded-2xl font-black uppercase italic shadow-xl shadow-primary/20">
                            <Percent className="mr-3 h-5 w-5" /> {isCalculating ? 'DECRYPTING...' : 'CALCULATE BEST OF 5'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* THE TACTICAL SCANNER MODULE */}
            <Card className="relative overflow-hidden bg-emerald-500/5 border-2 border-emerald-500/20 rounded-[2.5rem] p-8 sm:p-12 text-center space-y-6 group">
                <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
                <div className="relative z-10 space-y-4">
                    <div className="mx-auto w-20 h-20 rounded-[2rem] bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                        <Microscope className="h-10 w-10 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">Tactical Scanner</h3>
                        <p className="text-sm text-slate-400 font-medium italic mt-1">"Why type when the mainframe can perceive?"</p>
                    </div>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        Upload a photo or digital PDF of your marksheet. The system will decode the signal and fetch your results using heuristic pattern matching.
                    </p>
                </div>
                <div className="relative z-10 pt-4 flex flex-col items-center gap-4">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,.pdf" className="hidden" />
                    <Button 
                        size="lg" 
                        onClick={() => fileInputRef.current?.click()}
                        className="h-16 px-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase italic shadow-2xl shadow-emerald-900/20"
                    >
                        <Upload className="mr-3 h-6 w-6"/> INITIALIZE SCAN (-10 CR)
                    </Button>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60 flex items-center gap-2">
                        <ShieldCheck className="h-3 w-3" /> ZERO-AI GUARANTEE • 100% SECURE
                    </p>
                </div>
            </Card>
        </div>
        
        <div className="lg:col-span-1 space-y-8">
            <Card className="border-primary/20 shadow-2xl shadow-primary/10 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5 bg-primary/5">
                    <CardTitle className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.3em] text-primary">
                        <Sparkles className="h-5 w-5 animate-pulse"/> DECODED RESULT
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <AnimatePresence mode="wait">
                        {result ? (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 text-center">
                               <div>
                                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Calculated Standing</p>
                                   <p className="text-8xl font-black tracking-tighter text-white italic drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]">{result.percentage.toFixed(2)}%</p>
                               </div>
                               <Separator className="bg-white/5"/>
                               <div className="space-y-4">
                                   <p className="text-[10px] font-black uppercase text-left tracking-widest text-primary">Mission Assets (Best of 5):</p>
                                   <div className="grid gap-2">
                                       {result.bestSubjects.map(s => (
                                           <div key={s.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 group hover:bg-primary/5 transition-all">
                                               <span className="text-xs font-black uppercase text-slate-300 italic truncate pr-4">{s.name}</span>
                                               <span className="font-mono font-black text-lg text-primary">{s.marks}</span>
                                            </div>
                                       ))}
                                   </div>
                               </div>
                            </motion.div>
                        ) : (
                            <div className="text-center py-20 opacity-20">
                                <Search className="h-16 w-16 mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Awaiting input signal... <br/> Decryption idle</p>
                            </div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            <AnimatePresence>
            {resultRank && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay: 0.2}}>
                     <Card className="border-primary/20 bg-primary/5 rounded-[2.5rem] p-8 text-center overflow-hidden relative">
                        <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                        <resultRank.icon className={cn("h-16 w-16 mx-auto mb-4", resultRank.color, resultRank.icon === Crown && "animate-gold-shine")} />
                        <CardTitle className={cn("text-3xl font-black uppercase italic tracking-tighter", resultRank.color)}>{resultRank.title}</CardTitle>
                        <CardDescription className="text-slate-400 font-medium mt-2 leading-relaxed">{resultRank.description}</CardDescription>
                    </Card>
                </motion.div>
            )}
            </AnimatePresence>

             <Card className="bg-black/20 border-white/5 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registry Liquidity</p>
                    <Medal className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black italic">{currentUserData?.credits ?? 0}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">CR</span>
                </div>
            </Card>
        </div>
        </SignedIn>
      </div>

      <Dialog open={isScanDialogOpen} onOpenChange={(o) => !isScanning && setIsScanDialogOpen(o)}>
          <DialogContent className="max-w-md bg-slate-950 border-emerald-500/30 rounded-[3rem] p-8 overflow-hidden text-center space-y-8">
              <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
              {/* SCANNING ANIMATION */}
              <div className="relative mx-auto w-32 h-48 border-2 border-emerald-500/20 bg-black/40 rounded-xl overflow-hidden shadow-inner">
                  <motion.div 
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_#10b981] z-20"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <FileText className="h-20 w-20 text-emerald-500" />
                  </div>
              </div>

              <div className="space-y-2 relative z-10">
                  <h3 className="text-2xl font-black uppercase italic text-emerald-500 tracking-tighter">DECODING SIGNAL</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Heuristic Pattern Extraction in Progress</p>
              </div>

              <div className="space-y-3 relative z-10">
                  <Progress value={scanProgress} className="h-1.5 bg-white/5" indicatorClassName="bg-emerald-500" />
                  <p className="text-[10px] font-black font-mono text-emerald-500 tabular-nums">{scanProgress}% COMPLETE</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[9px] font-medium italic text-slate-500">
                  "Parsing registry headers, identifying numerical markers, and authorizing subject mapping..."
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}