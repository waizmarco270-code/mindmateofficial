
'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import syllabusData from '@/app/lib/syllabus-data.json';
import { BookCopy, Brain, FlaskConical, Sigma, Dna, Rocket, GraduationCap } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Exam = 'jee' | 'neet' | 'class12' | 'class11' | 'class10';
type Subject = 'physics' | 'chemistry' | 'maths' | 'biology' | 'science' | 'social_science' | 'english';
type Importance = 'high' | 'medium' | 'low';

interface Chapter {
    chapter: string;
    importance: Importance;
}

const importanceStyles: Record<Importance, { indicator: string; text: string }> = {
    high: { indicator: 'bg-red-500', text: 'text-red-500' },
    medium: { indicator: 'bg-blue-500', text: 'text-blue-500' },
    low: { indicator: 'bg-green-500', text: 'text-green-500' },
};

const examDetails = {
    jee: { label: "JEE", icon: Rocket },
    neet: { label: "NEET", icon: Dna },
    class12: { label: "Class 12", icon: GraduationCap },
    class11: { label: "Class 11", icon: GraduationCap },
    class10: { label: "Class 10", icon: GraduationCap },
};

const subjectIcons = {
    physics: Brain,
    chemistry: FlaskConical,
    maths: Sigma,
    biology: Dna,
    science: FlaskConical,
    social_science: Globe,
    english: BookCopy,
};

export default function SyllabusPage() {
    const [activeExam, setActiveExam] = useState<Exam>('jee');
    
    const syllabus = syllabusData[activeExam] as Record<Subject, Chapter[]>;

    const renderSubjectSyllabus = (subject: Subject, chapters: Chapter[]) => {
        const SubjectIcon = subjectIcons[subject] || Brain;
        return (
            <AccordionItem key={subject} value={subject}>
                <AccordionTrigger className="text-lg font-semibold capitalize flex items-center gap-3">
                    <SubjectIcon className="h-5 w-5 text-primary" />
                    {subject.replace('_', ' ')}
                </AccordionTrigger>
                <AccordionContent>
                    <motion.ul
                        className="space-y-2"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: { transition: { staggerChildren: 0.05 } },
                            hidden: {},
                        }}
                    >
                        {chapters.map((item, index) => (
                            <motion.li
                                key={index}
                                className="flex items-center gap-4 p-3 rounded-md border bg-muted/50"
                                variants={{
                                    hidden: { y: 20, opacity: 0 },
                                    visible: { y: 0, opacity: 1 },
                                }}
                            >
                                <div className={cn("w-2 h-2 rounded-full flex-shrink-0", importanceStyles[item.importance].indicator)}></div>
                                <span className="flex-1">{item.chapter}</span>
                                <span className={cn("text-xs font-bold uppercase", importanceStyles[item.importance].text)}>
                                    {item.importance}
                                </span>
                            </motion.li>
                        ))}
                    </motion.ul>
                </AccordionContent>
            </AccordionItem>
        );
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <BookCopy className="h-8 w-8 text-primary" />
                    Syllabus Explorer
                </h1>
                <p className="text-muted-foreground">An overview of important chapters for your exams.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Select Your Exam</CardTitle>
                    <CardDescription>Choose an exam to view its detailed, subject-wise syllabus breakdown.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeExam} onValueChange={(value) => setActiveExam(value as Exam)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                            {(Object.keys(examDetails) as Exam[]).map(exam => {
                                const ExamIcon = examDetails[exam].icon;
                                return (
                                    <TabsTrigger key={exam} value={exam} className="flex items-center gap-2">
                                        <ExamIcon className="h-4 w-4" />
                                        {examDetails[exam].label}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeExam}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-6"
                            >
                                <Accordion type="multiple" className="w-full space-y-4">
                                    {(Object.keys(syllabus) as Subject[]).map(subject => 
                                        renderSubjectSyllabus(subject, syllabus[subject])
                                    )}
                                </Accordion>
                            </motion.div>
                        </AnimatePresence>
                    </Tabs>
                </CardContent>
            </Card>
             <div className="flex items-center justify-center text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span>Most Important</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span>Important</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span>General</span></div>
                </div>
            </div>
        </div>
    );
}

// Dummy icon for fallback
const Globe = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
