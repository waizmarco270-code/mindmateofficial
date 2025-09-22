
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { FileText, Save, Copy, Check, Download, Trash2, CaseUpper, CaseLower, Pilcrow, Heading } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


export default function NotepadPage() {
    const [notes, setNotes] = useLocalStorage('quick-notepad-content', '');
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
    const [isCopied, setIsCopied] = useState(false);
    const { toast } = useToast();
    
    // Auto-save logic
    useEffect(() => {
        if (saveStatus === 'saving') {
            const handler = setTimeout(() => {
                setSaveStatus('saved');
                // Hide "Saved" message after 2 seconds
                const hideHandler = setTimeout(() => setSaveStatus('idle'), 2000);
                return () => clearTimeout(hideHandler);
            }, 1000); // Save after 1 second of inactivity
            return () => clearTimeout(handler);
        }
    }, [notes, saveStatus]);
    
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSaveStatus('saving');
        setNotes(e.target.value);
    }
    
    const wordCount = useMemo(() => notes.trim().split(/\s+/).filter(Boolean).length, [notes]);
    const charCount = useMemo(() => notes.length, [notes]);

    const handleCopy = () => {
        navigator.clipboard.writeText(notes);
        setIsCopied(true);
        toast({ title: "Notes copied to clipboard!" });
        setTimeout(() => setIsCopied(false), 2000);
    }

    const handleDownload = () => {
        const blob = new Blob([notes], { type: 'text/plain' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = 'mindmate-notes.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
        toast({ title: "Notes downloaded!" });
    }

    const handleClear = () => {
        setNotes('');
        toast({ title: "Notepad cleared." });
    }
    
    const handleCaseChange = (caseType: 'upper' | 'lower' | 'title' | 'sentence') => {
        let newNotes = '';
        switch(caseType) {
            case 'upper':
                newNotes = notes.toUpperCase();
                break;
            case 'lower':
                newNotes = notes.toLowerCase();
                break;
            case 'title':
                newNotes = notes.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                break;
            case 'sentence':
                newNotes = notes.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
                break;
        }
        setNotes(newNotes);
        setSaveStatus('saving');
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <FileText className="text-primary"/>
                    Quick Notepad
                </h1>
                <p className="text-muted-foreground">Jot down quick thoughts and ideas. Your notes are saved automatically to this browser.</p>
            </div>
            <Card className="h-[60vh] flex flex-col">
                <CardContent className="p-0 flex-1">
                    <Textarea 
                        value={notes}
                        onChange={handleTextChange}
                        placeholder="Start typing here..."
                        className="h-full w-full border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                    />
                </CardContent>
                <CardFooter className="p-3 bg-muted/50 border-t flex-wrap items-center justify-between gap-4">
                     <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Words: {wordCount}</span>
                        <span>Characters: {charCount}</span>
                        <div className="flex items-center gap-1.5 transition-opacity duration-300">
                           {saveStatus === 'saving' && <><Save className="h-3 w-3 animate-pulse"/> Saving...</>}
                           {saveStatus === 'saved' && <><Check className="h-3 w-3 text-green-500"/> Saved</>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm"><CaseUpper className="mr-2"/> Convert Case</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleCaseChange('upper')}><CaseUpper className="mr-2"/> UPPERCASE</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCaseChange('lower')}><CaseLower className="mr-2"/> lowercase</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCaseChange('title')}><Heading className="mr-2"/> Title Case</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCaseChange('sentence')}><Pilcrow className="mr-2"/> Sentence case</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={!notes}><Trash2 className="mr-2"/> Clear</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete all content from your notepad. This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClear}>Yes, Clear All</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button variant="outline" size="sm" onClick={handleCopy} disabled={!notes}>
                            {isCopied ? <Check className="mr-2"/> : <Copy className="mr-2"/>}
                            Copy
                        </Button>
                         <Button variant="outline" size="sm" onClick={handleDownload} disabled={!notes}>
                            <Download className="mr-2"/> Download
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
