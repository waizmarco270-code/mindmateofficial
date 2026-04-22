'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    GraduationCap, Target, Globe, 
    Sparkles, Clock, CheckCircle, 
    ChevronRight, ChevronLeft, Award,
    Rocket, Brain, Zap, Gem, Trophy, Flame,
    ShieldCheck, Users, Send, Gamepad2, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAdmin } from '@/hooks/use-admin';
import { cn } from '@/lib/utils';

const STEPS = [
    { id: 'reward', title: 'Sovereign Reward', desc: 'Mainframe Authorization' },
    { id: 'identity', title: 'Registry Step 1', desc: 'Academic Identity' },
    { id: 'objective', title: 'Registry Step 2', desc: 'Primary Objective' },
    { id: 'source', title: 'Registry Step 3', desc: 'Discovery Source' },
    { id: 'habit', title: 'Registry Step 4', desc: 'Cognitive Style' },
    { id: 'commitment', title: 'Registry Step 5', desc: 'Temporal Target' }
];

export function OnboardingWizard() {
    const { completeOnboarding } = useAdmin();
    const [step, setStep] = useState(0);
    const [data, setData] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNext = () => setStep(s => s + 1);
    const handlePrev = () => setStep(s => s - 1);

    const handleFinish = async () => {
        setIsSubmitting(true);
        await completeOnboarding(data);
    };

    const updateData = (key: string, val: any) => {
        setData((prev: any) => ({ ...prev, [key]: val }));
        handleNext();
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-8">
                        <div className="mx-auto w-24 h-24 rounded-[2rem] bg-yellow-400/20 border-2 border-yellow-400/40 flex items-center justify-center shadow-2xl">
                            <Trophy className="h-12 w-12 text-yellow-400 animate-bounce" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">CONGRATULATIONS!</h2>
                            <p className="text-muted-foreground font-bold uppercase tracking-widest">Digital Asset Injection Successful</p>
                        </div>
                        <Card className="bg-white/5 border-white/10 p-8 rounded-[2.5rem]">
                            <p className="text-sm font-black uppercase text-yellow-400 tracking-[0.3em] mb-2">Signup Bounty Secured</p>
                            <div className="flex items-center justify-center gap-3">
                                <Gem className="h-10 w-10 text-primary" />
                                <span className="text-7xl font-black tracking-tighter text-white">500</span>
                                <span className="text-xl font-black text-muted-foreground uppercase mt-4">Credits</span>
                            </div>
                        </Card>
                        <Button size="lg" className="w-full h-16 rounded-2xl font-black text-xl italic shadow-2xl shadow-primary/20" onClick={handleNext}>
                            INITIALIZE PROFILE <ChevronRight className="ml-2"/>
                        </Button>
                    </motion.div>
                );

            case 1:
                return (
                    <SelectionStep 
                        title="What is your current academic identity?"
                        options={[
                            { id: '1-5', label: 'Primary (1-5)', icon: GraduationCap },
                            { id: '6-9', label: 'Middle (6-9)', icon: GraduationCap },
                            { id: '10', label: 'Class 10 (Boards)', icon: Target },
                            { id: '11', label: 'Class 11', icon: GraduationCap },
                            { id: '12', label: 'Class 12 (Boards)', icon: Target },
                            { id: 'jee', label: 'JEE Aspirant', icon: Rocket, color: 'text-rose-400' },
                            { id: 'neet', label: 'NEET Aspirant', icon: Brain, color: 'text-emerald-400' },
                            { id: 'others', label: 'Lifelong Learner', icon: Globe }
                        ]}
                        onSelect={(val: any) => updateData('identity', val)}
                    />
                );

            case 2:
                return (
                    <SelectionStep 
                        title="What is your primary strategic objective?"
                        options={[
                            { id: 'score', label: 'Master My Subjects', icon: Zap },
                            { id: 'exam', label: 'Clear Competitive Exam', icon: Trophy },
                            { id: 'discipline', label: 'Build Iron Discipline', icon: ShieldCheck },
                            { id: 'habit', label: 'Fix Study Habits', icon: Flame },
                            { id: 'social', label: 'Study with Peers', icon: Users }
                        ]}
                        onSelect={(val: any) => updateData('objective', val)}
                    />
                );

            case 3:
                return (
                    <SelectionStep 
                        title="How did you discover the mainframe?"
                        options={[
                            { id: 'instagram', label: 'Instagram', icon: InstagramIcon },
                            { id: 'whatsapp', label: 'WhatsApp Relay', icon: MessageCircleIcon },
                            { id: 'telegram', label: 'Telegram Signal', icon: Send },
                            { id: 'youtube', label: 'YouTube Briefing', icon: YoutubeIcon },
                            { id: 'friends', label: 'Word of Mouth', icon: Users },
                            { id: 'ads', label: 'Digital Advertisement', icon: MegaphoneIcon }
                        ]}
                        onSelect={(val: any) => updateData('source', val)}
                    />
                );

            case 4:
                return (
                    <SelectionStep 
                        title="Select your preferred cognitive style."
                        options={[
                            { id: 'solo', label: 'Solo Deep Focus', icon: Zap, desc: 'Quiet, intense sessions.' },
                            { id: 'group', label: 'Clan Collaboration', icon: Users, desc: 'Team-based motivation.' },
                            { id: 'game', label: 'Gamified Sprints', icon: Gamepad2, desc: 'Rewards-driven learning.' }
                        ]}
                        onSelect={(val: any) => updateData('habit', val)}
                    />
                );

            case 5:
                return (
                    <div className="space-y-8">
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight">Mission Commitment</h3>
                            <p className="text-muted-foreground font-medium italic">Target daily hours for the Focus Engine.</p>
                        </div>
                        <div className="grid gap-4">
                            {[2, 4, 6, 8].map(h => (
                                <Button 
                                    key={h} 
                                    variant="outline" 
                                    className="h-20 rounded-2xl border-2 border-white/5 bg-white/5 hover:border-primary/50 text-xl font-black uppercase tracking-widest"
                                    onClick={() => { setData((p: any) => ({ ...p, commitment: h })); handleFinish(); }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin"/> : `${h} Hours / Day`}
                                </Button>
                            ))}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black p-4 select-none">
            <div className="absolute inset-0 bg-layer gradient-0 opacity-50" />
            <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
            
            <motion.div layout className="w-full max-w-2xl relative z-10">
                <Card className="bg-slate-900/60 backdrop-blur-3xl border-2 border-white/10 rounded-[3rem] shadow-2xl overflow-hidden p-8 sm:p-12">
                    {step > 0 && (
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex gap-1">
                                {STEPS.map((_, i) => (
                                    <div key={i} className={cn("h-1 rounded-full transition-all duration-500", i === step ? "w-8 bg-primary" : "w-2 bg-white/10", i < step && "bg-green-500")} />
                                ))}
                            </div>
                            <Button variant="ghost" size="icon" onClick={handlePrev} className="rounded-full"><ChevronLeft/></Button>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={step}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderStep()}
                        </motion.div>
                    </AnimatePresence>
                </Card>
            </motion.div>
        </div>
    );
}

function SelectionStep({ title, options, onSelect }: any) {
    return (
        <div className="space-y-8">
            <h3 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-center">{title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {options.map((opt: any) => (
                    <Button 
                        key={opt.id} 
                        variant="outline" 
                        className="h-auto py-6 px-6 rounded-2xl border-2 border-white/5 bg-white/5 hover:border-primary/50 flex flex-col items-center text-center gap-3 transition-all active:scale-95"
                        onClick={() => onSelect(opt.id)}
                    >
                        <opt.icon className={cn("h-8 w-8", opt.color || "text-primary")} />
                        <div className="space-y-1">
                            <p className="font-black uppercase text-sm tracking-widest">{opt.label}</p>
                            {opt.desc && <p className="text-[10px] font-medium text-muted-foreground italic leading-none">{opt.desc}</p>}
                        </div>
                    </Button>
                ))}
            </div>
        </div>
    );
}

const InstagramIcon = (p: any) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>;
const MessageCircleIcon = (p: any) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>;
const YoutubeIcon = (p: any) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10C2.5 6 2.5 4.5 3.5 3.5a2.44 2.44 0 0 1 2-1C7 2 12 2 12 2s5 0 6.5.5a2.44 2.44 0 0 1 2 1c1 1 1 2.5 1 3.5a24.12 24.12 0 0 1 0 10c0 1 0 2.5-1 3.5a2.44 2.44 0 0 1-2-1C17 22 12 22 12 22s-5 0-6.5-.5a2.44 2.44 0 0 1-2-1C2.5 19.5 2.5 18 2.5 17Z"></path><path d="m10 15 5-3-5-3z"></path></svg>;
const MegaphoneIcon = (p: any) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 13v-2Z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>;