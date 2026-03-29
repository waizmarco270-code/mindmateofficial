
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Key, HardDrive, Cpu, Download, 
    Copy, Check, ScrollText, Loader2 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PROJECT_MEMORY } from '@/app/lib/project-memory';

const MASTER_API_KEY = "EMITYGATE_SOVEREIGN_LINK_99";

export default function ApiControlPage() {
    const { toast } = useToast();
    const [isApiKeyCopied, setIsApiKeyCopied] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const copyApiKey = () => {
        navigator.clipboard.writeText(MASTER_API_KEY);
        setIsApiKeyCopied(true);
        toast({ title: "API Key Secured" });
        setTimeout(() => setIsApiKeyCopied(false), 2000);
    };

    const handleExportMemory = () => {
        setIsExporting(true);
        try {
            const exportContent = `MINDMATE PROJECT MISSION BRIEFING\nVERSION: 2.5\n\n${PROJECT_MEMORY}`;
            const blob = new Blob([exportContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `sovereign_memory.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({ title: "Memory Archive Exported" });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <Card className="border-cyan-500/20 bg-cyan-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 uppercase italic text-cyan-500"><Key/> Master Ingress Link</CardTitle>
                        <CardDescription>Authentication key for external EmityGate product synchronization.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <div className="p-4 rounded-xl bg-black/40 font-mono text-xs break-all border select-text pr-12">
                                {MASTER_API_KEY}
                            </div>
                            <Button size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={copyApiKey}>
                                {isApiKeyCopied ? <Check className="text-green-500 h-4 w-4"/> : <Copy className="h-4 w-4"/>}
                            </Button>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Usage: X-API-KEY header in Sovereign API v1</p>
                    </CardContent>
                </Card>

                <Card className="border-amber-500/20 bg-amber-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 uppercase italic text-amber-500"><HardDrive/> Continuity Archive</CardTitle>
                        <CardDescription>Encoded logical DNA for 2027 server migration.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleExportMemory} disabled={isExporting} className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-lg shadow-xl">
                            {isExporting ? <Loader2 className="animate-spin mr-2"/> : <Download className="mr-2"/>}
                            EXPORT ARCHIVE
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><ScrollText className="h-4 w-4 text-primary"/> Archive Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96 bg-muted rounded-xl p-4 border border-white/5">
                        <pre className="text-[10px] font-mono leading-relaxed opacity-80 whitespace-pre-wrap select-text">
                            {PROJECT_MEMORY}
                        </pre>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
