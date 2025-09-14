

'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAdmin, type Resource, type DailySurprise, type ResourceSection } from '@/hooks/use-admin';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Send, Trash2, MinusCircle, Vote, AlertTriangle, Edit, Lock, Unlock, Gift, RefreshCcw, Users, Megaphone, BookOpen, ClipboardCheck, KeyRound, ShieldCheck, UserCog, DollarSign, Wallet, ShieldX, Lightbulb, Image, Mic, MessageSquare, FolderPlus, Sparkles, Loader2, Gamepad, Award, Zap, Gamepad2, BrainCircuit, Trophy, BookOpen as BookOpenIcon, Clock, LineChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuizzes } from '@/hooks/use-quizzes';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { generateQuiz } from '@/ai/flows/generate-quiz-flow';


interface QuizQuestion {
    text: string;
    options: string[];
    correctAnswer: string;
}

type EditableResource = Resource & { type: 'general' | 'premium' };
type EditableSection = ResourceSection;

const availableIcons = {
    "Award": Award,
    "Zap": Zap,
    "Gamepad2": Gamepad2,
    "Gift": Gift,
    "BrainCircuit": BrainCircuit,
    "Trophy": Trophy,
    "BookOpen": BookOpenIcon,
    "Clock": Clock,
    "LineChart": LineChart,
} as const;

type AvailableIconName = keyof typeof availableIcons;

const availableRoutes = {
    "Home": "/dashboard",
    "AI Assistant": "/dashboard/ai-assistant",
    "Reward Zone": "/dashboard/reward",
    "Quiz Zone": "/dashboard/quiz",
    "Social Hub": "/dashboard/social",
    "Entertainment": "/dashboard/entertainment",
    "Resources": "/dashboard/resources",
    "Invite & Earn": "/dashboard/refer",
    "Focus Mode": "/dashboard/tracker",
    "Time Tracker": "/dashboard/time-tracker",
    "Schedule": "/dashboard/schedule",
    "To-Dos": "/dashboard/todos",
    "Insights": "/dashboard/insights",
    "Leaderboard": "/dashboard/leaderboard",
    "Calculator": "/dashboard/calculator",
};

