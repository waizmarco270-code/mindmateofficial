
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { FileText, Save } from 'lucide-react';

export default function NotepadPage() {
    const [notes, setNotes] = useLocalStorage('quick-notepad-content', '');
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <FileText className="text-primary"/>
                    Quick Notepad
                </h1>
                <p className="text-muted-foreground">Jot down quick thoughts and ideas. Your notes are saved automatically.</p>
            </div>
            <Card className="h-[60vh]">
                <CardContent className="p-0 h-full">
                    <Textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Start typing here..."
                        className="h-full w-full border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
