
'use client';

import { useState, useMemo } from 'react';
import { useAnnouncements, useAdmin } from '@/hooks/use-admin';
import { useUnreadMessages } from '@/hooks/use-unread';
import { useFriends, type FriendRequest } from '@/hooks/use-friends';
import { useFCM } from '@/hooks/use-fcm';
import { formatDistanceToNow } from 'date-fns';
import { 
    Mail, Users, Pin, Bell, Sparkles, CheckCircle, XCircle, 
    ArrowRight, Megaphone, Zap, ShieldCheck, Heart, 
    Gift, Crown, Trophy, Trash2, Filter, Loader2, Search, Settings, 
    Maximize2, MoreVertical, BellRing
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface InboxContentProps {
    isMini?: boolean;
}

type NotificationType = 'all' | 'missions' | 'allies' | 'treasury' | 'system';

export function InboxContent({ isMini = false }: InboxContentProps) {
    const { announcements } = useAnnouncements();
    const { 
        hasUnreadAnnouncements, hasUnreadFriendRequests, 
        markAnnouncementsAsRead, markFriendRequestsAsRead 
    } = useUnreadMessages();
    const { friendRequests, acceptFriendRequest, declineFriendRequest } = useFriends();
    const { notificationPermission, requestPermission } = useFCM();
    const { toast } = useToast();
    
    const [activeTab, setActiveTab] = useState<NotificationType>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const handleAccept = async (request: FriendRequest) => {
        await acceptFriendRequest(request);
        toast({ title: "Alliance Confirmed!" });
    };

    const handleDecline = async (request: FriendRequest) => {
        await declineFriendRequest(request);
        toast({ title: "Transmission Rejected" });
    };

    const isPushEnabled = notificationPermission === 'granted';

    const handleTogglePush = async () => {
        if (!isPushEnabled) {
            const result = await requestPermission();
            if (result === 'granted') {
                toast({ title: "Relay Active!", description: "Push notifications are now operational." });
            } else {
                toast({ variant: 'destructive', title: "Relay Failed", description: "Browser permission denied." });
            }
        } else {
            toast({ title: "Sovereign Mode", description: "To disable, please use browser settings for full privacy." });
        }
    };

    return (
        <div className="flex flex-col h-full bg-background/50">
            {/* Inbox Header */}
            <div className={cn(
                "p-6 border-b flex flex-col gap-4 bg-primary/5",
                isMini ? "p-4" : "p-8"
            )}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary text-white shadow-lg">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-black text-lg tracking-tight uppercase">RELAY HUB</h4>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Session: v1.5 Stable</p>
                        </div>
                    </div>
                    {!isMini && (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="rounded-full text-[10px] font-black uppercase tracking-widest">Mark all Read</Button>
                            <Button variant="ghost" size="icon" className="rounded-full"><Settings className="h-4 w-4"/></Button>
                        </div>
                    )}
                    {isMini && (
                        <Link href="/dashboard/inbox">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                                <Maximize2 className="h-4 w-4 text-primary" />
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-background/80 border border-primary/10 shadow-inner">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "h-3 w-3 rounded-full animate-pulse",
                            isPushEnabled ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-red-500 shadow-[0_0_8px_#ef4444]"
                        )} />
                        <div>
                            <p className="text-xs font-black uppercase">Sovereign Alerts</p>
                            <p className="text-[10px] text-muted-foreground">{isPushEnabled ? 'Live Relay Active' : 'Relay Disconnected'}</p>
                        </div>
                    </div>
                    <Switch checked={isPushEnabled} onCheckedChange={handleTogglePush} />
                </div>
            </div>

            <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
                <div className="px-4 py-2 border-b bg-muted/20">
                    <TabsList className="grid w-full grid-cols-4 rounded-full h-10 bg-transparent gap-1">
                        <TabsTrigger value="all" className="rounded-full text-[10px] font-black uppercase data-[state=active]:bg-primary data-[state=active]:text-white">All</TabsTrigger>
                        <TabsTrigger value="missions" className="rounded-full text-[10px] font-black uppercase data-[state=active]:bg-primary data-[state=active]:text-white relative">
                            Missions
                            {hasUnreadAnnouncements && <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"/>}
                        </TabsTrigger>
                        <TabsTrigger value="allies" className="rounded-full text-[10px] font-black uppercase data-[state=active]:bg-primary data-[state=active]:text-white relative">
                            Allies
                            {hasUnreadFriendRequests && <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"/>}
                        </TabsTrigger>
                        <TabsTrigger value="treasury" className="rounded-full text-[10px] font-black uppercase data-[state=active]:bg-primary data-[state=active]:text-white">Vault</TabsTrigger>
                    </TabsList>
                </div>

                {!isMini && (
                    <div className="px-8 py-4 border-b bg-muted/5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search archives..." 
                                className="pl-10 h-11 rounded-xl bg-background/50 border-primary/10" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <ScrollArea className="flex-1">
                    <div className={cn("p-4 space-y-4", !isMini && "p-8 max-w-4xl mx-auto")}>
                        <TabsContent value="all" className="m-0 space-y-4">
                            <AnnouncementsList announcements={announcements} isMini={isMini} searchTerm={searchTerm} />
                            <FriendRequestsList requests={friendRequests} onAccept={handleAccept} onDecline={handleDecline} isMini={isMini} />
                        </TabsContent>
                        <TabsContent value="missions" className="m-0 space-y-4">
                            <AnnouncementsList announcements={announcements} isMini={isMini} searchTerm={searchTerm} />
                        </TabsContent>
                        <TabsContent value="allies" className="m-0 space-y-4">
                            <FriendRequestsList requests={friendRequests} onAccept={handleAccept} onDecline={handleDecline} isMini={isMini} />
                        </TabsContent>
                        <TabsContent value="treasury" className="m-0 space-y-4">
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
                                <Gift className="h-16 w-16 mb-4 text-primary" />
                                <p className="text-xs font-black uppercase tracking-widest">Vault Ledger Clear</p>
                            </div>
                        </TabsContent>
                    </div>
                </ScrollArea>
            </Tabs>
        </div>
    );
}

function AnnouncementsList({ announcements, isMini, searchTerm }: { announcements: any[], isMini: boolean, searchTerm: string }) {
    const filtered = announcements.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered.length === 0) return null;

    return (
        <div className="space-y-3">
            {!isMini && <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 ml-1">Intelligence Relay</h5>}
            <AnimatePresence>
                {filtered.map((ann, i) => (
                    <motion.div 
                        key={ann.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className={cn(
                            "relative overflow-hidden group transition-all duration-300 hover:shadow-lg border-primary/10",
                            i === 0 ? "bg-gradient-to-br from-primary/10 via-background to-background border-primary/30 ring-1 ring-primary/20 shadow-xl" : "bg-card"
                        )}>
                            {i === 0 && <div className="absolute top-0 right-0 p-2"><Sparkles className="h-4 w-4 text-primary animate-pulse"/></div>}
                            <CardContent className={cn("p-4 flex gap-4", isMini ? "p-3" : "p-6")}>
                                <div className={cn(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner",
                                    i === 0 ? "bg-primary text-white" : "bg-muted text-primary"
                                )}>
                                    {ann.title.toLowerCase().includes('quiz') ? <BrainCircuit className="h-6 w-6"/> : 
                                     ann.title.toLowerCase().includes('credits') ? <Trophy className="h-6 w-6"/> :
                                     <Megaphone className="h-6 w-6"/>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h6 className={cn("font-black text-sm uppercase tracking-tight truncate", i === 0 && "text-primary")}>{ann.title}</h6>
                                        <span className="text-[9px] font-black uppercase opacity-50 whitespace-nowrap ml-2">
                                            {formatDistanceToNow(ann.createdAt, { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className={cn("text-xs leading-relaxed text-muted-foreground line-clamp-2", i === 0 && "text-foreground font-medium")}>{ann.description}</p>
                                    {!isMini && i === 0 && (
                                        <div className="mt-4 flex gap-2">
                                            <Button size="sm" className="h-8 rounded-full text-[10px] font-black uppercase px-4">Execute Command</Button>
                                            <Button variant="ghost" size="sm" className="h-8 rounded-full text-[10px] font-black uppercase px-4">Archive</Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

function FriendRequestsList({ requests, onAccept, onDecline, isMini }: { requests: FriendRequest[], onAccept: (r: FriendRequest) => void, onDecline: (r: FriendRequest) => void, isMini: boolean }) {
    if (requests.length === 0) return null;

    return (
        <div className="space-y-3">
            {!isMini && <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-4 ml-1">Alliance Protocols</h5>}
            {requests.map((req, i) => (
                <Card key={req.id} className="bg-emerald-500/5 border-emerald-500/20 overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                    <CardContent className={cn("p-4 flex flex-col sm:flex-row items-center gap-4", isMini ? "p-3" : "p-6")}>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-emerald-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500" />
                            <Avatar className={cn("border-2 border-emerald-500/30", isMini ? "h-10 w-10" : "h-14 w-14")}>
                                <AvatarImage src={req.sender.photoURL} />
                                <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-black">{req.sender.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex-1 text-center sm:text-left min-w-0">
                            <p className="font-black text-sm uppercase tracking-tight truncate">{req.sender.displayName}</p>
                            <p className="text-[10px] text-emerald-600/80 font-bold uppercase tracking-widest mt-0.5">Wants to form an alliance</p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full text-destructive hover:bg-destructive/10" onClick={() => onDecline(req)}><XCircle className="h-5 w-5"/></Button>
                            <Button size={isMini ? "icon" : "sm"} className="h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20" onClick={() => onAccept(req)}>
                                {isMini ? <CheckCircle className="h-5 w-5"/> : <span className="font-black uppercase text-[10px] px-2 flex items-center gap-2"><ShieldCheck className="h-4 w-4"/>Confirm Alliance</span>}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
