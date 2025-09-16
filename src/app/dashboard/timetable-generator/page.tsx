
'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sun, Moon, LayoutList, Brain, Sparkles, Trash2, Download } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUser, SignedOut } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';

interface Subject {
    name: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

interface TimeSlot {
    start: number; // in minutes from midnight
    end: number;
    activity: string;
    type: 'sleep' | 'school' | 'meal' | 'break' | 'study' | 'hobby' | 'free';
    subject?: string;
    color: string;
}

const colors = {
    sleep: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    school: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    meal: 'bg-green-500/20 text-green-300 border-green-500/30',
    break: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    study: 'bg-primary/20 text-primary border-primary/30',
    hobby: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    free: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
};

const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
};


export default function TimetableGeneratorPage() {
    const { isSignedIn } = useUser();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [timetable, setTimetable] = useLocalStorage<TimeSlot[] | null>('generatedTimetable', null);

    // Step 1: Basic Info
    const [studentType, setStudentType] = useState<'regular' | 'dummy'>('regular');
    const [classType, setClassType] = useState<'9-10' | '11-12' | 'dropper'>('11-12');

    // Step 2: Schedule
    const [wakeUp, setWakeUp] = useState('06:00');
    const [sleep, setSleep] = useState('23:00');
    const [schoolHours, setSchoolHours] = useState([9, 15]);
    const [coachingHours, setCoachingHours] = useState([16, 18]);

    // Step 3: Subjects
    const [subjects, setSubjects] = useState<Subject[]>([{ name: 'Physics', difficulty: 'hard' }, { name: 'Chemistry', difficulty: 'medium' }, { name: 'Maths', difficulty: 'easy' }]);
    
    // Step 4: Preferences
    const [studyHours, setStudyHours] = useState(5);
    const [studyHabit, setStudyHabit] = useState<'morning' | 'night'>('morning');
    const [breakDuration, setBreakDuration] = useState(15);
    const [longBreakAfter, setLongBreakAfter] = useState(2);


    const handleSubjectChange = (index: number, field: keyof Subject, value: string) => {
        const newSubjects = [...subjects];
        (newSubjects[index] as any)[field] = value;
        setSubjects(newSubjects);
    };

    const addSubject = () => {
        if(subjects.length < 8) {
            setSubjects([...subjects, { name: '', difficulty: 'medium' }]);
        } else {
            toast({ variant: 'destructive', title: "Maximum of 8 subjects allowed." });
        }
    }
    
    const removeSubject = (index: number) => {
        if(subjects.length > 2) {
            setSubjects(subjects.filter((_, i) => i !== index));
        } else {
             toast({ variant: 'destructive', title: "Minimum of 2 subjects required." });
        }
    }

    const generateTimetable = () => {
        const difficultyWeights = { easy: 1, medium: 1.5, hard: 2 };
        const totalWeight = subjects.reduce((sum, s) => sum + difficultyWeights[s.difficulty], 0);
        
        let availableMinutes = 24 * 60;
        
        const [wakeH, wakeM] = wakeUp.split(':').map(Number);
        const wakeTime = wakeH * 60 + wakeM;
        const [sleepH, sleepM] = sleep.split(':').map(Number);
        let sleepTime = sleepH * 60 + sleepM;
        if(sleepTime <= wakeTime) sleepTime += 24*60; // For overnight sleep

        availableMinutes -= (sleepTime - wakeTime);
        
        let fixedSlots: TimeSlot[] = [{ start: sleepTime % (24*60), end: wakeTime, activity: 'Sleep', type: 'sleep', color: colors.sleep }];
        
        // School/Coaching
        if(studentType === 'regular') {
            const schoolStart = schoolHours[0] * 60;
            const schoolEnd = schoolHours[1] * 60;
            availableMinutes -= (schoolEnd - schoolStart);
            fixedSlots.push({start: schoolStart, end: schoolEnd, activity: 'School/College', type: 'school', color: colors.school});
        }
        if(classType !== '9-10') {
             const coachingStart = coachingHours[0] * 60;
             const coachingEnd = coachingHours[1] * 60;
             availableMinutes -= (coachingEnd - coachingStart);
             fixedSlots.push({start: coachingStart, end: coachingEnd, activity: 'Coaching', type: 'school', color: colors.school});
        }

        // Meals (approximate)
        const mealTimes = [{start: 8*60, end: 8*60+30}, {start: 13*60, end: 13*60+30}, {start: 20*60, end: 20*60+30}];
        mealTimes.forEach(meal => {
            availableMinutes -= 30;
            fixedSlots.push({ ...meal, activity: 'Meal', type: 'meal', color: colors.meal });
        });

        const totalStudyMinutes = studyHours * 60;
        
        if(totalStudyMinutes > availableMinutes) {
            toast({variant: 'destructive', title: "Not enough time!", description: "Your study goals exceed your available time. Try reducing study hours or adjusting your schedule."});
            return;
        }

        const studySlots: TimeSlot[] = subjects.map(s => {
            const studyTime = Math.floor((difficultyWeights[s.difficulty] / totalWeight) * totalStudyMinutes);
            return { start: 0, end: 0, activity: `Study: ${s.name}`, type: 'study', subject: s.name, color: colors.study, duration: studyTime }
        }).filter(s => s.duration > 0) as any;

        
        const schedule: TimeSlot[] = [...fixedSlots];
        let currentTime = wakeTime;
        let studySessionCount = 0;

        while(studySlots.length > 0) {
            const isFree = !schedule.some(slot => currentTime >= slot.start && currentTime < slot.end);
            if(isFree) {
                const session = studySlots.shift()!;
                const sessionDuration = (session as any).duration;

                // Check for conflict in the entire duration
                let conflict = false;
                for(let t = currentTime; t < currentTime + sessionDuration; t++) {
                     if(schedule.some(slot => t % (24*60) >= slot.start && t % (24*60) < slot.end)) {
                         conflict = true;
                         break;
                     }
                }
                
                if(!conflict) {
                    schedule.push({ start: currentTime, end: currentTime + sessionDuration, ...session });
                    currentTime += sessionDuration;
                    studySessionCount++;

                    // Add a break
                     if(studySlots.length > 0) {
                        const breakTime = studySessionCount % longBreakAfter === 0 ? breakDuration * 2 : breakDuration;
                        schedule.push({ start: currentTime, end: currentTime + breakTime, activity: 'Break', type: 'break', color: colors.break });
                        currentTime += breakTime;
                    }

                } else {
                    currentTime += 15; // Move to the next 15-min block
                }
            } else {
                currentTime += 15;
            }
             if(currentTime >= sleepTime) break; // Stop if we run into sleep time
        }

        setTimetable(schedule.sort((a,b) => a.start - b.start));
        setStep(5);
    };

    const nextStep = () => setStep(s => s < 4 ? s + 1 : s);
    const prevStep = () => setStep(s => s > 1 ? s - 1 : s);

    const renderStep = () => {
        switch (step) {
            case 1: return <Step1 />;
            case 2: return <Step2 />;
            case 3: return <Step3 />;
            case 4: return <Step4 />;
            default: return null;
        }
    };

    const Step1 = () => (
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="text-center">
                <p className="font-bold text-lg text-primary">Step 1 of 4</p>
                <h3 className="text-2xl font-bold">Tell us about yourself</h3>
            </div>
             <div className="space-y-6">
                <div className="space-y-3">
                    <Label className="text-base">Are you a regular school/college student or a dummy school student?</Label>
                    <RadioGroup value={studentType} onValueChange={(v: any) => setStudentType(v)} className="flex flex-col sm:flex-row gap-4">
                        <Label htmlFor="s-regular" className="flex-1 p-4 border-2 rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-all"><RadioGroupItem value="regular" id="s-regular" className="sr-only"/>Regular Student</Label>
                        <Label htmlFor="s-dummy" className="flex-1 p-4 border-2 rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-all"><RadioGroupItem value="dummy" id="s-dummy" className="sr-only"/>Dummy School</Label>
                    </RadioGroup>
                </div>
                 <div className="space-y-3">
                    <Label className="text-base">Which class are you in?</Label>
                    <RadioGroup value={classType} onValueChange={(v: any) => setClassType(v)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Label htmlFor="c-9-10" className="p-4 border-2 rounded-lg cursor-pointer text-center has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-all"><RadioGroupItem value="9-10" id="c-9-10" className="sr-only"/>Class 9-10</Label>
                        <Label htmlFor="c-11-12" className="p-4 border-2 rounded-lg cursor-pointer text-center has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-all"><RadioGroupItem value="11-12" id="c-11-12" className="sr-only"/>Class 11-12</Label>
                        <Label htmlFor="c-dropper" className="p-4 border-2 rounded-lg cursor-pointer text-center has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-all"><RadioGroupItem value="dropper" id="c-dropper" className="sr-only"/>Dropper</Label>
                    </RadioGroup>
                </div>
            </div>
        </motion.div>
    );
     const Step2 = () => (
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="text-center">
                <p className="font-bold text-lg text-primary">Step 2 of 4</p>
                <h3 className="text-2xl font-bold">Your Daily Routine</h3>
            </div>
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label htmlFor="wake-up">Wake Up Time</Label><Input id="wake-up" type="time" value={wakeUp} onChange={e => setWakeUp(e.target.value)}/></div>
                    <div className="space-y-2"><Label htmlFor="sleep">Sleep Time</Label><Input id="sleep" type="time" value={sleep} onChange={e => setSleep(e.target.value)}/></div>
                </div>
                {studentType === 'regular' && (
                    <div className="space-y-3">
                        <Label>School/College Hours ({schoolHours[1] - schoolHours[0]} hrs)</Label>
                        <Slider value={schoolHours} onValueChange={setSchoolHours} min={5} max={20} step={1}/>
                        <div className="flex justify-between text-xs text-muted-foreground"><span>{schoolHours[0]}:00</span><span>{schoolHours[1]}:00</span></div>
                    </div>
                )}
                 {classType !== '9-10' && (
                    <div className="space-y-3">
                        <Label>Coaching Hours ({coachingHours[1] - coachingHours[0]} hrs)</Label>
                        <Slider value={coachingHours} onValueChange={setCoachingHours} min={10} max={22} step={1}/>
                        <div className="flex justify-between text-xs text-muted-foreground"><span>{coachingHours[0]}:00</span><span>{coachingHours[1]}:00</span></div>
                    </div>
                )}
            </div>
        </motion.div>
    );

    const Step3 = () => (
         <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="text-center">
                <p className="font-bold text-lg text-primary">Step 3 of 4</p>
                <h3 className="text-2xl font-bold">Your Subjects</h3>
                <p className="text-muted-foreground text-sm">List your subjects and rank their difficulty.</p>
            </div>
            <div className="space-y-4">
                {subjects.map((s, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                        <Input className="md:col-span-6" placeholder={`Subject ${i+1}`} value={s.name} onChange={e => handleSubjectChange(i, 'name', e.target.value)} />
                        <RadioGroup value={s.difficulty} onValueChange={(v: any) => handleSubjectChange(i, 'difficulty', v)} className="md:col-span-5 flex gap-1 justify-center md:justify-start mt-2 md:mt-0">
                            <Label htmlFor={`d-${i}-e`} className="text-xs px-3 py-2 border rounded-md cursor-pointer has-[:checked]:bg-green-500/20 has-[:checked]:border-green-500 has-[:checked]:text-green-700 dark:has-[:checked]:text-green-300">
                                <RadioGroupItem value="easy" id={`d-${i}-e`} className="sr-only"/>Easy</Label>
                             <Label htmlFor={`d-${i}-m`} className="text-xs px-3 py-2 border rounded-md cursor-pointer has-[:checked]:bg-yellow-500/20 has-[:checked]:border-yellow-500 has-[:checked]:text-yellow-700 dark:has-[:checked]:text-yellow-300">
                                <RadioGroupItem value="medium" id={`d-${i}-m`} className="sr-only"/>Medium</Label>
                             <Label htmlFor={`d-${i}-h`} className="text-xs px-3 py-2 border rounded-md cursor-pointer has-[:checked]:bg-red-500/20 has-[:checked]:border-red-500 has-[:checked]:text-red-700 dark:has-[:checked]:text-red-300">
                                <RadioGroupItem value="hard" id={`d-${i}-h`} className="sr-only"/>Hard</Label>
                        </RadioGroup>
                        <Button variant="ghost" size="icon" onClick={() => removeSubject(i)} className="md:col-span-1 ml-auto"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                    </div>
                ))}
            </div>
            <Button variant="outline" onClick={addSubject}>Add Another Subject</Button>
         </motion.div>
    );

    const Step4 = () => (
         <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
             <div className="text-center">
                <p className="font-bold text-lg text-primary">Step 4 of 4</p>
                <h3 className="text-2xl font-bold">Study Preferences</h3>
            </div>
             <div className="space-y-6">
                <div className="space-y-3">
                    <Label className="text-base">How many hours do you want to study per day? ({studyHours} hours)</Label>
                    <Slider value={[studyHours]} onValueChange={(v) => setStudyHours(v[0])} min={1} max={12} step={1}/>
                </div>
                 <div className="space-y-3">
                    <Label className="text-base">Are you a morning person or a night owl?</Label>
                    <RadioGroup value={studyHabit} onValueChange={(v:any) => setStudyHabit(v)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Label htmlFor="h-morning" className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-all"><Sun/><RadioGroupItem value="morning" id="h-morning" className="sr-only"/>Morning Person</Label>
                        <Label htmlFor="h-night" className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-all"><Moon/><RadioGroupItem value="night" id="h-night" className="sr-only"/>Night Owl</Label>
                    </RadioGroup>
                </div>
                <div className="space-y-3">
                    <Label className="text-base">Short break duration? ({breakDuration} mins)</Label>
                    <Slider value={[breakDuration]} onValueChange={(v) => setBreakDuration(v[0])} min={5} max={30} step={5}/>
                </div>
             </div>
         </motion.div>
    );


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3"><LayoutList className="text-primary"/> Personal Timetable Generator</h1>
                <p className="text-muted-foreground">Answer a few questions to generate a personalized study schedule.</p>
            </div>
            
            <AnimatePresence mode="wait">
            {!timetable ? (
                 <Card className="max-w-2xl mx-auto relative">
                     <SignedOut>
                         <LoginWall title="Unlock Timetable Generator" description="Sign up to create personalized study schedules tailored to your routine and goals." />
                     </SignedOut>
                    <CardHeader>
                        <motion.div
                            key={step}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="absolute top-4 right-4 text-sm font-bold text-muted-foreground"
                        >
                            <span className="text-primary">{step}</span> / 4
                        </motion.div>
                    </CardHeader>
                    <CardContent className="min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {renderStep()}
                        </AnimatePresence>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={prevStep} disabled={step === 1}>
                            <ArrowLeft className="mr-2"/> Previous
                        </Button>
                        {step < 4 ? (
                             <Button onClick={nextStep}>
                                Next <ArrowRight className="ml-2"/>
                            </Button>
                        ) : (
                             <Button onClick={generateTimetable} disabled={!isSignedIn}>
                                <Sparkles className="mr-2"/> Generate Timetable
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            ) : (
                <motion.div initial={{opacity: 0, y:20}} animate={{opacity: 1, y:0}}>
                    <Card className="max-w-3xl mx-auto">
                        <CardHeader>
                            <CardTitle>Your Personalized Timetable</CardTitle>
                            <CardDescription>Here is a schedule tailored to your needs. You can delete it and generate a new one anytime.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 border rounded-lg p-4 max-h-[60vh] overflow-y-auto">
                                {timetable.map((slot, i) => (
                                    <div key={i} className={cn("p-3 rounded-md border-l-4", slot.color)}>
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold">{slot.activity}</p>
                                            <p className="font-mono text-sm">{formatTime(slot.start)} - {formatTime(slot.end)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end gap-2">
                             <Button variant="outline" onClick={() => {toast({title: "Coming Soon!", description: "PDF downloads will be available in a future update."})}}><Download className="mr-2"/> Download</Button>
                            <Button variant="destructive" onClick={() => setTimetable(null)}><Trash2 className="mr-2"/> Delete & Start Over</Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            )}
            </AnimatePresence>

        </div>
    )
}
