
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, History, User, Users, Bell, Image as ImageIcon, Link as LinkIcon, Clock, X, CheckCircle2, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
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
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
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
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NotificationLog));
      setNotificationHistory(history);
      setHistoryLoading(false);
    });

    // Scheduled Listener
    const scheduledQuery = query(collection(db, "scheduledNotifications"), where("status", "!=", "sent"));
    const unsubscribeScheduled = onSnapshot(scheduledQuery, (snapshot) => {
        const scheduled = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ScheduledNotification));
        // Sort manually
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

  const handleSyncCron = async () => {
      setIsSyncing(true);
      try {
          const res = await fetch('/api/cron/send-scheduled-notifications');
          const data = await res.json();
          if (data.success) {
              toast({ title: "Sync Complete", description: `Dispatched ${data.processed} pending alerts.` });
          } else {
              toast({ title: "Sync finished", description: data.message });
          }
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
        body: JSON.stringify({ title, message, linkUrl, imageBase64, userId: sendTo === 'specific' ? userId : undefined, scheduledAt }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast({ title: data.title, description: data.message });
        setTitle(''); setMessage(''); setUserId(''); setLinkUrl(''); clearImage(); setIsScheduled(false); setScheduleDate('');
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
                                <Label>Target</Label>
                                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                                    <Button type="button" variant={sendTo === 'all' ? 'secondary' : 'ghost'} className="flex-1" onClick={() => setSendTo('all')}>All</Button>
                                    <Button type="button" variant={sendTo === 'specific' ? 'secondary' : 'ghost'} className="flex-1" onClick={() => setSendTo('specific')}>Specific</Button>
                                </div>
                            </div>
                            {sendTo === 'specific' && <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User UID" required />}
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
                            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" required />
                        </div>
                        <div className="space-y-4 p-4 border rounded-xl bg-muted/30">
                            <Label>Media & Deep Link</Label>
                            {imagePreview ? (
                                <div className="relative aspect-video rounded-lg overflow-hidden border">
                                    <img src={imagePreview} className="w-full h-full object-cover" />
                                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 rounded-full h-8 w-8" onClick={clearImage}><X className="h-4 w-4"/></Button>
                                </div>
                            ) : (
                                <div className="aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted" onClick={() => fileInputRef.current?.click()}>
                                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-xs text-muted-foreground">Upload Banner</p>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="Link URL (/dashboard/...)" />
                        </div>
                    </div>
                    <div className="p-4 border rounded-xl flex items-center justify-between bg-primary/5">
                        <div className="space-y-0.5">
                            <Label className="font-bold flex items-center gap-2"><Clock className="h-4 w-4"/> Schedule Alert</Label>
                            <p className="text-xs text-muted-foreground">Send automatically at a later time.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {isScheduled && <Input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-auto h-9" />}
                            <Switch checked={isScheduled} onCheckedChange={setIsScheduled} />
                        </div>
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full h-14 text-lg font-black uppercase shadow-lg">
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" />}
                        {isScheduled ? "Schedule Pulse" : "Dispatch Now"}
                    </Button>
                </form>
            </TabsContent>

            <TabsContent value="scheduled" className="pt-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold">Pending Dispatches</h3>
                    <Button variant="outline" size="sm" onClick={handleSyncCron} disabled={isSyncing}>
                        {isSyncing ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <RefreshCw className="mr-2 h-4 w-4"/>}
                        Sync Scheduled Alerts
                    </Button>
                </div>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {scheduledNotifications.map(n => (
                                    <TableRow key={n.id}>
                                        <TableCell className="text-xs">{formatDateLabel(n.scheduledAt)}</TableCell>
                                        <TableCell className="font-bold text-xs">{n.title}</TableCell>
                                        <TableCell>
                                            <Badge variant={n.status === 'failed' ? 'destructive' : 'secondary'} className="text-[10px]">
                                                {n.status}
                                            </Badge>
                                            {n.failureReason && <p className="text-[9px] text-destructive mt-1 max-w-[150px] truncate">{n.failureReason}</p>}
                                        </TableCell>
                                        <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDeleteScheduled(n.id)}><Trash2 className="h-4 w-4"/></Button></TableCell>
                                    </TableRow>
                                ))}
                                {!scheduledLoading && scheduledNotifications.length === 0 && <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No alerts pending.</TableCell></TableRow>}
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
                                <TableHeader><TableRow><TableHead>Sent At</TableHead><TableHead>Message</TableHead><TableHead>Result</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {notificationHistory.map(h => (
                                        <TableRow key={h.id}>
                                            <TableCell className="text-[10px] text-muted-foreground">{formatDateLabel(h.sentAt)}</TableCell>
                                            <TableCell>
                                                <p className="font-bold text-xs">{h.title}</p>
                                                <p className="text-[9px] text-muted-foreground truncate max-w-[200px]">{h.message}</p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[9px]">{h.dispatchSummary || 'Success'}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {!historyLoading && notificationHistory.length === 0 && <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No history available.</TableCell></TableRow>}
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
