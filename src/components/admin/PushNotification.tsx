
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, History, User, Users, Bell, Image as ImageIcon, Link as LinkIcon, Clock, X, CheckCircle2, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, query, orderBy, onSnapshot, Timestamp, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationLog {
  id: string;
  title: string;
  message: string;
  status: string;
  sentAt: any;
  target: string;
  imageUrl?: string;
  linkUrl?: string;
}

interface ScheduledNotification {
    id: string;
    title: string;
    message: string;
    target: string;
    scheduledAt: any;
    imageUrl?: string;
    linkUrl?: string;
}

const PushNotification = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState<NotificationLog[]>([]);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [scheduledLoading, setScheduledLoading] = useState(true);
  const [sendTo, setSendTo] = useState('all');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // History Listener
    const q = query(collection(db, "sentNotifications"), orderBy("sentAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const history: NotificationLog[] = [];
      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() } as NotificationLog);
      });
      setNotificationHistory(history);
      setHistoryLoading(false);
    }, (error) => {
        console.error("History fetch error:", error);
        setHistoryLoading(false);
    });

    // Scheduled Listener - Simplifed query to avoid index errors
    const scheduledQuery = query(collection(db, "scheduledNotifications"), where("status", "==", "pending"));
    const unsubscribeScheduled = onSnapshot(scheduledQuery, (querySnapshot) => {
        const scheduled: ScheduledNotification[] = [];
        querySnapshot.forEach((doc) => {
            scheduled.push({ id: doc.id, ...doc.data() } as ScheduledNotification);
        });
        // Sort manually on client
        scheduled.sort((a, b) => {
            const dateA = a.scheduledAt instanceof Timestamp ? a.scheduledAt.toMillis() : new Date(a.scheduledAt).getTime();
            const dateB = b.scheduledAt instanceof Timestamp ? b.scheduledAt.toMillis() : new Date(b.scheduledAt).getTime();
            return dateA - dateB;
        });
        setScheduledNotifications(scheduled);
        setScheduledLoading(false);
    }, (error) => {
        console.error("Scheduled fetch error:", error);
        setScheduledLoading(false);
    });

    return () => {
        unsubscribe();
        unsubscribeScheduled();
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImageBase64(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageBase64(null);
    setImagePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleDeleteScheduled = async (id: string) => {
      try {
          await deleteDoc(doc(db, 'scheduledNotifications', id));
          toast({ title: "Scheduled Alert Deleted" });
      } catch (e) {
          toast({ variant: 'destructive', title: "Delete Failed" });
      }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let scheduledAt: number | null = null;
    if (isScheduled) {
        if (!scheduleDate) {
            toast({ variant: 'destructive', title: 'Invalid Date', description: 'Please select a date and time.' });
            setIsLoading(false);
            return;
        }
        scheduledAt = new Date(scheduleDate).getTime();
    }

    const payload = {
      title,
      message,
      linkUrl,
      imageBase64,
      userId: sendTo === 'specific' ? userId : undefined,
      scheduledAt,
    };

    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({ title: data.title, description: data.message });
        setTitle('');
        setMessage('');
        setUserId('');
        setLinkUrl('');
        clearImage();
        setIsScheduled(false);
        setScheduleDate('');
      } else {
        throw new Error(data.message || 'Failed to send notification');
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
    }

    setIsLoading(false);
  };

  const formatDateLabel = (ts: any) => {
      if (!ts) return 'N/A';
      const date = ts instanceof Timestamp ? ts.toDate() : new Date(ts);
      return date.toLocaleString();
  }

  return (
    <div className="space-y-6">
        <Tabs defaultValue="send">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="send"><Send className="w-4 h-4 mr-2"/>Compose</TabsTrigger>
                <TabsTrigger value="scheduled"><Clock className="w-4 h-4 mr-2"/>Scheduled</TabsTrigger>
                <TabsTrigger value="history"><History className="w-4 h-4 mr-2"/>History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="send" className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Target Audience</Label>
                                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                                    <Button type="button" variant={sendTo === 'all' ? 'secondary' : 'ghost'} className="flex-1 h-8 text-xs" onClick={() => setSendTo('all')}><Users className="mr-2 h-3 w-3"/> All Users</Button>
                                    <Button type="button" variant={sendTo === 'specific' ? 'secondary' : 'ghost'} className="flex-1 h-8 text-xs" onClick={() => setSendTo('specific')}><User className="mr-2 h-3 w-3"/> Specific User</Button>
                                </div>
                            </div>
                            {sendTo === 'specific' && (
                                <div className="space-y-2">
                                    <Label htmlFor="userId">User UID</Label>
                                    <Input id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Paste Clerk User ID" required />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="title">Notification Title</Label>
                                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Rare Credit Rain ⛈️" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message Content</Label>
                                <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What's the message?" required className="min-h-[100px]" />
                            </div>
                        </div>

                        <div className="space-y-4 p-4 border rounded-xl bg-muted/30">
                            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Media & Link</h3>
                            <div className="space-y-2">
                                <Label>Image Banner (Optional)</Label>
                                <div className="relative group">
                                    {imagePreview ? (
                                        <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <Button variant="destructive" size="icon" className="absolute top-2 right-2 rounded-full h-8 w-8" onClick={clearImage}><X className="h-4 w-4"/></Button>
                                        </div>
                                    ) : (
                                        <div 
                                            className="aspect-video w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                                            <p className="text-xs text-muted-foreground font-medium">Click to upload banner</p>
                                        </div>
                                    )}
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="linkUrl">Deep Link URL</Label>
                                <Input id="linkUrl" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="/dashboard/reward" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border rounded-xl flex items-center justify-between bg-primary/5">
                        <div className="space-y-0.5">
                            <Label className="text-base font-bold flex items-center gap-2"><Clock className="h-4 w-4 text-primary"/> Schedule Dispatch</Label>
                            <p className="text-xs text-muted-foreground">Send this later at a specific time.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {isScheduled && <Input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-auto h-9" />}
                            <Switch checked={isScheduled} onCheckedChange={setIsScheduled} />
                        </div>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full h-14 text-lg font-black uppercase tracking-widest shadow-lg">
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : isScheduled ? <Clock className="mr-2" /> : <Send className="mr-2" />}
                        {isScheduled ? "Schedule Mission" : "Dispatch Pulse Alert"}
                    </Button>
                </form>
            </TabsContent>

            <TabsContent value="scheduled" className="pt-4">
                <Card>
                    <CardHeader><CardTitle className="text-base">Pending Missions</CardTitle></CardHeader>
                    <CardContent>
                        {scheduledLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div> : scheduledNotifications.length === 0 ? <p className="text-center py-10 text-muted-foreground">No scheduled notifications.</p> : (
                            <Table>
                                <TableHeader><TableRow><TableHead>Scheduled For</TableHead><TableHead>Title</TableHead><TableHead>Target</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {scheduledNotifications.map(n => (
                                        <TableRow key={n.id}>
                                            <TableCell className="font-mono text-xs">{formatDateLabel(n.scheduledAt)}</TableCell>
                                            <TableCell className="font-bold">{n.title}</TableCell>
                                            <TableCell><Badge variant="outline">{n.target}</Badge></TableCell>
                                            <TableCell className="text-right"><Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteScheduled(n.id)}><Trash2 className="h-4 w-4"/></Button></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="history" className="pt-4">
                <Card>
                    <CardHeader><CardTitle className="text-base">Pulse History</CardTitle></CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px]">
                            {historyLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div> : notificationHistory.length === 0 ? <p className="text-center py-10 text-muted-foreground">No history yet.</p> : (
                                <Table>
                                    <TableHeader><TableRow><TableHead>Sent At</TableHead><TableHead>Message</TableHead><TableHead>Results</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {notificationHistory.map(h => (
                                            <TableRow key={h.id}>
                                                <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">{formatDateLabel(h.sentAt)}</TableCell>
                                                <TableCell>
                                                    <p className="font-bold text-xs">{h.title}</p>
                                                    <p className="text-[10px] text-muted-foreground line-clamp-1">{h.message}</p>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap"><Badge variant="secondary" className="text-[9px]">{h.status}</Badge></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
};

export default PushNotification;
