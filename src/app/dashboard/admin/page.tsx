

'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAdmin, type Resource, type DailySurprise, type ResourceSection, type SupportTicket, type FeatureShowcase, type ShowcaseTemplate } from '@/hooks/use-admin';
import { useReferrals, type ReferralRequest } from '@/hooks/use-referrals';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Send, Trash2, MinusCircle, Vote, AlertTriangle, Edit, Lock, Unlock, Gift, RefreshCcw, Users, Megaphone, BookOpen, ClipboardCheck, KeyRound, ShieldCheck, UserCog, DollarSign, Wallet, ShieldX, Lightbulb, Image as ImageIcon, Mic, MessageSquare, FolderPlus, Sparkles, Loader2, Gamepad, Award, Zap, Gamepad2 as Gamepad2Icon, BrainCircuit, Trophy, BookOpen as BookOpenIcon, Clock, LineChart, Upload, History, MailQuestion, CheckCircle, Star, Swords, UserPlus, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuizzes, type QuizCategory } from '@/hooks/use-quizzes';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { z } from 'zod';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { sendNotification } from '@/ai/flows/notify-flow';


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
    "Gamepad2": Gamepad2Icon,
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
    "Game Zone": "/dashboard/game-zone",
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

const QuizQuestionSchema = z.object({
  text: z.string().min(1, "Question text cannot be empty."),
  options: z.array(z.string().min(1)).min(2, "Cannot have more than 4 options.").max(4, "Cannot have more than 4 options."),
  correctAnswer: z.string().min(1, "Correct answer cannot be empty."),
}).refine(data => data.options.includes(data.correctAnswer), {
  message: "Correct answer must be one of the options.",
  path: ["correctAnswer"],
});

const quizCategories: QuizCategory[] = [
    'general', 'jee-neet', 'sports-gk', 'movies-anime', 'exam-mcq'
];

const QuizImportSchema = z.object({
  title: z.string().min(1, "Quiz title is required."),
  category: z.enum(quizCategories),
  timeLimit: z.number().int().positive("Time limit must be a positive number."),
  entryFee: z.number().int().nonnegative("Entry fee cannot be negative."),
  reward: z.number().int().positive("Reward must be a positive number."),
  questions: z.array(QuizQuestionSchema).min(1, "Quiz must have at least one question."),
});


