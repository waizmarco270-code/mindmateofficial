'use client';

import { useState } from 'react';
import { useMentor, MentorSession, MentorRequest } from '@/hooks/use-mentor';
import { useAdmin } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    Plus, Trash2, ArrowLeft, 
    Clock, Users, CheckCircle, 
    Loader2, ShieldAlert, Video,
    Calendar, Megaphone, Target,
    Key, Lock, MessageSquare,
    XCircle, History, Sparkles,
    Gem, CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle, 
    AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function MentorAdmin() {
    const { sessions, requests, loading, createSession, deleteSession, updateSessionStatus, respondToRequest, deleteRequest } = useMentor();
    const { isSuperAdmin, isAdmin, currentUserData } = useAdmin();
    const { toast } = useToast();
    
    // Create Session State
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [startTime, setStartTime] = useState('');
    const [duration, setDuration] = useState(60);
    const [maxUsers, setMaxUsers] = useState(5);
    const [isCreating, setIsCreating] = useState(false);

    // Request Handling State
    const [respondingTo, setRespondingTo] = useState<MentorRequest | null>(null);
    const [adminReply, setAdminReply] = useState('');
    const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !startTime) return;
        
        setIsCreating(true);
        try {
            await createSession({
                title,
                description: desc,
                startTime: Timestamp.fromDate(new Date(startTime)),
                duration,
                maxUsers,
                mentorId: currentUserData!.uid,
                mentorName: currentUserData!.displayName || 'Elite Mentor'
            });
            setTitle(''); setDesc(''); setStartTime('');
        } finally {
            setIsCreating(false);
        }
    };

    const handleResponse = async (status: 'confirmed' | 'rejected') => {
        if (!respondingTo || isSubmittingResponse) return;
        setIsSubmittingResponse(true);
        try {
            await respondToRequest(respondingTo.id, status, adminReply);
            setRespondingTo(null);
            setAdminReply('');
        } finally {
            setIsSubmittingResponse(false);
        }
    };

    if (!isAdmin && !isSuperAdmin) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Button asChild variant="ghost" size="icon" className="rounded-full bg-white/5"><Link href="/dashboard/mentor"><ArrowLeft/></Link></Button>
                    <div>
                        <h1 className="text-3xl font-black uppercase italic text-primary">Mentor Control</h1>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Protocol: Direct Session Fabrication</p>
                    </div>
                </div>
            </header>

            <Tabs defaultValue="sessions" className="space-y-8">
                <TabsList className="grid w-full max-w-md grid-cols-2 h-12 p-1 bg-muted/50 border rounded-xl">
                    <TabsTrigger value="sessions" className="rounded-lg font-black uppercase text-[10px] tracking-widest">Meeting Hub</TabsTrigger>
                    <TabsTrigger value="requests" className="rounded-lg font-black uppercase text-[10px] tracking-widest relative">
                        Petitions
                        {requests.filter(r => r.status === 'pending').length > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] animate-pulse">
                                {requests.filter(r => r.status === 'pending').length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="sessions" className="m-0">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <Card className="lg:col-span-4 border-primary/20 bg-primary/5 rounded-[2.5rem]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 uppercase italic text-primary"><Video className="h-5 w-5"/> Initialize Session</CardTitle>
                                <CardDescription>Configure a new encrypted meeting terminal.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreate} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase opacity-40">Briefing Title</Label>
                                        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Advanced Calculus Defense" className="h-12 bg-black/20" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase opacity-40">Operational Intel</Label>
                                        <Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What will be covered?" className="bg-black/20" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase opacity-40">Ingress Time</Label>
                                            <Input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="h-12 bg-black/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase opacity-40">Duration (Min)</Label>
                                            <Input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="h-12 bg-black/20" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase opacity-40">Max Capacity</Label>
                                        <Input type="number" value={maxUsers} onChange={e => setMaxUsers(Number(e.target.value))} className="h-12 bg-black/20" />
                                        <p className="text-[9px] text-muted-foreground italic">Standard Protocol: 5 Citizens Max</p>
                                    </div>
                                    <Button type="submit" disabled={isCreating || !title || !startTime} className="w-full h-14 font-black uppercase rounded-2xl shadow-xl shadow-primary/20">
                                        {isCreating ? <Loader2 className="animate-spin mr-2"/> : <Plus className="mr-2"/>}
                                        FABRICATE SESSION
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-8">
                            <CardHeader className="border-b">
                                <CardTitle className="text-base flex items-center gap-2 uppercase tracking-widest"><Target className="h-4 w-4 text-primary"/> Active Registry</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Session</TableHead>
                                            <TableHead>Capacity</TableHead>
                                            <TableHead>Authorization</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sessions.map(s => (
                                            <TableRow key={s.id}>
                                                <TableCell>
                                                    <p className="font-bold text-sm uppercase">{s.title}</p>
                                                    <p className="text-[10px] opacity-40">
                                                        {s.startTime ? format(s.startTime.toDate(), 'MMM d, HH:mm') : 'Pending...'}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">{s.participants.length} / {s.maxUsers}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Key className="h-3 w-3 text-amber-500"/>
                                                        <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-black">{s.passcode || 'N/A'}</code>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={s.status === 'live' ? 'default' : 'secondary'} className="text-[8px] uppercase">{s.status}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    {s.status === 'upcoming' && <Button variant="outline" size="sm" className="h-8 text-[9px] font-black" onClick={() => updateSessionStatus(s.id, 'live')}>GO LIVE</Button>}
                                                    {s.status === 'live' && <Button variant="outline" size="sm" className="h-8 text-[9px] font-black border-red-500/30 text-red-500" onClick={() => updateSessionStatus(s.id, 'ended')}>END</Button>}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-slate-900 border-red-600/50">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-red-500">PURGE SESSION?</AlertDialogTitle>
                                                                <AlertDialogDescription>This will delete the meeting record and room authorization.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Abort</AlertDialogCancel>
                                                                <AlertDialogAction className="bg-red-600" onClick={() => deleteSession(s.id)}>TERMINATE</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="requests" className="m-0">
                    <Card className="border-white/10 overflow-hidden">
                        <CardHeader className="bg-muted/20 border-b">
                            <CardTitle className="text-xl flex items-center gap-2 uppercase italic tracking-widest"><Megaphone className="h-5 w-5 text-primary"/> Ingress Petitions</CardTitle>
                            <CardDescription>Review citizen requests for micro-briefings.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Citizen</TableHead>
                                        <TableHead>Directive Type</TableHead>
                                        <TableHead>Message Payload</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map(req => (
                                        <TableRow key={req.id} className={cn(req.status === 'confirmed' && "bg-emerald-500/5", req.status === 'rejected' && "bg-red-500/5")}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8"><AvatarImage src={req.userPhoto}/><AvatarFallback>U</AvatarFallback></Avatar>
                                                    <span className="font-bold text-xs truncate max-w-[120px]">{req.userName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {req.type === 'guaranteed' ? (
                                                    <Badge className="bg-yellow-400 text-black font-black text-[8px] animate-pulse">💎 GUARANTEED</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="font-black text-[8px]">STANDARD</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate italic text-xs opacity-70">"{req.message}"</TableCell>
                                            <TableCell>
                                                <Badge className={cn(
                                                    "text-[8px] font-black uppercase",
                                                    req.status === 'confirmed' ? "bg-emerald-500" : req.status === 'rejected' ? "bg-red-500" : "bg-amber-500"
                                                )}>
                                                    {req.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right space-x-1">
                                                <Button variant="outline" size="sm" className="h-8 text-[9px] font-black" onClick={() => setRespondingTo(req)}>RESPOND</Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteRequest(req.id)}><Trash2 className="h-4 w-4"/></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {requests.length === 0 && <TableRow><TableCell colSpan={5} className="py-20 text-center opacity-30 italic text-sm">No petitions filed.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* RESPONSE DIALOG */}
            <Dialog open={!!respondingTo} onOpenChange={setRespondingTo(null)}>
                <DialogContent className="max-w-md bg-slate-950 border-primary/20">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase italic text-white">Directive Response</DialogTitle>
                        <DialogDescription className="font-medium text-slate-400">Dispatch authorization status to <b>{respondingTo?.userName}</b>.</DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-6">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 italic text-xs text-slate-300">
                            "{respondingTo?.message}"
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Intelligence Payload</Label>
                            <Textarea 
                                value={adminReply} 
                                onChange={e => setAdminReply(e.target.value)} 
                                placeholder="Enter reason, schedule details, or rejection protocol..." 
                                className="bg-black/40 border-white/10"
                            />
                        </div>
                    </div>
                    <DialogFooter className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="h-12 font-black border-red-500/30 text-red-500 hover:bg-red-500/10" onClick={() => handleResponse('rejected')} disabled={isSubmittingResponse}>
                            REJECT
                        </Button>
                        <Button className="h-12 font-black bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleResponse('confirmed')} disabled={isSubmittingResponse}>
                            {isSubmittingResponse ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            CONFIRM
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