export default function AdminPanelPage() {
  const { 
    isAdmin, 
    announcements, updateAnnouncement, 
    activePoll, updatePoll,
    resources: allResources, addResource, updateResource, deleteResource,
    resourceSections, addResourceSection, updateResourceSection, deleteResourceSection,
    dailySurprises, addDailySurprise, deleteDailySurprise,
  } = useAdmin();
  const { quizzes, deleteQuiz } = useQuizzes();
  const { toast } = useToast();

  // State for Announcement
  const latestAnnouncement = announcements.length > 0 ? announcements[0] : null;
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementDesc, setAnnouncementDesc] = useState('');
  
  // State for Poll
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [isSavingPoll, setIsSavingPoll] = useState(false);

  // State for Daily Surprise
  const [surpriseType, setSurpriseType] = useState<'quote' | 'fact' | 'meme' | 'quiz' | 'new-feature'>('fact');
  const [surpriseText, setSurpriseText] = useState('');
  const [surpriseAuthor, setSurpriseAuthor] = useState('');
  const [surpriseImageUrl, setSurpriseImageUrl] = useState('');
  const [surpriseQuiz, setSurpriseQuiz] = useState({ question: '', options: ['', ''], correctAnswer: '' });
  const [surpriseFeature, setSurpriseFeature] = useState({ title: '', description: '', icon: 'Award' as AvailableIconName, route: '/dashboard' });

  
  // State for new sections
  const [sectionName, setSectionName] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');
  const [sectionUnlockCost, setSectionUnlockCost] = useState(30);
  const [sectionParentCategory, setSectionParentCategory] = useState<'class-10' | 'class-12' | 'jee' | 'neet' | 'class-6-9' | 'general'>('jee');


  // State for new resources
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceSectionId, setResourceSectionId] = useState('');
  
  // State for editing
  const [editingItem, setEditingItem] = useState<EditableResource | EditableSection | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);


  useEffect(() => {
      if(latestAnnouncement) {
          setAnnouncementTitle(latestAnnouncement.title);
          setAnnouncementDesc(latestAnnouncement.description);
      }
  }, [latestAnnouncement]);
  
  useEffect(() => {
      if(activePoll) {
          setPollQuestion(activePoll.question);
          setPollOptions(activePoll.options);
      }
  }, [activePoll]);

  // State for Quiz
  const [quizTitle, setQuizTitle] = useState('');
  const [quizCategory, setQuizCategory] = useState('');
  const [quizTimeLimit, setQuizTimeLimit] = useState(300);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    { text: '', options: ['', '', '', ''], correctAnswer: '' }
  ]);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);

  // State for AI Quiz Generator
  const [aiQuizTopic, setAiQuizTopic] = useState('');
  const [aiNumQuestions, setAiNumQuestions] = useState(5);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  
  const handleGenerateQuiz = async () => {
      if (!aiQuizTopic.trim()) {
          toast({ variant: 'destructive', title: 'Topic is required.'});
          return;
      }
      setIsGeneratingQuiz(true);
      try {
          const result = await generateQuiz({ topic: aiQuizTopic, numberOfQuestions: aiNumQuestions });
          setQuizTitle(result.title);
          setQuizCategory(result.category);
          setQuizQuestions(result.questions.map(q => ({ text: q.question, options: q.options, correctAnswer: q.correctAnswer })));
          toast({ title: 'Quiz Generated!', description: 'The quiz form has been populated. Review and save.'});
      } catch (error: any) {
           toast({ variant: 'destructive', title: 'AI Generation Failed', description: error.message || 'Could not generate quiz.' });
      } finally {
          setIsGeneratingQuiz(false);
      }
  }

  const handleSubmitAnnouncement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (latestAnnouncement && announcementTitle && announcementDesc) {
        await updateAnnouncement(latestAnnouncement.id, { title: announcementTitle, description: announcementDesc });
        toast({ title: "Success", description: "Announcement has been updated." });
    }
  };
  
  const handleSavePoll = async () => {
      if (!activePoll) return;
      if (!pollQuestion.trim() || pollOptions.some(o => !o.trim())) {
        toast({ variant: 'destructive', title: "Validation Error", description: "Please fill in the poll question and all options." });
        return;
      }
      setIsSavingPoll(true);
      try {
        await updatePoll(activePoll.id, { question: pollQuestion, options: pollOptions });
        toast({ title: "Poll Updated!", description: "The active poll has been saved." });
      } catch (error: any) {
        toast({ variant: 'destructive', title: "Error Saving Poll", description: error.message });
      } finally {
        setIsSavingPoll(false);
      }
  };

    const handleResourceFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!resourceTitle || !resourceDescription || !resourceUrl || !resourceSectionId) {
            toast({ variant: 'destructive', title: 'Validation Error', description: 'All resource fields are required.' });
            return;
        }

        const resourceData = { 
            title: resourceTitle, 
            description: resourceDescription, 
            url: resourceUrl, 
            sectionId: resourceSectionId 
        };

        try {
            await addResource(resourceData);
            toast({ title: 'Resource Added', description: 'The new resource has been added.' });
            // Reset form
            setResourceTitle('');
            setResourceDescription('');
            setResourceUrl('');
            setResourceSectionId('');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Operation Failed', description: error.message });
        }
    };
    
    const handleSectionFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
         if (!sectionName || !sectionDescription || !sectionParentCategory) {
            toast({ variant: 'destructive', title: 'Validation Error', description: 'All fields are required.' });
            return;
        }
        const sectionData = {
            name: sectionName,
            description: sectionDescription,
            unlockCost: sectionUnlockCost,
            parentCategory: sectionParentCategory,
        };
        try {
            await addResourceSection(sectionData);
            toast({ title: 'Section Created', description: `New section "${sectionName}" has been added.`});
            setSectionName('');
            setSectionDescription('');
            setSectionUnlockCost(30);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Operation Failed', description: error.message });
        }
    }
  
  const handleEditFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editingItem) return;
      const formData = new FormData(e.currentTarget);

      try {
          if ('sectionId' in editingItem) { // It's a Resource
            const title = formData.get('title') as string;
            const description = formData.get('description') as string;
            const url = formData.get('url') as string;
            if (!title || !description || !url) return toast({ variant: 'destructive', title: 'All fields required.'});
            await updateResource(editingItem.id, { title, description, url });
            toast({ title: 'Resource Updated' });
          } else { // It's a ResourceSection
            const name = formData.get('name') as string;
            const description = formData.get('description') as string;
            const unlockCost = Number(formData.get('unlockCost'));
            const parentCategory = formData.get('parentCategory') as ResourceSection['parentCategory'];
             if (!name || !description) return toast({ variant: 'destructive', title: 'All fields required.'});
            await updateResourceSection(editingItem.id, { name, description, unlockCost, parentCategory });
            toast({ title: 'Section Updated' });
          }
          closeEditDialog();
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
      }
  }


  const handleAddSurprise = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let surpriseData: Omit<DailySurprise, 'id' | 'createdAt'>;

    switch (surpriseType) {
        case 'fact':
            if (!surpriseText) return toast({ variant: 'destructive', title: 'Fact is empty' });
            surpriseData = { type: 'fact', text: surpriseText };
            break;
        case 'quote':
            if (!surpriseText) return toast({ variant: 'destructive', title: 'Quote is empty' });
            surpriseData = { type: 'quote', text: surpriseText, author: surpriseAuthor };
            break;
        case 'meme':
            if (!surpriseImageUrl) return toast({ variant: 'destructive', title: 'Image URL is empty' });
            surpriseData = { type: 'meme', imageUrl: surpriseImageUrl };
            break;
        case 'quiz':
            if (!surpriseQuiz.question || surpriseQuiz.options.some(o => !o) || !surpriseQuiz.correctAnswer) return toast({ variant: 'destructive', title: 'Quiz is incomplete' });
            surpriseData = { type: 'quiz', quizQuestion: surpriseQuiz.question, quizOptions: surpriseQuiz.options, quizCorrectAnswer: surpriseQuiz.correctAnswer };
            break;
        case 'new-feature':
            if (!surpriseFeature.title || !surpriseFeature.description || !surpriseFeature.route) return toast({ variant: 'destructive', title: 'Feature details are incomplete' });
            surpriseData = { 
                type: 'new-feature', 
                featureTitle: surpriseFeature.title,
                featureDescription: surpriseFeature.description,
                featureIcon: surpriseFeature.icon,
                featureRoute: surpriseFeature.route,
            };
            break;
    }

    try {
        await addDailySurprise(surpriseData);
        toast({ title: 'Surprise Added!', description: 'The new daily surprise is now in the rotation.' });
        // Reset forms
        setSurpriseText('');
        setSurpriseAuthor('');
        setSurpriseImageUrl('');
        setSurpriseQuiz({ question: '', options: ['', ''], correctAnswer: '' });
        setSurpriseFeature({ title: '', description: '', icon: 'Award', route: '/dashboard' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
};

  const openEditDialog = (item: EditableResource | EditableSection) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditingItem(null);
    setIsEditDialogOpen(false);
  };
  
  const handleQuestionChange = (index: number, field: keyof QuizQuestion, value: string | string[]) => {
      const newQuestions = [...quizQuestions];
      if (field === 'options' && Array.isArray(value)) {
          newQuestions[index].options = value;
      } else if(typeof value === 'string') {
          (newQuestions[index] as any)[field] = value;
      }
      setQuizQuestions(newQuestions);
  }

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
      const newQuestions = [...quizQuestions];
      newQuestions[qIndex].options[oIndex] = value;
      setQuizQuestions(newQuestions);
  }

  const addQuestion = () => {
      setQuizQuestions([...quizQuestions, { text: '', options: ['', '', '', ''], correctAnswer: '' }]);
  }
  
  const removeQuestion = (index: number) => {
      const newQuestions = quizQuestions.filter((_, i) => i !== index);
      setQuizQuestions(newQuestions);
  }

  const handleSaveQuiz = async () => {
      if (!quizTitle || !quizCategory || quizQuestions.some(q => !q.text || q.options.some(o => !o) || !q.correctAnswer)) {
          toast({ variant: 'destructive', title: "Validation Error", description: "Please fill all quiz fields, including all questions, options, and correct answers." });
          return;
      }
      setIsSavingQuiz(true);
      try {
          await addDoc(collection(db, 'quizzes'), {
              title: quizTitle,
              category: quizCategory.trim(),
              timeLimit: quizTimeLimit,
              questions: quizQuestions,
              createdAt: new Date().toISOString(),
          });
          toast({ title: "Quiz Saved!", description: "The new quiz has been added to the database." });
          setQuizTitle('');
          setQuizCategory('');
          setQuizTimeLimit(300);
          setQuizQuestions([{ text: '', options: ['', '', '', ''], correctAnswer: '' }]);
      } catch (error: any) {
          toast({ variant: 'destructive', title: "Error Saving Quiz", description: error.message });
      } finally {
          setIsSavingQuiz(false);
      }
  }

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length <= 2) return;
    const newOptions = pollOptions.filter((_, i) => i !== index);
    setPollOptions(newOptions);
  };
  
  const handleDeleteQuiz = async (quizId: string) => {
      try {
          await deleteQuiz(quizId);
          toast({ title: "Quiz Deleted", description: "The quiz has been removed from the database." });
      } catch (error: any) {
          toast({ variant: 'destructive', title: "Error Deleting Quiz", description: error.message });
      }
  }
  
  const generalResources = allResources.filter(r => r.sectionId === 'general');

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Card className="w-full max-w-md border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
                <ShieldX className="h-8 w-8"/> Access Denied
            </CardTitle>
            <CardDescription>
                You do not have the necessary permissions to view this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please contact the site administrator if you believe this is an error.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">Manage application content and settings.</p>
      </div>

      <Accordion type="multiple" defaultValue={['content-management']} className="w-full space-y-4">
        
        {/* Content Management */}
        <AccordionItem value="content-management" className="border-b-0">
          <Card>
            <AccordionTrigger className="p-6">
              <div className="flex items-center gap-3">
                <Megaphone className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Content Management</h3>
                  <p className="text-sm text-muted-foreground text-left">Edit announcements, polls, and daily surprises.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-8">
              <div className="grid gap-8 lg:grid-cols-2">
                  <Card>
                    <CardHeader><CardTitle>Edit Latest Announcement</CardTitle><CardDescription>Update the announcement that appears on the dashboard.</CardDescription></CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitAnnouncement} className="space-y-4">
                        <div className="space-y-2"><Label htmlFor="announcement-title">Title</Label><Input id="announcement-title" name="title" value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} required /></div>
                        <div className="space-y-2"><Label htmlFor="announcement-description">Description</Label><Textarea id="announcement-description" name="description" value={announcementDesc} onChange={(e) => setAnnouncementDesc(e.target.value)} required /></div>
                        <Button type="submit"><Send className="mr-2 h-4 w-4" /> Save Announcement</Button>
                      </form>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>Edit Active Community Poll</CardTitle><CardDescription>Update the current poll. This will reset all votes.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2"><Label htmlFor="poll-question">Poll Question</Label><Input id="poll-question" value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder="e.g. What feature should we build next?" /></div>
                      <div className="space-y-2"><Label>Options</Label>
                        {pollOptions.map((option, index) => (<div key={index} className="flex items-center gap-2"><Input value={option} onChange={e => handlePollOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`} />{pollOptions.length > 2 && (<Button variant="ghost" size="icon" onClick={() => removePollOption(index)}><MinusCircle className="h-4 w-4 text-destructive" /></Button>)}</div>))}
                      </div>
                      <div className="flex justify-between"><Button variant="outline" onClick={addPollOption}><PlusCircle className="mr-2 h-4 w-4" /> Add Option</Button><Button onClick={handleSavePoll} disabled={isSavingPoll}><Vote className="mr-2 h-4 w-4" /> {isSavingPoll ? 'Saving...' : 'Save Poll'}</Button></div>
                    </CardContent>
                  </Card>
                </div>
                 <div className="grid gap-8 lg:grid-cols-2">
                    <Card>
                      <CardHeader><CardTitle>Add Daily Surprise</CardTitle></CardHeader>
                      <CardContent>
                          <form onSubmit={handleAddSurprise} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={surpriseType} onValueChange={(v: any) => setSurpriseType(v)}>
                                    <SelectTrigger><SelectValue placeholder="Select surprise type..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fact"><Lightbulb className="mr-2 h-4 w-4" /> Fun Fact</SelectItem>
                                        <SelectItem value="quote"><MessageSquare className="mr-2 h-4 w-4" /> Quote</SelectItem>
                                        <SelectItem value="meme"><Image className="mr-2 h-4 w-4" /> Meme</SelectItem>
                                        <SelectItem value="quiz"><Mic className="mr-2 h-4 w-4" /> Micro Quiz</SelectItem>
                                        <SelectItem value="new-feature"><Gift className="mr-2 h-4 w-4"/> New Feature</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {surpriseType === 'fact' && (<div className="space-y-2"><Label>Fact</Label><Textarea value={surpriseText} onChange={e => setSurpriseText(e.target.value)} placeholder="Enter a fun fact..."/></div>)}
                            
                            {surpriseType === 'quote' && (
                                <div className="space-y-4">
                                    <div className="space-y-2"><Label>Quote</Label><Textarea value={surpriseText} onChange={e => setSurpriseText(e.target.value)} placeholder="The only way to do great work is to love what you do."/></div>
                                    <div className="space-y-2"><Label>Author</Label><Input value={surpriseAuthor} onChange={e => setSurpriseAuthor(e.target.value)} placeholder="e.g. Steve Jobs"/></div>
                                </div>
                            )}

                             {surpriseType === 'meme' && (<div className="space-y-2"><Label>Image URL</Label><Input value={surpriseImageUrl} type="url" onChange={e => setSurpriseImageUrl(e.target.value)} placeholder="https://example.com/meme.jpg"/></div>)}

                             {surpriseType === 'quiz' && (
                                 <div className="space-y-4 p-4 border rounded-lg">
                                    <div className="space-y-2"><Label>Question</Label><Input value={surpriseQuiz.question} onChange={e => setSurpriseQuiz(p => ({...p, question: e.target.value}))} placeholder="What is the capital of France?"/></div>
                                    <div className="space-y-2"><Label>Options</Label>
                                       {surpriseQuiz.options.map((opt, i) => (<Input key={i} value={opt} onChange={e => setSurpriseQuiz(p => { const newOpts = [...p.options]; newOpts[i] = e.target.value; return {...p, options: newOpts}})} placeholder={`Option ${i + 1}`}/>))}
                                    </div>
                                    <div className="space-y-2"><Label>Correct Answer</Label>
                                      <Select value={surpriseQuiz.correctAnswer} onValueChange={val => setSurpriseQuiz(p => ({...p, correctAnswer: val}))}>
                                        <SelectTrigger><SelectValue placeholder="Select correct answer" /></SelectTrigger>
                                        <SelectContent>{surpriseQuiz.options.map((opt, i) => opt && <SelectItem key={i} value={opt}>{opt}</SelectItem>)}</SelectContent>
                                      </Select>
                                    </div>
                                 </div>
                             )}

                            {surpriseType === 'new-feature' && (
                                <div className="space-y-4 p-4 border rounded-lg">
                                    <div className="space-y-2"><Label>Feature Title</Label><Input value={surpriseFeature.title} onChange={e => setSurpriseFeature(p => ({...p, title: e.target.value}))} placeholder="e.g., Entertainment Zone"/></div>
                                    <div className="space-y-2"><Label>Description</Label><Textarea value={surpriseFeature.description} onChange={e => setSurpriseFeature(p => ({...p, description: e.target.value}))} placeholder="Play games and earn credits!"/></div>
                                    <div className="space-y-2"><Label>Icon</Label>
                                         <Select value={surpriseFeature.icon} onValueChange={(v: AvailableIconName) => setSurpriseFeature(p => ({...p, icon: v}))}>
                                            <SelectTrigger><SelectValue placeholder="Select an icon..."/></SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(availableIcons).map(([name, Icon]) => (
                                                    <SelectItem key={name} value={name}><Icon className="mr-2 h-4 w-4"/> {name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                     <div className="space-y-2"><Label>Route</Label>
                                        <Select value={surpriseFeature.route} onValueChange={(v: string) => setSurpriseFeature(p => ({...p, route: v}))}>
                                            <SelectTrigger><SelectValue placeholder="Select a page..." /></SelectTrigger>
                                            <SelectContent>
                                                 {Object.entries(availableRoutes).map(([name, route]) => (
                                                    <SelectItem key={route} value={route}>{name}</SelectItem>
                                                 ))}
                                            </SelectContent>
                                        </Select>
                                     </div>
                                </div>
                            )}

                             <Button type="submit"><PlusCircle className="mr-2 h-4 w-4"/> Add Surprise</Button>
                          </form>
                      </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Existing Surprises</CardTitle></CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Content</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dailySurprises.map(s => (
                                        <TableRow key={s.id}>
                                            <TableCell><Badge variant="secondary" className="capitalize">{s.type.replace('-', ' ')}</Badge></TableCell>
                                            <TableCell className="max-w-xs truncate">{s.text || s.quizQuestion || s.imageUrl || s.featureTitle}</TableCell>
                                            <TableCell className="text-right">
                                                 <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Delete this surprise?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteDailySurprise(s.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {dailySurprises.length === 0 && <TableRow><TableCell colSpan={3} className="h-24 text-center">No surprises yet.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                 </div>
            </AccordionContent>
          </Card>
        </AccordionItem>
        
        {/* Resource Management */}
         <AccordionItem value="resource-management" className="border-b-0">
            <Card>
              <AccordionTrigger className="p-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Resource Management</h3>
                    <p className="text-sm text-muted-foreground text-left">Manage resource sections and individual resources.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0 space-y-8">
                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Add/Edit Resource Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FolderPlus /> Create New Resource Section</CardTitle>
                        <CardDescription>Create a new category for premium resources that users can unlock.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSectionFormSubmit} className="space-y-4">
                           <div className="space-y-2"><Label htmlFor="section-parent">Parent Category</Label>
                                <Select value={sectionParentCategory} onValueChange={(v: any) => setSectionParentCategory(v)}>
                                    <SelectTrigger id="section-parent"><SelectValue placeholder="Select a parent category..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="class-10">Class 10</SelectItem>
                                        <SelectItem value="class-12">Class 12</SelectItem>
                                        <SelectItem value="jee">JEE</SelectItem>
                                        <SelectItem value="neet">NEET</SelectItem>
                                        <SelectItem value="class-6-9">Class 6-9</SelectItem>
                                        <SelectItem value="general">General</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                          <div className="space-y-2">
                            <Label htmlFor="section-name">Section Name</Label>
                            <Input id="section-name" value={sectionName} onChange={e => setSectionName(e.target.value)} placeholder="e.g., JEE Advanced Prep" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="section-description">Description</Label>
                            <Textarea id="section-description" value={sectionDescription} onChange={e => setSectionDescription(e.target.value)} placeholder="A short description of this section." required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="section-unlock-cost">Unlock Cost (Credits)</Label>
                            <Input id="section-unlock-cost" type="number" value={sectionUnlockCost} onChange={e => setSectionUnlockCost(Number(e.target.value))} required />
                          </div>
                          <Button type="submit"><PlusCircle className="mr-2 h-4 w-4" /> Create Section</Button>
                        </form>
                      </CardContent>
                    </Card>
                     {/* Manage Existing Sections */}
                    <Card>
                       <CardHeader><CardTitle>Manage Sections</CardTitle></CardHeader>
                       <CardContent>
                           <Table>
                               <TableHeader>
                                   <TableRow>
                                       <TableHead>Name</TableHead>
                                       <TableHead>Parent</TableHead>
                                       <TableHead>Cost</TableHead>
                                       <TableHead className="text-right">Actions</TableHead>
                                   </TableRow>
                               </TableHeader>
                               <TableBody>
                                   {resourceSections.map(section => (
                                       <TableRow key={section.id}>
                                           <TableCell className="font-medium">{section.name}</TableCell>
                                           <TableCell><Badge variant="secondary" className="capitalize">{section.parentCategory}</Badge></TableCell>
                                           <TableCell>{section.unlockCost} credits</TableCell>
                                           <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => openEditDialog(section)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the section and all resources inside it. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteResourceSection(section.id)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                           </TableCell>
                                       </TableRow>
                                   ))}
                                   {resourceSections.length === 0 && <TableRow><TableCell colSpan={4} className="h-24 text-center">No premium sections created yet.</TableCell></TableRow>}
                               </TableBody>
                           </Table>
                       </CardContent>
                    </Card>
                </div>
                 <div className="grid gap-8 lg:grid-cols-2">
                    <Card>
                      <CardHeader><CardTitle>Add New Resource</CardTitle></CardHeader>
                      <CardContent>
                        <form onSubmit={handleResourceFormSubmit} className="space-y-4">
                          <div className="space-y-2"><Label htmlFor="resource-title">Title</Label><Input id="resource-title" value={resourceTitle} onChange={e => setResourceTitle(e.target.value)} placeholder="e.g. Physics Formula Sheet" required /></div>
                          <div className="space-y-2"><Label htmlFor="resource-description">Description</Label><Textarea id="resource-description" value={resourceDescription} onChange={e => setResourceDescription(e.target.value)} placeholder="A short description of the resource." required /></div>
                          <div className="space-y-2"><Label htmlFor="resource-url">URL</Label><Input id="resource-url" name="url" type="url" value={resourceUrl} onChange={e => setResourceUrl(e.target.value)} placeholder="https://example.com/file.pdf" required /></div>
                          <div className="space-y-2"><Label htmlFor="resource-section">Section</Label>
                            <Select value={resourceSectionId} onValueChange={setResourceSectionId}>
                                <SelectTrigger id="resource-section"><SelectValue placeholder="Select a section..." /></SelectTrigger>
                                <SelectContent>
                                    {resourceSections.map(section => (
                                        <SelectItem key={section.id} value={section.id}>{section.name} ({section.parentCategory})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                          </div>
                          <Button type="submit"><PlusCircle className="mr-2 h-4 w-4" /> Add Resource</Button>
                        </form>
                      </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>All Resources</CardTitle><CardDescription>Manage all available resources.</CardDescription></CardHeader>
                        <CardContent>
                           <Table>
                               <TableHeader>
                                   <TableRow>
                                       <TableHead>Title</TableHead>
                                       <TableHead className="text-right">Actions</TableHead>
                                   </TableRow>
                               </TableHeader>
                               <TableBody>
                                   {allResources.map((resource) => (
                                       <TableRow key={resource.id}>
                                           <TableCell className="font-medium">{resource.title}</TableCell>
                                           <TableCell className="text-right space-x-2">
                                               <Button variant="outline" size="sm" onClick={() => openEditDialog({...resource, type: 'general'})}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                                               <AlertDialog>
                                                   <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button></AlertDialogTrigger>
                                                   <AlertDialogContent>
                                                       <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the resource.</AlertDialogDescription></AlertDialogHeader>
                                                       <AlertDialogFooter>
                                                           <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                           <AlertDialogAction onClick={() => deleteResource(resource.id)}>Delete</AlertDialogAction>
                                                       </AlertDialogFooter>
                                                   </AlertDialogContent>
                                               </AlertDialog>
                                           </TableCell>
                                       </TableRow>
                                   ))}
                                   {allResources.length === 0 && <TableRow><TableCell colSpan={2} className="h-24 text-center">No resources found.</TableCell></TableRow>}
                               </TableBody>
                           </Table>
                        </CardContent>
                    </Card>
                  </div>
              </AccordionContent>
            </Card>
        </AccordionItem>

         {/* Quiz Management */}
         <AccordionItem value="quiz-management" className="border-b-0">
            <Card>
              <AccordionTrigger className="p-6">
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Quiz Management</h3>
                    <p className="text-sm text-muted-foreground text-left">Create and delete quizzes for the Quiz Zone.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <div className="grid gap-8 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> AI Quiz Generator</CardTitle>
                        <CardDescription>Generate a quiz automatically by providing a topic.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="ai-quiz-topic">Topic</Label>
                          <Input id="ai-quiz-topic" value={aiQuizTopic} onChange={(e) => setAiQuizTopic(e.target.value)} placeholder="e.g., The Mughal Empire" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ai-num-questions">Number of Questions</Label>
                          <Input id="ai-num-questions" type="number" value={aiNumQuestions} onChange={(e) => setAiNumQuestions(Math.max(1, Math.min(20, Number(e.target.value))))} />
                        </div>
                        <Button onClick={handleGenerateQuiz} disabled={isGeneratingQuiz}>
                          {isGeneratingQuiz ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                          {isGeneratingQuiz ? 'Generating...' : 'Generate Quiz'}
                        </Button>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>Quiz Management</CardTitle><CardDescription>Review and delete existing quizzes.</CardDescription></CardHeader>
                      <CardContent>
                          <Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Questions</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                              <TableBody>{quizzes.map((quiz) => (<TableRow key={quiz.id}><TableCell className="font-medium">{quiz.title}</TableCell><TableCell>{quiz.category}</TableCell><TableCell>{quiz.questions.length}</TableCell><TableCell className="text-right"><AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/> Delete</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><AlertTriangle/>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the<span className="font-semibold text-foreground"> {quiz.title} </span> quiz and remove it from the database.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteQuiz(quiz.id)}>Yes, delete quiz</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></TableCell></TableRow>))}
                                  {quizzes.length === 0 && (<TableRow><TableCell colSpan={4} className="h-24 text-center">No quizzes created yet.</TableCell></TableRow>)}
                              </TableBody>
                          </Table>
                      </CardContent>
                  </Card>
                </div>
                 <div className="grid gap-8 lg:grid-cols-1 mt-8">
                    <Card>
                      <CardHeader><CardTitle>Create/Edit Quiz Manually</CardTitle><CardDescription>Build and publish a new quiz for the Quiz Zone or edit the one generated by AI.</CardDescription></CardHeader>
                      <CardContent className="space-y-6">
                          <div className="grid md:grid-cols-3 gap-4">
                              <div className="space-y-2 md:col-span-2"><Label htmlFor="quiz-title">Quiz Title</Label><Input id="quiz-title" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="e.g. The Ultimate Anime Quiz" /></div>
                              <div className="space-y-2"><Label htmlFor="quiz-category">Category</Label><Input id="quiz-category" value={quizCategory} onChange={e => setQuizCategory(e.target.value)} placeholder="e.g. Anime or Study Quiz" /></div>
                          </div>
                          <div className="space-y-2"><Label htmlFor="quiz-time-limit">Time Limit (seconds)</Label><Input id="quiz-time-limit" type="number" value={quizTimeLimit} onChange={e => setQuizTimeLimit(Number(e.target.value))} placeholder="e.g. 300" /></div>
                          <div className="space-y-4">{quizQuestions.map((q, qIndex) => (<div key={qIndex} className="p-4 border rounded-lg space-y-4 relative">{quizQuestions.length > 1 && (<Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeQuestion(qIndex)}><Trash2 className="h-4 w-4" /></Button>)}<div className="space-y-2"><Label htmlFor={`q-text-${qIndex}`}>Question {qIndex + 1}</Label><Input id={`q-text-${qIndex}`} value={q.text} onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)} placeholder="e.g. Who is the main protagonist of 'Attack on Titan'?" /></div><div className="grid grid-cols-2 gap-4">{q.options.map((opt, oIndex) => (<div className="space-y-2" key={oIndex}><Label htmlFor={`q-${qIndex}-opt-${oIndex}`}>Option {oIndex + 1}</Label><Input id={`q-${qIndex}-opt-${oIndex}`} value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder={`Option ${oIndex + 1}`} /></div>))}</div><div className="space-y-2"><Label htmlFor={`q-correct-${qIndex}`}>Correct Answer</Label><Select value={q.correctAnswer} onValueChange={val => handleQuestionChange(qIndex, 'correctAnswer', val)}><SelectTrigger id={`q-correct-${qIndex}`}><SelectValue placeholder="Select correct answer..." /></SelectTrigger><SelectContent>{q.options.filter(o => o.trim() !== '').map((opt, oIndex) => (<SelectItem key={oIndex} value={opt}>{opt}</SelectItem>))}</SelectContent></Select></div></div>))}</div>
                          <div className="flex justify-between items-center"><Button variant="outline" onClick={addQuestion}>Add Another Question</Button><Button onClick={handleSaveQuiz} disabled={isSavingQuiz}>{isSavingQuiz ? 'Saving...' : 'Save Quiz'}</Button></div>
                      </CardContent>
                  </Card>
                 </div>
              </AccordionContent>
            </Card>
        </AccordionItem>

      </Accordion>

        <Dialog open={isEditDialogOpen} onOpenChange={closeEditDialog}>
            <DialogContent>
                <DialogHeader><DialogTitle>Edit {editingItem && 'sectionId' in editingItem ? 'Resource' : 'Section'}</DialogTitle></DialogHeader>
                <form onSubmit={handleEditFormSubmit} className="space-y-4">
                    {editingItem && 'sectionId' in editingItem && editingItem.type === 'general' ? (
                        <>
                            <div className="space-y-2"><Label htmlFor="edit-title">Title</Label><Input id="edit-title" name="title" defaultValue={editingItem?.title} required /></div>
                            <div className="space-y-2"><Label htmlFor="edit-description">Description</Label><Textarea id="edit-description" name="description" defaultValue={editingItem?.description} required /></div>
                            <div className="space-y-2"><Label htmlFor="edit-url">URL</Label><Input id="edit-url" name="url" type="url" defaultValue={editingItem?.url} required /></div>
                        </>
                    ) : editingItem && 'name' in editingItem ? (
                         <>
                            <div className="space-y-2"><Label htmlFor="edit-name">Section Name</Label><Input id="edit-name" name="name" defaultValue={editingItem?.name} required /></div>
                            <div className="space-y-2"><Label htmlFor="edit-sec-description">Description</Label><Textarea id="edit-sec-description" name="description" defaultValue={editingItem?.description} required /></div>
                            <div className="space-y-2"><Label htmlFor="edit-unlockCost">Unlock Cost</Label><Input id="edit-unlockCost" name="unlockCost" type="number" defaultValue={editingItem?.unlockCost} required /></div>
                             <div className="space-y-2"><Label htmlFor="edit-section-parent">Parent Category</Label>
                                <Select name="parentCategory" defaultValue={editingItem?.parentCategory}>
                                    <SelectTrigger id="edit-section-parent"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="class-10">Class 10</SelectItem>
                                        <SelectItem value="class-12">Class 12</SelectItem>
                                        <SelectItem value="jee">JEE</SelectItem>
                                        <SelectItem value="neet">NEET</SelectItem>
                                        <SelectItem value="class-6-9">Class 6-9</SelectItem>
                                        <SelectItem value="general">General</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    ) : null}
                    <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button type="submit">Save Changes</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
  );
}

    