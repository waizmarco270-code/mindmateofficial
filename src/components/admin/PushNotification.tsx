
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Clock, X, Trash2, RefreshCw, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
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
  dispatchSummary?: string;
  failureReason?: string;
}

interface ScheduledNotification {
    id: string;
    title: string;
    message: string;
    target: string;
    scheduledAt: any;
    status: string;
    failureReason?: string;
}

const PushNotification = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [notificationHistory, setNotificationHistory] = useState<NotificationLog[]>([]);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [scheduledLoading, setScheduledLoading] = useState(true);
  
  const [sendTo, setSendTo] = useState('all');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  useEffect(() => {
    // History Listener
    const q = query(collection(db, "sentNotifications"), orderBy("sentAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NotificationLog));
      setNotificationHistory(history);
      setHistoryLoading(false);
    });

    // Scheduled Listener
    const scheduledQuery = query(collection(db, "scheduledNotifications"), where("status", "==", "pending"));
    const unsubscribeScheduled = onSnapshot(scheduledQuery, (snapshot) => {
        const scheduled = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ScheduledNotification));
        scheduled.sort((a, b) => {
            const dateA = a.scheduledAt instanceof Timestamp ? a.scheduledAt.toMillis() : new Date(a.scheduledAt).getTime();
            const dateB = b.scheduledAt instanceof Timestamp ? b.scheduledAt.toMillis() : new Date(b.scheduledAt).getTime();
            return dateA - dateB;
        });
        setScheduledNotifications(scheduled);
        setScheduledLoading(false);
    });

    return () => {
        unsubscribe();
        unsubscribeScheduled();
    };
  }, []);

  const handleSyncCron = async () => {
      setIsSyncing(true);
      try {
          const res = await fetch('/api/cron/send-scheduled-notifications');
          const data = await res.json();
          toast({ title: data.success ? "Sync Complete" : "Sync Finished", description: data.message || `Dispatched ${data.processed} pending alerts.` });
      } catch (e) {
          toast({ variant: 'destructive', title: "Sync Failed" });
      } finally {
          setIsSyncing(false);
      }
  };

  const handleDeleteScheduled = async (id: string) => {
      await deleteDoc(doc(db, 'scheduledNotifications', id));
      toast({ title: "Alert Cancelled" });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let scheduledAt: number | null = null;
    if (isScheduled) {
        if (!scheduleDate) {
            toast({ variant: 'destructive', title: 'Pick a time!' });
            setIsLoading(false);
            return;
        }
        scheduledAt = new Date(scheduleDate).getTime();
    }

    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, linkUrl, imageUrl, userId: sendTo === 'specific' ? userId : undefined, scheduledAt }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast({ title: data.title, description: data.message });
        setTitle(''); setMessage(''); setUserId(''); setLinkUrl(''); setImageUrl(''); setIsScheduled(false); setScheduleDate('');
      } else {
        throw new Error(data.message || 'Dispatch failed');
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Dispatch Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
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
                <TabsTrigger value="send">Compose</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="send" className="pt-4 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Target Audience</Label>
                                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                                    <Button type="button" variant={sendTo === 'all' ? 'secondary' : 'ghost'} className="flex-1" onClick={() => setSendTo('all')}>All Legends</Button>
                                    <Button type="button" variant={sendTo === 'specific' ? 'secondary' : 'ghost'} className="flex-1" onClick={() => setSendTo('specific')}>Specific UID</Button>
                                </div>
                            </div>
                            {sendTo === 'specific' && <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Enter User UID" required />}
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Alert Title" required />
                            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message Content" required className="min-h-[100px]" />
                        </div>
                        <div className="space-y-4 p-4 border rounded-xl bg-muted/30">
                            <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Image & Deep Link</Label>
                            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL (e.g. from Imgur)" />
                            <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="App Path (e.g. /dashboard/quiz)" />
                            <div className="mt-2 text-[10px] text-muted-foreground bg-background p-2 rounded border border-dashed">
                                💡 Tip: Use a direct URL for the banner image to bypass Storage limits.
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border rounded-xl flex items-center justify-between bg-primary/5">
                        <div className="space-y-0.5">
                            <Label className="font-bold flex items-center gap-2"><Clock className="h-4 w-4"/> Schedule Mission</Label>
                            <p className="text-xs text-muted-foreground">Send automatically at a specified future time.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {isScheduled && <Input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-auto h-9" />}
                            <Switch checked={isScheduled} onCheckedChange={setIsScheduled} />
                        </div>
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full h-14 text-lg font-black uppercase shadow-lg">
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" />}
                        {isScheduled ? "Queue Mission" : "Dispatch Pulse"}
                    </Button>
                </form>
            </TabsContent>

            <TabsContent value="scheduled" className="pt-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold">Active Queued missions</h3>
                    <Button variant="outline" size="sm" onClick={handleSyncCron} disabled={isSyncing}>
                        {isSyncing ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <RefreshCw className="mr-2 h-4 w-4"/>}
                        Manual Sync
                    </Button>
                </div>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader><TableRow><TableHead>Scheduled Time</TableHead><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {scheduledNotifications.map(n => (
                                    <TableRow key={n.id}>
                                        <TableCell className="text-xs">{formatDateLabel(n.scheduledAt)}</TableCell>
                                        <TableCell className="font-bold text-xs">{n.title}</TableCell>
                                        <TableCell><Badge className="text-[10px] uppercase">Waiting</Badge></TableCell>
                                        <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDeleteScheduled(n.id)} className="text-destructive"><Trash2 className="h-4 w-4"/></Button></TableCell>
                                    </TableRow>
                                ))}
                                {!scheduledLoading && scheduledNotifications.length === 0 && <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No alerts in the queue.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="history" className="pt-4">
                <Card>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[400px]">
                            <Table>
                                <TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>Mission</TableHead><TableHead>Dispatch Result</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {notificationHistory.map(h => (
                                        <TableRow key={h.id}>
                                            <TableCell className="text-[10px] text-muted-foreground">{formatDateLabel(h.sentAt)}</TableCell>
                                            <TableCell>
                                                <p className="font-bold text-xs">{h.title}</p>
                                                <p className="text-[9px] text-muted-foreground truncate max-w-[200px]">{h.message}</p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[9px] border-emerald-500/50 text-emerald-500">{h.dispatchSummary || 'Success'}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {!historyLoading && notificationHistory.length === 0 && <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground text-sm italic">Archive is empty.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
};

export default PushNotification;
