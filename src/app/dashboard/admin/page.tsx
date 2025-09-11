
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAdmin, type Resource } from '@/hooks/use-admin';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Send, Trash2, MinusCircle, Vote, AlertTriangle, Edit, Lock, Unlock, Gift, RefreshCcw, Users, Megaphone, BookOpen, ClipboardCheck, KeyRound, ShieldCheck, UserCog, DollarSign, Wallet, ShieldX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuizzes } from '@/hooks/use-quizzes';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


interface QuizQuestion {
    text: string;
    options: string[];
    correctAnswer: string;
}

export default function AdminPanelPage() {
  const { 
    isAdmin, 
    announcements, updateAnnouncement, 
    activePoll, updatePoll,
    resources, addResource, updateResource, deleteResource,
    premiumResources, addPremiumResource, updatePremiumResource, deletePremiumResource,
    jeeResources, addJeeResource, updateJeeResource, deleteJeeResource,
    class12Resources, addClass12Resource, updateClass12Resource, deleteClass12Resource
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

  // State for editing resources
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
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

  const handleResourceFormSubmit = async (e: React.FormEvent<HTMLFormElement>, type: 'general' | 'premium' | 'jee' | 'class12') => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const url = formData.get('url') as string;

    if (!title || !description || !url) {
        toast({ variant: 'destructive', title: "Validation Error", description: "All fields are required." });
        return;
    }

    const resourceData = { title, description, url };
    
    try {
        if (editingResource) {
            const updateFunction = {
                'general': updateResource,
                'premium': updatePremiumResource,
                'jee': updateJeeResource,
                'class12': updateClass12Resource
            }[type];
            await updateFunction(editingResource.id, resourceData);
            toast({ title: "Resource Updated", description: "The resource has been successfully updated." });
        } else {
            const addFunction = {
                'general': addResource,
                'premium': addPremiumResource,
                'jee': addJeeResource,
                'class12': addClass12Resource
            }[type];
            await addFunction(resourceData);
            toast({ title: "Resource Added", description: "The new resource has been added." });
        }
        (e.target as HTMLFormElement).reset();
        closeEditDialog();
    } catch (error: any) {
        toast({ variant: 'destructive', title: "Operation Failed", description: error.message });
    }
  };

  const openEditDialog = (resource: Resource) => {
    setEditingResource(resource);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditingResource(null);
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

  const renderResourceTable = (title: string, description: string, data: Resource[], deleteFn: (id: string) => Promise<void>, type: 'general' | 'premium' | 'jee' | 'class12') => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((resource) => (
                        <TableRow key={resource.id}>
                            <TableCell className="font-medium">{resource.title}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="outline" size="sm" onClick={() => openEditDialog(resource)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the resource. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteFn(resource.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                    {data.length === 0 && <TableRow><TableCell colSpan={2} className="h-24 text-center">No resources found.</TableCell></TableRow>}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );

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
                  <p className="text-sm text-muted-foreground text-left">Edit announcements and community polls.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
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
                    <p className="text-sm text-muted-foreground text-left">Add and manage general, Class 10, JEE, and Class 12 resources.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0 space-y-8">
                 <div className="grid gap-8 lg:grid-cols-2">
                    <Card>
                      <CardHeader><CardTitle>Add General Resource</CardTitle></CardHeader>
                      <CardContent><form onSubmit={(e) => handleResourceFormSubmit(e, 'general')} className="space-y-4">
                          <div className="space-y-2"><Label htmlFor="resource-title">Title</Label><Input id="resource-title" name="title" placeholder="e.g. Physics Formula Sheet" required /></div>
                          <div className="space-y-2"><Label htmlFor="resource-description">Description</Label><Textarea id="resource-description" name="description" placeholder="A short description of the resource." required /></div>
                          <div className="space-y-2"><Label htmlFor="resource-url">URL</Label><Input id="resource-url" name="url" type="url" placeholder="https://example.com/file.pdf" required /></div>
                          <Button type="submit"><PlusCircle className="mr-2 h-4 w-4" /> Add Resource</Button>
                        </form></CardContent>
                    </Card>
                    {renderResourceTable("General Resources", "Manage free resources available to all students.", resources, deleteResource, 'general')}
                  </div>
                   <div className="grid gap-8 lg:grid-cols-2">
                     <Card>
                        <CardHeader><CardTitle>Add Premium Resource (Class 10)</CardTitle></CardHeader>
                        <CardContent><form onSubmit={(e) => handleResourceFormSubmit(e, 'premium')} className="space-y-4">
                            <div className="space-y-2"><Label htmlFor="premium-resource-title-10">Title</Label><Input id="premium-resource-title-10" name="title" placeholder="e.g. Advanced Mathematics PDF" required /></div>
                            <div className="space-y-2"><Label htmlFor="premium-resource-description-10">Description</Label><Textarea id="premium-resource-description-10" name="description" placeholder="A short description of the premium PDF." required /></div>
                            <div className="space-y-2"><Label htmlFor="premium-resource-url-10">PDF URL</Label><Input id="premium-resource-url-10" name="url" type="url" placeholder="https://example.com/premium.pdf" required /></div>
                            <Button type="submit"><PlusCircle className="mr-2 h-4 w-4" /> Add Premium Resource</Button>
                          </form></CardContent>
                      </Card>
                      {renderResourceTable("Class 10 Resources", "Manage locked 'Class 10' resources.", premiumResources, deletePremiumResource, 'premium')}
                   </div>
                    <div className="grid gap-8 lg:grid-cols-2">
                      <Card>
                        <CardHeader><CardTitle>Add JEE Premium Resource</CardTitle></CardHeader>
                        <CardContent><form onSubmit={(e) => handleResourceFormSubmit(e, 'jee')} className="space-y-4">
                            <div className="space-y-2"><Label htmlFor="jee-resource-title">Title</Label><Input id="jee-resource-title" name="title" placeholder="e.g. JEE Advanced Physics" required /></div>
                            <div className="space-y-2"><Label htmlFor="jee-resource-description">Description</Label><Textarea id="jee-resource-description" name="description" placeholder="A short description of the resource." required /></div>
                            <div className="space-y-2"><Label htmlFor="jee-resource-url">URL</Label><Input id="jee-resource-url" name="url" type="url" placeholder="https://example.com/file.pdf" required /></div>
                            <Button type="submit"><PlusCircle className="mr-2 h-4 w-4" /> Add JEE Resource</Button>
                          </form></CardContent>
                      </Card>
                      {renderResourceTable("JEE Resources", "Manage locked 'JEE' resources.", jeeResources, deleteJeeResource, 'jee')}
                   </div>
                   <div className="grid gap-8 lg:grid-cols-2">
                       <Card>
                        <CardHeader><CardTitle>Add Class 12 Premium Resource</CardTitle></CardHeader>
                        <CardContent><form onSubmit={(e) => handleResourceFormSubmit(e, 'class12')} className="space-y-4">
                            <div className="space-y-2"><Label htmlFor="class12-resource-title">Title</Label><Input id="class12-resource-title" name="title" placeholder="e.g. Class 12 Chemistry Notes" required /></div>
                            <div className="space-y-2"><Label htmlFor="class12-resource-description">Description</Label><Textarea id="class12-resource-description" name="description" placeholder="A short description of the premium PDF." required /></div>
                            <div className="space-y-2"><Label htmlFor="class12-resource-url">PDF URL</Label><Input id="class12-resource-url" name="url" type="url" placeholder="https://example.com/premium.pdf" required /></div>
                            <Button type="submit"><PlusCircle className="mr-2 h-4 w-4" /> Add Class 12 Resource</Button>
                          </form></CardContent>
                      </Card>
                      {renderResourceTable("Class 12 Resources", "Manage locked 'Class 12' resources.", class12Resources, deleteClass12Resource, 'class12')}
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
                      <CardHeader><CardTitle>Create New Quiz</CardTitle><CardDescription>Build and publish a new quiz for the Quiz Zone.</CardDescription></CardHeader>
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
              </AccordionContent>
            </Card>
        </AccordionItem>

      </Accordion>

      <Dialog open={isEditDialogOpen} onOpenChange={closeEditDialog}>
        <DialogContent>
            <DialogHeader><DialogTitle>Edit Resource</DialogTitle></DialogHeader>
            <form onSubmit={(e) => {
                if (!editingResource) return;
                const resourceType = 
                    resources.some(r => r.id === editingResource.id) ? 'general' :
                    premiumResources.some(r => r.id === editingResource.id) ? 'premium' :
                    jeeResources.some(r => r.id === editingResource.id) ? 'jee' :
                    'class12';
                handleResourceFormSubmit(e, resourceType);
            }} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="edit-title">Title</Label><Input id="edit-title" name="title" defaultValue={editingResource?.title} required /></div>
                <div className="space-y-2"><Label htmlFor="edit-description">Description</Label><Textarea id="edit-description" name="description" defaultValue={editingResource?.description} required /></div>
                <div className="space-y-2"><Label htmlFor="edit-url">URL</Label><Input id="edit-url" name="url" type="url" defaultValue={editingResource?.url} required /></div>
                <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button type="submit">Save Changes</Button></DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