export default function AdminPanelPage() {
  const { 
    isAdmin, 
    isSuperAdmin,
    users,
    announcements, addAnnouncement, deleteAnnouncement, 
    allPolls, addPoll, deletePoll, setActivePoll,
    resources: allResources, addResource, updateResource, deleteResource,
    resourceSections, addResourceSection, updateResourceSection, deleteResourceSection,
    dailySurprises, addDailySurprise, deleteDailySurprise,
    supportTickets, updateTicketStatus, deleteTicket,
    featureShowcases, addFeatureShowcase, updateFeatureShowcase, deleteFeatureShowcase
  } = useAdmin();
  const { pendingReferrals, approveReferral, declineReferral, loading: referralsLoading } = useReferrals();
  const { quizzes, deleteQuiz } = useQuizzes();
  const { toast } = useToast();

  // State for Announcement
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementDesc, setNewAnnouncementDesc] = useState('');
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  
  // State for Poll
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);
  const [newPollCommentsEnabled, setNewPollCommentsEnabled] = useState(false);
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);

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
  const [isImporting, setIsImporting] = useState(false);

  // State for Quiz
  const [quizTitle, setQuizTitle] = useState('');
  const [quizCategory, setQuizCategory] = useState<QuizCategory>('general');
  const [quizTimeLimit, setQuizTimeLimit] = useState(300);
  const [quizEntryFee, setQuizEntryFee] = useState(0);
  const [quizReward, setQuizReward] = useState(5);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    { text: '', options: ['', '', '', ''], correctAnswer: '' }
  ]);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  
    // State for Showcase
  const [showcaseTitle, setShowcaseTitle] = useState('');
  const [showcaseDesc, setShowcaseDesc] = useState('');
  const [showcaseDate, setShowcaseDate] = useState('');
  const [showcaseTemplate, setShowcaseTemplate] = useState<ShowcaseTemplate>('cosmic-blue');
  const [isEditShowcaseOpen, setIsEditShowcaseOpen] = useState(false);
  const [editingShowcase, setEditingShowcase] = useState<FeatureShowcase | null>(null);
  const [showcaseStatus, setShowcaseStatus] = useState<FeatureShowcase['status']>('upcoming');
  const [showcaseLink, setShowcaseLink] = useState('');


  const handleAddAnnouncement = async () => {
    if (!newAnnouncementTitle.trim() || !newAnnouncementDesc.trim()) {
        toast({ variant: 'destructive', title: "Validation Error", description: "Please fill in both title and description for the announcement." });
        return;
    }
    setIsCreatingAnnouncement(true);
    try {
        await addAnnouncement({
            title: newAnnouncementTitle,
            description: newAnnouncementDesc,
        });
        
        // Trigger push notification
        await sendNotification({ title: newAnnouncementTitle, body: newAnnouncementDesc });

        toast({ title: "Announcement Published!", description: "The new announcement is live and notifications have been sent." });
        setNewAnnouncementTitle('');
        setNewAnnouncementDesc('');
    } catch (error: any) {
        toast({ variant: 'destructive', title: "Error Creating Announcement", description: error.message });
    } finally {
        setIsCreatingAnnouncement(false);
    }
  };
  
    const handleAddPoll = async () => {
        if (!newPollQuestion.trim() || newPollOptions.some(o => !o.trim())) {
            toast({ variant: 'destructive', title: "Validation Error", description: "Please fill in the poll question and all options." });
            return;
        }
        setIsCreatingPoll(true);
        try {
            await addPoll({
                question: newPollQuestion,
                options: newPollOptions,
                commentsEnabled: newPollCommentsEnabled,
            });
            toast({ title: "Poll Created!", description: "The new poll is now available to be activated." });
            setNewPollQuestion('');
            setNewPollOptions(['', '']);
            setNewPollCommentsEnabled(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error Creating Poll", description: error.message });
        } finally {
            setIsCreatingPoll(false);
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
            if (!surpriseFeature.title || !surpriseFeature.route) return toast({ variant: 'destructive', title: 'Feature details are incomplete' });
            surpriseData = { 
                type: 'new-feature', 
                featureTitle: surpriseFeature.title,
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
              category: quizCategory,
              timeLimit: quizTimeLimit,
              entryFee: quizEntryFee,
              reward: quizReward,
              questions: quizQuestions,
              createdAt: new Date().toISOString(),
          });
          toast({ title: "Quiz Saved!", description: "The new quiz has been added to the database." });
          setQuizTitle('');
          setQuizCategory('general');
          setQuizTimeLimit(300);
          setQuizEntryFee(0);
          setQuizReward(5);
          setQuizQuestions([{ text: '', options: ['', '', '', ''], correctAnswer: '' }]);
      } catch (error: any) {
          toast({ variant: 'destructive', title: "Error Saving Quiz", description: error.message });
      } finally {
          setIsSavingQuiz(false);
      }
  }

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...newPollOptions];
    newOptions[index] = value;
    setNewPollOptions(newOptions);
  };

  const addPollOption = () => {
    setNewPollOptions([...newPollOptions, '']);
  };

  const removePollOption = (index: number) => {
    if (newPollOptions.length <= 2) return;
    const newOptions = newPollOptions.filter((_, i) => i !== index);
    setNewPollOptions(newOptions);
  };
  
  const handleDeleteQuiz = async (quizId: string) => {
      try {
          await deleteQuiz(quizId);
          toast({ title: "Quiz Deleted", description: "The quiz has been removed from the database." });
      } catch (error: any) {
          toast({ variant: 'destructive', title: "Error Deleting Quiz", description: error.message });
      }
  }

  const handleQuizImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
        toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please upload a valid .json file.' });
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const content = e.target?.result;
        if (typeof content !== 'string') return;
        
        setIsImporting(true);
        try {
            const jsonData = JSON.parse(content);
            const validationResult = QuizImportSchema.safeParse(jsonData);

            if (!validationResult.success) {
                const errorMessage = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');
                console.error("Validation Error:", validationResult.error.flatten());
                toast({ variant: 'destructive', title: 'Invalid JSON Format', description: errorMessage, duration: 10000 });
                return;
            }

            const quizData = validationResult.data;
            await addDoc(collection(db, 'quizzes'), {
                ...quizData,
                createdAt: new Date().toISOString(),
            });

            toast({ title: "Quiz Imported Successfully!", description: `"${quizData.title}" has been added.` });

        } catch (error: any) {
            if (error instanceof z.ZodError) {
                toast({ variant: 'destructive', title: 'Validation Error', description: error.errors.map(e => e.message).join(', ') });
            } else if (error instanceof SyntaxError) {
                 toast({ variant: 'destructive', title: 'JSON Syntax Error', description: 'The provided file is not valid JSON.' });
            }
            else {
                toast({ variant: 'destructive', title: 'Import Failed', description: error.message });
            }
        } finally {
            setIsImporting(false);
            event.target.value = ''; // Reset file input
        }
    };
    reader.readAsText(file);
};

  const handleApproveReferral = async (referral: ReferralRequest) => {
      try {
          await approveReferral(referral);
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Approval Failed', description: error.message });
      }
  }
  
  const handleDeclineReferral = async (referralId: string) => {
       try {
          await declineReferral(referralId);
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Decline Failed', description: error.message });
      }
  }

  const handleSaveShowcase = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!showcaseTitle.trim() || !showcaseDesc.trim()) {
          toast({ variant: 'destructive', title: 'Title and Description are required.' });
          return;
      }
      
      try {
        if (editingShowcase) {
            // Update existing
            await updateFeatureShowcase(editingShowcase.id, {
                title: showcaseTitle,
                description: showcaseDesc,
                launchDate: showcaseDate || undefined,
                template: showcaseTemplate,
                status: showcaseStatus,
                link: showcaseLink || undefined,
            });
            toast({ title: "Feature Showcase Updated!" });
        } else {
            // Add new
            await addFeatureShowcase({
                title: showcaseTitle,
                description: showcaseDesc,
                launchDate: showcaseDate || undefined,
                template: showcaseTemplate,
                status: showcaseStatus,
                link: showcaseLink || undefined,
            });
            toast({ title: "Feature Showcase Added!" });
        }
        
        closeShowcaseDialog();

      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
      }
  }

  const openShowcaseDialog = (showcase: FeatureShowcase | null) => {
    if (showcase) {
        setEditingShowcase(showcase);
        setShowcaseTitle(showcase.title);
        setShowcaseDesc(showcase.description);
        setShowcaseDate(showcase.launchDate ? showcase.launchDate.split('T')[0] : '');
        setShowcaseTemplate(showcase.template);
        setShowcaseStatus(showcase.status);
        setShowcaseLink(showcase.link || '');
    } else {
        setEditingShowcase(null);
        setShowcaseTitle('');
        setShowcaseDesc('');
        setShowcaseDate('');
        setShowcaseTemplate('cosmic-blue');
        setShowcaseStatus('upcoming');
        setShowcaseLink('');
    }
    setIsEditShowcaseOpen(true);
  };

  const closeShowcaseDialog = () => {
    setIsEditShowcaseOpen(false);
    setEditingShowcase(null);
  };

  if (!isAdmin && !isSuperAdmin) {
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

  const jsonExample = `
{
  "title": "History 101",
  "category": "general",
  "timeLimit": 600,
  "entryFee": 0,
  "reward": 10,
  "questions": [
    {
      "text": "In which year did World War II end?",
      "options": ["1942", "1945", "1950", "1939"],
      "correctAnswer": "1945"
    },
    {
      "text": "Who was the first US President?",
      "options": ["A. Lincoln", "G. Washington"],
      "correctAnswer": "G. Washington"
    }
  ]
}
`.trim();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">Manage application content and settings.</p>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>App Statistics</CardTitle>
        </CardHeader>
        <CardContent>
             <div className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="font-bold">Total Users:</span>
                <span>{users.length}</span>
            </div>
        </CardContent>
      </Card>


      <Accordion type="multiple" defaultValue={['content-management']} className="w-full space-y-4">
        
        {/* Showcase Management */}
        <AccordionItem value="showcase-management" className="border-b-0">
          <Card>
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <Megaphone className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Feature Showcase Management</h3>
                  <p className="text-sm text-muted-foreground text-left">Create and manage pre-launch announcement banners.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-4">
                <div className="text-right">
                    <Button onClick={() => openShowcaseDialog(null)}>Add New Showcase</Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Existing Showcases</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Launch Date</TableHead>
                                    <TableHead>Template</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {featureShowcases.map(sc => (
                                    <TableRow key={sc.id}>
                                        <TableCell>{sc.title}</TableCell>
                                        <TableCell>
                                            <Badge variant={sc.status === 'live' ? 'default' : 'secondary'} className="capitalize">
                                                {sc.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{sc.launchDate ? format(parseISO(sc.launchDate), 'PPP') : 'Not set'}</TableCell>
                                        <TableCell><Badge variant="outline" className="capitalize">{sc.template.replace(/-/g, ' ')}</Badge></TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => openShowcaseDialog(sc)}><Edit className="h-4 w-4 mr-2"/> Edit</Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4 mr-2"/> Delete</Button></AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Delete this showcase?</AlertDialogTitle><AlertDialogDescription>This action is permanent and cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteFeatureShowcase(sc.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {featureShowcases.length === 0 && <TableRow><TableCell colSpan={5} className="h-24 text-center">No showcases created yet.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </AccordionContent>
          </Card>
        </AccordionItem>

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
            <AccordionContent className="p-6 pt-0 grid grid-cols-1 gap-8">
              <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                  <Card>
                    <CardHeader><CardTitle>Create New Announcement</CardTitle><CardDescription>Post a new announcement. It will appear at the top of the list.</CardDescription></CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2"><Label htmlFor="announcement-title">Title</Label><Input id="announcement-title" name="title" value={newAnnouncementTitle} onChange={(e) => setNewAnnouncementTitle(e.target.value)} required /></div>
                        <div className="space-y-2"><Label htmlFor="announcement-description">Description</Label><Textarea id="announcement-description" name="description" value={newAnnouncementDesc} onChange={(e) => setNewAnnouncementDesc(e.target.value)} required /></div>
                        <Button onClick={handleAddAnnouncement} disabled={isCreatingAnnouncement}><Send className="mr-2 h-4 w-4" /> {isCreatingAnnouncement ? 'Publishing...' : 'Publish Announcement'}</Button>
                      </div>
                    </CardContent>
                  </Card>
                   <Card>
                    <CardHeader><CardTitle>Create New Community Poll</CardTitle><CardDescription>Create a new poll. You can activate it from the list below.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2"><Label htmlFor="poll-question">Poll Question</Label><Input id="poll-question" value={newPollQuestion} onChange={e => setNewPollQuestion(e.target.value)} placeholder="e.g. What feature should we build next?" /></div>
                      <div className="space-y-2"><Label>Options</Label>
                        {newPollOptions.map((option, index) => (<div key={index} className="flex items-center gap-2"><Input value={option} onChange={e => handlePollOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`} />{newPollOptions.length > 2 && (<Button variant="ghost" size="icon" onClick={() => removePollOption(index)}><MinusCircle className="h-4 w-4 text-destructive" /></Button>)}</div>))}
                      </div>
                       <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-2">
                           <Switch id="poll-comments" checked={newPollCommentsEnabled} onCheckedChange={setNewPollCommentsEnabled} />
                           <Label htmlFor="poll-comments">Enable Comments</Label>
                         </div>
                         <Button variant="outline" onClick={addPollOption}><PlusCircle className="mr-2 h-4 w-4" /> Add Option</Button>
                       </div>
                      <div className="flex justify-end"><Button onClick={handleAddPoll} disabled={isCreatingPoll}><Vote className="mr-2 h-4 w-4" /> {isCreatingPoll ? 'Saving...' : 'Save New Poll'}</Button></div>
                    </CardContent>
                  </Card>
                </div>
                 <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>Manage Announcements</CardTitle></CardHeader>
                        <CardContent>
                            <div className="max-w-full overflow-x-auto">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {announcements.map(ann => (
                                            <TableRow key={ann.id}>
                                                <TableCell className="font-medium max-w-sm truncate">{ann.title}</TableCell>
                                                <TableCell>{formatDistanceToNow(ann.createdAt, { addSuffix: true })}</TableCell>
                                                <TableCell className="text-right">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/>Delete</Button></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader><AlertDialogTitle>Delete this announcement?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteAnnouncement(ann.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {announcements.length === 0 && <TableRow><TableCell colSpan={3} className="h-24 text-center">No announcements posted.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Manage Polls</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="max-w-full overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Question</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Votes</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allPolls.map(poll => (
                                            <TableRow key={poll.id}>
                                                <TableCell className="font-medium max-w-sm truncate">{poll.question}</TableCell>
                                                <TableCell>
                                                    <Badge variant={poll.isActive ? 'default' : 'secondary'}>
                                                        {poll.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                 <TableCell>
                                                    {Object.values(poll.results).reduce((sum, count) => sum + count, 0)}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2 whitespace-nowrap">
                                                    {!poll.isActive && (
                                                        <Button variant="outline" size="sm" onClick={() => setActivePoll(poll.id)}>
                                                            <Star className="mr-2 h-4 w-4"/>Set Active
                                                        </Button>
                                                    )}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/>Delete</Button></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete this poll?</AlertDialogTitle>
                                                                <AlertDialogDescription>This will permanently delete the poll and all its associated votes. This cannot be undone.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => deletePoll(poll.id)}>Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {allPolls.length === 0 && <TableRow><TableCell colSpan={4} className="h-24 text-center">No polls created yet.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                 </div>
                 <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
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
                                        <SelectItem value="meme"><ImageIcon className="mr-2 h-4 w-4" /> Meme</SelectItem>
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
                                    <div className="space-y-2"><Label>Feature Title</Label><Input value={surpriseFeature.title} onChange={e => setSurpriseFeature(p => ({...p, title: e.target.value}))} placeholder="e.g., Game Zone"/></div>
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
                             <div className="max-w-full overflow-x-auto">
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
                                                <TableCell><Badge variant="secondary" className="capitalize whitespace-nowrap">{s.type.replace('-', ' ')}</Badge></TableCell>
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
                             </div>
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
              <AccordionContent className="p-6 pt-0 grid grid-cols-1 gap-8">
                <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
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
                           <div className="max-w-full overflow-x-auto">
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
                                               <TableCell className="font-medium whitespace-nowrap">{section.name}</TableCell>
                                               <TableCell><Badge variant="secondary" className="capitalize whitespace-nowrap">{section.parentCategory}</Badge></TableCell>
                                               <TableCell className="whitespace-nowrap">{section.unlockCost} credits</TableCell>
                                               <TableCell className="text-right space-x-2 whitespace-nowrap">
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
                           </div>
                       </CardContent>
                    </Card>
                </div>
                 <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
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
                           <div className="max-w-full overflow-x-auto">
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
                                               <TableCell className="font-medium whitespace-nowrap">{resource.title}</TableCell>
                                               <TableCell className="text-right space-x-2 whitespace-nowrap">
                                                   <Button variant="outline" size="sm" onClick={() => openEditDialog({...resource, type: 'general'})}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                                                   <AlertDialog>
                                                       <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button></AlertDialogTrigger>
                                                       <AlertDialogContent>
                                                           <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the resource.</AlertDialogDescription></AlertDialogHeader>
                                                           <AlertDialogFooter>
                                                               <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                               <AlertDialogAction onClick={() => deleteResource(resource.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                                       </AlertDialogContent>
                                                   </AlertDialog>
                                               </TableCell>
                                           </TableRow>
                                       ))}
                                       {allResources.length === 0 && <TableRow><TableCell colSpan={2} className="h-24 text-center">No resources found.</TableCell></TableRow>}
                                   </TableBody>
                               </Table>
                           </div>
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
              <AccordionContent className="p-6 pt-0 grid grid-cols-1 gap-8">
                  <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                      <Card>
                          <CardHeader><CardTitle>Existing Quizzes</CardTitle><CardDescription>Review and delete existing quizzes.</CardDescription></CardHeader>
                          <CardContent>
                             <div className="max-w-full overflow-x-auto">
                                <Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Questions</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                    <TableBody>{quizzes.map((quiz) => (<TableRow key={quiz.id}><TableCell className="font-medium whitespace-nowrap">{quiz.title}</TableCell><TableCell className="whitespace-nowrap">{quiz.category}</TableCell><TableCell>{quiz.questions.length}</TableCell><TableCell className="text-right"><AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/> Delete</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><AlertTriangle/>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the<span className="font-semibold text-foreground"> {quiz.title} </span> quiz and remove it from the database.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteQuiz(quiz.id)}>Yes, delete quiz</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></TableCell></TableRow>))}
                                        {quizzes.length === 0 && (<TableRow><TableCell colSpan={4} className="h-24 text-center">No quizzes created yet.</TableCell></TableRow>)}
                                    </TableBody>
                                </Table>
                             </div>
                          </CardContent>
                      </Card>
                      <Card>
                          <CardHeader><CardTitle>Import Quiz from JSON</CardTitle><CardDescription>Upload a .json file to quickly add a new quiz.</CardDescription></CardHeader>
                          <CardContent className="space-y-4">
                              <div>
                                  <Label htmlFor="quiz-import" className="sr-only">Import Quiz</Label>
                                  <Input id="quiz-import" type="file" accept=".json" onChange={handleQuizImport} disabled={isImporting} />
                              </div>
                              {isImporting && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> Validating and importing...</p>}
                              <Accordion type="single" collapsible>
                                  <AccordionItem value="format-guide">
                                      <AccordionTrigger className="text-sm">View JSON Format Guide</AccordionTrigger>
                                      <AccordionContent>
                                          <p className="text-xs text-muted-foreground mb-2">Your JSON file must match this structure:</p>
                                          <pre className="p-2 bg-muted rounded-md text-xs whitespace-pre-wrap">{jsonExample}</pre>
                                      </AccordionContent>
                                  </AccordionItem>
                              </Accordion>
                          </CardContent>
                      </Card>
                  </div>
                 <div className="grid grid-cols-1 gap-8 mt-8">
                    <Card>
                      <CardHeader><CardTitle>Create/Edit Quiz Manually</CardTitle><CardDescription>Build and publish a new quiz for the Quiz Zone.</CardDescription></CardHeader>
                      <CardContent className="space-y-6">
                          <div className="grid md:grid-cols-3 gap-4">
                              <div className="space-y-2 md:col-span-2"><Label htmlFor="quiz-title">Quiz Title</Label><Input id="quiz-title" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="e.g. The Ultimate Anime Quiz" /></div>
                              <div className="space-y-2"><Label htmlFor="quiz-category">Category</Label>
                                <Select value={quizCategory} onValueChange={(v: QuizCategory) => setQuizCategory(v)}>
                                    <SelectTrigger id="quiz-category"><SelectValue placeholder="Select a category..."/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="jee-neet">JEE/NEET Level</SelectItem>
                                        <SelectItem value="sports-gk">Sports &amp; GK</SelectItem>
                                        <SelectItem value="movies-anime">Movies, Webseries &amp; Anime</SelectItem>
                                        <SelectItem value="exam-mcq">Exam Top MCQ (10th/12th)</SelectItem>
                                    </SelectContent>
                                </Select>
                              </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label htmlFor="quiz-time-limit">Time Limit (seconds)</Label><Input id="quiz-time-limit" type="number" value={quizTimeLimit} onChange={e => setQuizTimeLimit(Number(e.target.value))} placeholder="e.g. 300" /></div>
                            <div className="space-y-2"><Label htmlFor="quiz-entry-fee">Entry Fee (Credits)</Label><Input id="quiz-entry-fee" type="number" value={quizEntryFee} onChange={e => setQuizEntryFee(Number(e.target.value))} placeholder="e.g. 0" /></div>
                            <div className="space-y-2"><Label htmlFor="quiz-reward">Perfect Score Reward (Credits)</Label><Input id="quiz-reward" type="number" value={quizReward} onChange={e => setQuizReward(Number(e.target.value))} placeholder="e.g. 5" /></div>
                          </div>
                          <div className="space-y-4">{quizQuestions.map((q, qIndex) => (<div key={qIndex} className="p-4 border rounded-lg space-y-4 relative">{quizQuestions.length > 1 && (<Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeQuestion(qIndex)}><Trash2 className="h-4 w-4" /></Button>)}<div className="space-y-2"><Label htmlFor={`q-text-${qIndex}`}>Question {qIndex + 1}</Label><Input id={`q-text-${qIndex}`} value={q.text} onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)} placeholder="e.g. Who is the main protagonist of 'Attack on Titan'?" /></div><div className="grid grid-cols-2 gap-4">{q.options.map((opt, oIndex) => (<div className="space-y-2" key={oIndex}><Label htmlFor={`q-${qIndex}-opt-${oIndex}`}>Option {oIndex + 1}</Label><Input id={`q-${qIndex}-opt-${oIndex}`} value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder={`Option ${oIndex + 1}`} /></div>))}</div><div className="space-y-2"><Label htmlFor={`q-correct-${qIndex}`}>Correct Answer</Label><Select value={q.correctAnswer} onValueChange={val => handleQuestionChange(qIndex, 'correctAnswer', val)}><SelectTrigger id={`q-correct-${qIndex}`}><SelectValue placeholder="Select correct answer..." /></SelectTrigger><SelectContent>{q.options.filter(o => o.trim() !== '').map((opt, oIndex) => (<SelectItem key={oIndex} value={opt}>{opt}</SelectItem>))}</SelectContent></Select></div></div>))}</div>
                          <div className="flex justify-between items-center"><Button variant="outline" onClick={addQuestion}>Add Another Question</Button><Button onClick={handleSaveQuiz} disabled={isSavingQuiz}>{isSavingQuiz ? 'Saving...' : 'Save Quiz'}</Button></div>
                      </CardContent>
                  </Card>
                 </div>
              </AccordionContent>
            </Card>
        </AccordionItem>
        
         {/* Referral Management */}
        <AccordionItem value="referral-management" className="border-b-0">
           <Card>
              <AccordionTrigger className="p-6">
                <div className="flex items-center gap-3">
                  <UserPlus className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Referral Management</h3>
                    <p className="text-sm text-muted-foreground text-left">Approve or decline pending user referrals.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Referral Requests</CardTitle>
                        <CardDescription>Approve requests to grant 50 credits to the referrer.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Inviter</TableHead>
                                    <TableHead>New User</TableHead>
                                    <TableHead>Code Used</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {referralsLoading && (
                                    <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading requests...</TableCell></TableRow>
                                )}
                                {!referralsLoading && pendingReferrals.length === 0 && (
                                    <TableRow><TableCell colSpan={5} className="h-24 text-center">No pending referrals.</TableCell></TableRow>
                                )}
                                {pendingReferrals.map(req => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-medium">{req.referrerName}</TableCell>
                                        <TableCell>{req.newUserName}</TableCell>
                                        <TableCell><Badge variant="outline">{req.codeUsed}</Badge></TableCell>
                                        <TableCell>{formatDistanceToNow(req.createdAt.toDate(), { addSuffix: true })}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeclineReferral(req.id)}><XCircle /></Button>
                                            <Button variant="ghost" size="icon" className="text-green-500" onClick={() => handleApproveReferral(req)}><CheckCircle /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
              </AccordionContent>
            </Card>
        </AccordionItem>

        {/* Support Tickets */}
         <AccordionItem value="support-tickets" className="border-b-0">
            <Card>
                <AccordionTrigger className="p-6">
                    <div className="flex items-center gap-3">
                        <MailQuestion className="h-6 w-6 text-primary" />
                        <div>
                            <h3 className="text-lg font-semibold">Support Tickets</h3>
                            <p className="text-sm text-muted-foreground text-left">View and resolve user support requests.</p>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                    <Card>
                        <CardHeader>
                            <CardTitle>Incoming Support Tickets</CardTitle>
                            <CardDescription>
                                Total new tickets: {supportTickets.filter(t => t.status === 'new').length}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="max-w-full overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Message</TableHead>
                                            <TableHead>Received</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {supportTickets.map(ticket => (
                                            <TableRow key={ticket.id}>
                                                <TableCell className="font-medium whitespace-nowrap">{ticket.userName}</TableCell>
                                                <TableCell className="max-w-sm break-words">{ticket.message}</TableCell>
                                                <TableCell className="whitespace-nowrap">{formatDistanceToNow(ticket.createdAt.toDate(), { addSuffix: true })}</TableCell>
                                                <TableCell>
                                                    <Badge variant={ticket.status === 'resolved' ? 'default' : 'secondary'}>
                                                        {ticket.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right space-x-2 whitespace-nowrap">
                                                    {ticket.status === 'new' && (
                                                        <Button variant="outline" size="sm" onClick={() => updateTicketStatus(ticket.id, 'resolved')}>
                                                            <CheckCircle className="mr-2 h-4 w-4"/>Mark Resolved
                                                        </Button>
                                                    )}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/>Delete</Button></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete this ticket?</AlertDialogTitle>
                                                                <AlertDialogDescription>This will permanently remove the ticket. This action cannot be undone.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => deleteTicket(ticket.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                         {supportTickets.length === 0 && <TableRow><TableCell colSpan={5} className="h-24 text-center">No support tickets.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                             </div>
                        </CardContent>
                    </Card>
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
        <Dialog open={isEditShowcaseOpen} onOpenChange={closeShowcaseDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingShowcase ? 'Edit' : 'Add'} Feature Showcase</DialogTitle>
                </DialogHeader>
                <form id="showcase-form" onSubmit={handleSaveShowcase} className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sc-title">Title</Label>
                            <Input id="sc-title" value={showcaseTitle} onChange={e => setShowcaseTitle(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sc-date">Launch Date (Optional)</Label>
                            <Input id="sc-date" type="date" value={showcaseDate} onChange={e => setShowcaseDate(e.target.value)} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="sc-desc">Description</Label>
                        <Textarea id="sc-desc" value={showcaseDesc} onChange={e => setShowcaseDesc(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sc-link">Feature Link (Optional)</Label>
                        <Input id="sc-link" value={showcaseLink} onChange={e => setShowcaseLink(e.target.value)} placeholder="e.g., /dashboard/new-feature" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sc-status">Status</Label>
                            <Select value={showcaseStatus} onValueChange={(v: FeatureShowcase['status']) => setShowcaseStatus(v)}>
                                <SelectTrigger id="sc-status"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                    <SelectItem value="live">Live</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sc-template">Card Template</Label>
                            <Select value={showcaseTemplate} onValueChange={(v: ShowcaseTemplate) => setShowcaseTemplate(v)}>
                                <SelectTrigger id="sc-template"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cosmic-blue">Cosmic Blue</SelectItem>
                                    <SelectItem value="fiery-red">Fiery Red</SelectItem>
                                    <SelectItem value="golden-legend">Golden Legend</SelectItem>
                                    <SelectItem value="professional-dark">Professional Dark</SelectItem>
                                    <SelectItem value="emerald-dream">Emerald Dream</SelectItem>
                                    <SelectItem value="amethyst-haze">Amethyst Haze</SelectItem>
                                    <SelectItem value="solar-flare">Solar Flare</SelectItem>
                                    <SelectItem value="midnight-abyss">Midnight Abyss</SelectItem>
                                    <SelectItem value="rainbow-aurora">Rainbow Aurora</SelectItem>
                                    <SelectItem value="diamond-pearl">Diamond Pearl</SelectItem>
                                    <SelectItem value="cyber-grid">Cyber Grid</SelectItem>
                                    <SelectItem value="oceanic-flow">Oceanic Flow</SelectItem>
                                    <SelectItem value="synthwave-sunset">Synthwave Sunset</SelectItem>
                                    <SelectItem value="jungle-ruins">Jungle Ruins</SelectItem>
                                    <SelectItem value="black-hole">Black Hole</SelectItem>
                                    <SelectItem value="anime-speed-lines">Anime Speed Lines</SelectItem>
                                    <SelectItem value="blueprint-grid">Blueprint Grid</SelectItem>
                                    <SelectItem value="lava-flow">Lava Flow</SelectItem>
                                    <SelectItem value="mystic-forest">Mystic Forest</SelectItem>
                                    <SelectItem value="digital-glitch">Digital Glitch</SelectItem>
                                    <SelectItem value="steampunk-gears">Steampunk Gears</SelectItem>
                                    <SelectItem value="lofi-rain">Lofi Rain</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit" form="showcase-form">Save Showcase</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
