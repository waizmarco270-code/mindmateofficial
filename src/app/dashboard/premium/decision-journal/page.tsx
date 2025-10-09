
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Plus, Brain, BookOpen, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


interface DecisionEntry {
    id: string;
    situation: string;
    thinking: string;
    decision: string;
    outcome: string;
    createdAt: string; // ISO String
}

export default function DecisionJournalPage() {
    const [entries, setEntries] = useLocalStorage<DecisionEntry[]>('decisionJournalEntries', []);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    // Form state
    const [situation, setSituation] = useState('');
    const [thinking, setThinking] = useState('');
    const [decision, setDecision] = useState('');
    const [outcome, setOutcome] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const openDialog = (entry: DecisionEntry | null) => {
        if (entry) {
            setEditingId(entry.id);
            setSituation(entry.situation);
            setThinking(entry.thinking);
            setDecision(entry.decision);
            setOutcome(entry.outcome);
        } else {
            setEditingId(null);
            setSituation('');
            setThinking('');
            setDecision('');
            setOutcome('');
        }
        setIsDialogOpen(true);
    };
    
    const handleSubmit = () => {
        if (!situation.trim() || !thinking.trim() || !decision.trim()) return;

        if (editingId) {
            // Update existing entry
            setEntries(entries.map(e => e.id === editingId ? { ...e, situation, thinking, decision, outcome } : e));
        } else {
            // Create new entry
            const newEntry: DecisionEntry = {
                id: Date.now().toString(),
                situation,
                thinking,
                decision,
                outcome: '',
                createdAt: new Date().toISOString(),
            };
            setEntries(prev => [newEntry, ...prev]);
        }
        setIsDialogOpen(false);
    };

    const handleDelete = (id: string) => {
        setEntries(entries.filter(e => e.id !== id));
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon">
                    <Link href="/dashboard/premium/elite-lounge">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3"><Brain className="h-8 w-8 text-primary"/> Decision Journal</h1>
                    <p className="text-muted-foreground">Track your decisions to improve judgment and learn from outcomes.</p>
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={() => openDialog(null)}>
                    <Plus className="mr-2"/> New Decision Entry
                </Button>
            </div>
            
            <AnimatePresence>
            {entries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {entries.map((entry, index) => (
                         <motion.div
                            key={entry.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1, transition: { delay: index * 0.05 } }}
                            exit={{ opacity: 0, scale: 0.9 }}
                         >
                            <Card className="h-full flex flex-col">
                                <CardHeader>
                                    <CardTitle className="truncate">{entry.situation}</CardTitle>
                                    <CardDescription>
                                        {format(new Date(entry.createdAt), 'PPP')}
                                        <span className="text-xs"> ({formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })})</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                     <div>
                                        <h4 className="font-semibold text-sm mb-1">My Thinking</h4>
                                        <p className="text-sm text-muted-foreground line-clamp-3">{entry.thinking}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1">The Decision</h4>
                                        <p className="text-sm text-muted-foreground line-clamp-3">{entry.decision}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1">The Outcome</h4>
                                        <p className="text-sm text-muted-foreground italic line-clamp-3">{entry.outcome || "Not recorded yet."}</p>
                                    </div>
                                </CardContent>
                                <CardFooter className="gap-2">
                                     <Button variant="secondary" className="w-full" onClick={() => openDialog(entry)}><Edit className="mr-2 h-4 w-4"/> Review</Button>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4"/></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This will permanently delete this decision entry. This action cannot be undone.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(entry.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                     </AlertDialog>
                                </CardFooter>
                            </Card>
                         </motion.div>
                    ))}
                </div>
            ) : (
                 <Card className="text-center py-16 border-dashed">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2"><BookOpen/> Your Journal is Empty</CardTitle>
                        <CardDescription>Start by recording your first important decision.</CardDescription>
                    </CardHeader>
                 </Card>
            )}
            </AnimatePresence>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-xl">
                     <DialogHeader>
                        <DialogTitle>{editingId ? 'Review' : 'New'} Decision Entry</DialogTitle>
                        <DialogDescription>
                            {editingId ? 'Update your thought process or record the outcome.' : 'Clearly define the situation and your final decision.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                        <div className="space-y-2">
                            <Label htmlFor="situation">The Situation</Label>
                            <Textarea id="situation" value={situation} onChange={e => setSituation(e.target.value)} placeholder="e.g., Should I focus on JEE or boards for the next month?" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="thinking">My Thinking & Assumptions</Label>
                            <Textarea id="thinking" value={thinking} onChange={e => setThinking(e.target.value)} placeholder="e.g., I assume I can cover the remaining syllabus in time..." rows={4}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="decision">The Decision</Label>
                            <Textarea id="decision" value={decision} onChange={e => setDecision(e.target.value)} placeholder="e.g., I've decided to dedicate 70% of my time to JEE prep..." />
                        </div>
                        {editingId && (
                             <div className="space-y-2 pt-4 border-t">
                                <Label htmlFor="outcome" className="font-bold text-base">The Outcome</Label>
                                <p className="text-xs text-muted-foreground">Come back later to fill this out. How did it turn out? What did you learn?</p>
                                <Textarea id="outcome" value={outcome} onChange={e => setOutcome(e.target.value)} placeholder="e.g., It was the right call. My mock test scores improved..." rows={4}/>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>{editingId ? 'Save Changes' : 'Save Decision'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
