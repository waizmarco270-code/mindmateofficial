
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, Percent, Sparkles, AlertTriangle, Medal, Award, Crown, Star, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, SignedIn, SignedOut } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { Separator } from '@/components/ui/separator';
import { LoginWall } from '@/components/ui/login-wall';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';


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

const CALCULATION_COST = 2;

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
  const { user, isSignedIn } = useUser();
  const { currentUserData, addCreditsToUser } = useUsers();
  const { toast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([
    { id: 1, name: 'English', marks: '', isCompulsory: true },
    { id: 2, name: '', marks: '', isCompulsory: false },
    { id: 3, name: '', marks: '', isCompulsory: false },
    { id: 4, name: '', marks: '', isCompulsory: false },
    { id: 5, name: '', marks: '', isCompulsory: false },
  ]);
  const [result, setResult] = useState<{ percentage: number; bestSubjects: Subject[] } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleSubjectChange = (id: number, field: keyof Subject, value: string | boolean) => {
    setSubjects(
      subjects.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const addSubject = () => {
    setSubjects([...subjects, { id: Date.now(), name: '', marks: '', isCompulsory: false }]);
  };

  const removeSubject = (id: number) => {
    if (subjects.length > 2) {
      setSubjects(subjects.filter((s) => s.id !== id));
    } else {
        toast({ variant: 'destructive', title: 'Minimum Subjects', description: 'You need at least 2 subjects to calculate.'});
    }
  };

  const handleCalculate = () => {
    if (!user) return;
    
    if ((currentUserData?.credits ?? 0) < CALCULATION_COST) {
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
    addCreditsToUser(user.id, -CALCULATION_COST);
    toast({ title: 'Calculation Successful!', description: `${CALCULATION_COST} credits have been deducted.` });
    
    setIsCalculating(false);
  };
  
  const resultRank = result ? getRank(result.percentage) : null;


  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Percentage Calculator</h1>
        <p className="text-muted-foreground">Calculate your CBSE/Board exam percentage based on the "Best of 5" rule.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
        <SignedOut>
             <LoginWall 
                title="Unlock the Calculator"
                description="Sign up for a free account to calculate your exam percentages and track your academic progress."
                className="col-span-full"
            />
        </SignedOut>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Enter Your Marks</CardTitle>
                <CardDescription>Add your subjects and the marks obtained (out of 100). Mark which subjects are compulsory.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {subjects.map((subject, index) => (
                    <div key={subject.id} className="grid grid-cols-12 gap-x-2 gap-y-3 items-center">
                        <div className="col-span-12 sm:col-span-6">
                            <Label htmlFor={`subject-name-${subject.id}`} className="sr-only">Subject Name</Label>
                            <Input
                                id={`subject-name-${subject.id}`}
                                placeholder={`Subject ${index + 1}`}
                                value={subject.name}
                                onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                                disabled={subject.name === 'English' || !isSignedIn}
                            />
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                             <Label htmlFor={`subject-marks-${subject.id}`} className="sr-only">Marks</Label>
                            <Input
                                id={`subject-marks-${subject.id}`}
                                type="number"
                                placeholder="Marks"
                                value={subject.marks}
                                onChange={(e) => handleSubjectChange(subject.id, 'marks', e.target.value)}
                                min="0"
                                max="100"
                                disabled={!isSignedIn}
                            />
                        </div>
                        <div className="col-span-4 sm:col-span-2 flex items-center justify-center gap-2">
                             <Checkbox
                                id={`compulsory-${subject.id}`}
                                checked={subject.isCompulsory}
                                onCheckedChange={(checked) => handleSubjectChange(subject.id, 'isCompulsory', Boolean(checked))}
                                disabled={subject.name === 'English' || !isSignedIn}
                            />
                            <Label htmlFor={`compulsory-${subject.id}`} className="text-xs text-muted-foreground">Compulsory</Label>
                        </div>
                        <div className="col-span-2 sm:col-span-1 flex justify-end">
                            {subject.name !== 'English' && (
                                <Button variant="ghost" size="icon" onClick={() => removeSubject(subject.id)} className="text-muted-foreground hover:text-destructive" disabled={!isSignedIn}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
                    <Button variant="outline" onClick={addSubject} disabled={!isSignedIn}>
                        <Plus className="mr-2 h-4 w-4" /> Add Subject
                    </Button>
                    <div className="flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 p-2 text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                        <p className="text-xs font-semibold">
                            Cost: {CALCULATION_COST} Credits
                        </p>
                    </div>
                    <Button onClick={handleCalculate} disabled={isCalculating || !isSignedIn}>
                        <Percent className="mr-2 h-4 w-4" /> {isCalculating ? 'Calculating...' : 'Calculate Best of 5'}
                    </Button>
                </div>
            </CardContent>
        </Card>
        
        <div className="lg:col-span-1 space-y-8">
            <Card className="border-primary/20 shadow-lg shadow-primary/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/> Your Result</CardTitle>
                </CardHeader>
                <CardContent>
                    <AnimatePresence>
                        {result ? (
                            <motion.div initial={{ opacity: 0, y:10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-center">
                               <p className="text-muted-foreground">Percentage</p>
                               <p className="text-7xl font-bold tracking-tighter text-primary">{result.percentage.toFixed(2)}%</p>
                               <Separator className="my-4"/>
                               <p className="text-sm font-medium text-left">Based on these subjects:</p>
                               <ul className="space-y-1 text-left text-sm text-muted-foreground">
                                   {result.bestSubjects.map(s => (
                                       <li key={s.id} className="flex justify-between">
                                           <span>{s.name}</span>
                                           <span className="font-mono">{s.marks}</span>
                                        </li>
                                   ))}
                               </ul>
                            </motion.div>
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                                <p>Your calculated percentage will appear here.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            <AnimatePresence>
            {resultRank && (
                <motion.div initial={{ opacity: 0, y:10 }} animate={{ opacity: 1, y: 0 }} transition={{delay: 0.2}}>
                     <Card>
                        <CardHeader className="items-center text-center">
                            <resultRank.icon className={cn("h-12 w-12 mb-2", resultRank.color, resultRank.icon === Crown && "animate-gold-shine")} />
                            <CardTitle className={cn("text-2xl", resultRank.color)}>{resultRank.title}</CardTitle>
                            <CardDescription>{resultRank.description}</CardDescription>
                        </CardHeader>
                    </Card>
                </motion.div>
            )}
            </AnimatePresence>


             <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center justify-between">
                        <span>Your Credits</span>
                        <Medal className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{currentUserData?.credits ?? 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        -2 credits per calculation
                    </p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

