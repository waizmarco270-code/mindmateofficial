
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdmin, type RedeemCode } from '@/hooks/use-admin';
import { 
    Ticket, Plus, History, Trash2, 
    X, CheckCircle, Clock, Wallet, 
    Loader2, Copy, Check, Ban
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function CodeManagementPage() {
    const { redeemCodes, generateRedeemCode, deactivateRedeemCode, deleteRedeemCode, users } = useAdmin();
    const { toast } = useToast();
    
    const [generateValue, setGenerateValue] = useState(99);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (generateValue < 1) return;
        setIsGenerating(true);
        try {
            const code = await generateRedeemCode(generateValue);
            toast({ title: "Asset Fabricated", description: `Encrypted code ${code} is now active.` });
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast({ title: "Code Copied to Buffer" });
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                {/* Generation Card */}
                <Card className="lg:col-span-4 border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 uppercase italic text-primary">
                            <Plus className="h-5 w-5"/> Fabricate Code
                        </CardTitle>
                        <CardDescription>Generate a unique encrypted token with liquid value.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Liquid Value (₹)</Label>
                            <Input 
                                type="number" 
                                value={generateValue} 
                                onChange={e => setGenerateValue(Number(e.target.value))} 
                                className="h-14 text-3xl font-black text-center"
                            />
                        </div>
                        <Button 
                            onClick={handleGenerate} 
                            disabled={isGenerating || generateValue < 1}
                            className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 rounded-2xl"
                        >
                            {isGenerating ? <Loader2 className="animate-spin mr-2"/> : <Ticket className="mr-2"/>}
                            INITIALIZE GENERATION
                        </Button>
                    </CardContent>
                </Card>

                {/* Registry Card */}
                <Card className="lg:col-span-8">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2 uppercase italic">
                                <History className="text-primary h-5 w-5"/> Token Registry
                            </CardTitle>
                            <CardDescription>Historical log of all mission-issued tokens.</CardDescription>
                        </div>
                        <Badge variant="outline" className="font-black">{redeemCodes.length} ISSUED</Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[600px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Encrypted Signal</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Temporal Data</TableHead>
                                        <TableHead className="text-right">Directive</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {redeemCodes.map(code => {
                                        const redeemer = code.redeemedBy ? users.find(u => u.uid === code.redeemedBy)?.displayName : null;
                                        
                                        return (
                                            <TableRow key={code.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <code className="bg-muted px-2 py-1 rounded font-black text-xs">{code.id}</code>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(code.id)}>
                                                            {copiedCode === code.id ? <Check className="h-3 w-3 text-green-500"/> : <Copy className="h-3 w-3"/>}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-black text-emerald-500">₹{code.value}</TableCell>
                                                <TableCell>
                                                    <Badge className={cn(
                                                        "text-[8px] font-black uppercase tracking-tighter",
                                                        code.status === 'active' ? "bg-green-500" : 
                                                        code.status === 'redeemed' ? "bg-blue-500" : "bg-red-500"
                                                    )}>
                                                        {code.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-[10px] space-y-0.5">
                                                        <p className="flex items-center gap-1 text-muted-foreground"><Clock className="h-2.5 w-2.5"/> {format(code.createdAt, 'MMM d')}</p>
                                                        {code.status === 'redeemed' && <p className="text-primary font-bold truncate max-w-[100px]">By: {redeemer || 'Legend'}</p>}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right space-x-1">
                                                    {code.status === 'active' && (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500" onClick={() => deactivateRedeemCode(code.id)}>
                                                            <Ban className="h-4 w-4"/>
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteRedeemCode(code.id)}>
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {redeemCodes.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-20 opacity-30 italic">No assets issued in the mainframe.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
