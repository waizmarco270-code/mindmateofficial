
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { FileText, Save, Copy, Check, Download, Trash2, CaseUpper, CaseLower, Pilcrow, Heading, Wand2, ArrowLeftRight, WrapText, SortAsc, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';


export default function NotepadPage() {
    const [notesArray, setNotesArray] = useLocalStorage<string[]>('quick-notepad-slots', Array(5).fill(''));
    const [activeNoteIndex, setActiveNoteIndex] = useState(0);

    const notes = notesArray[activeNoteIndex] || '';
    const setNotes = (newNotes: string) => {
        const newNotesArray = [...notesArray];
        newNotesArray[activeNoteIndex] = newNotes;
        setNotesArray(newNotesArray);
    };
    
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
    }, [notesArray, saveStatus]);
    
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSaveStatus('saving');
        setNotes(e.target.value);
    }
    
    const wordCount = useMemo(() => notes.trim() === '' ? 0 : notes.trim().split(/\s+/).length, [notes]);
    const charCount = useMemo(() => notes.length, [notes]);
    const lineCount = useMemo(() => notes.split('\n').length, [notes]);
    const paragraphCount = useMemo(() => notes.split(/\n\s*\n/).filter(p => p.trim() !== '').length, [notes]);
    const sentenceCount = useMemo(() => (notes.match(/[.!?]+/g) || []).length, [notes]);


    const handleCopy = () => {
        navigator.clipboard.writeText(notes);
        setIsCopied(true);
        toast({ title: "Note copied to clipboard!" });
        setTimeout(() => setIsCopied(false), 2000);
    }

    const handleDownload = () => {
        const blob = new Blob([notes], { type: 'text/plain' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = `mindmate-note-${activeNoteIndex + 1}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
        toast({ title: "Note downloaded!" });
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
    
    const handleRemoveExtraSpaces = () => {
        setNotes(notes.replace(/\s+/g, ' ').trim());
        setSaveStatus('saving');
    }

    const handleReverseText = () => {
        setNotes(notes.split('').reverse().join(''));
        setSaveStatus('saving');
    }
    
    const handleSortLines = () => {
        setNotes(notes.split('\n').sort().join('\n'));
        setSaveStatus('saving');
    };
    
    const handleShuffleLines = () => {
        setNotes(notes.split('\n').sort(() => Math.random() - 0.5).join('\n'));
        setSaveStatus('saving');
    };

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
                 <CardHeader>
                    <Tabs value={String(activeNoteIndex)} onValueChange={(val) => setActiveNoteIndex(Number(val))}>
                        <TabsList>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <TabsTrigger key={index} value={String(index)}>Note {index + 1}</TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                    <Textarea 
                        value={notes}
                        onChange={handleTextChange}
                        placeholder={`Start typing in Note ${activeNoteIndex + 1}...`}
                        className="h-full w-full border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                    />
                </CardContent>
                <CardFooter className="p-3 bg-muted/50 border-t flex-wrap items-center justify-between gap-4">
                     <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Words: {wordCount}</span>
                        <span>Chars: {charCount}</span>
                        <span>Lines: {lineCount}</span>
                        <span>¶: {paragraphCount}</span>
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

                        <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm"><Wand2 className="mr-2"/> Text Tools</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={handleRemoveExtraSpaces}><WrapText className="mr-2"/> Remove Extra Spaces</DropdownMenuItem>
                                <DropdownMenuItem onClick={handleReverseText}><ArrowLeftRight className="mr-2"/> Reverse Text</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSortLines}><SortAsc className="mr-2"/> Sort Lines</DropdownMenuItem>
                                <DropdownMenuItem onClick={handleShuffleLines}><Shuffle className="mr-2"/> Shuffle Lines</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={!notes}><Trash2 className="mr-2"/> Clear</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete all content from the current note. This action cannot be undone.</AlertDialogDescription>
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
