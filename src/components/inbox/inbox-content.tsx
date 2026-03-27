
'use client';

import { useState, useMemo } from 'react';
import { useAnnouncements, useAdmin } from '@/hooks/use-admin';
import { useUnreadMessages } from '@/hooks/use-unread';
import { useFriends, type FriendRequest } from '@/hooks/use-friends';
import { useFCM } from '@/hooks/use-fcm';
import { format } from 'date-fns';
import { 
    Mail, ArrowRight, Megaphone, ShieldCheck, 
    Gift, Trophy, Settings, Maximize2, BellRing, History, 
    MessageSquare, CheckCircle, XCircle, Sparkles, BrainCircuit
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface InboxContentProps {
    isMini?: boolean;
}

type NotificationType = 'all' | 'missions' | 'allies' | 'archives';

export function InboxContent({ isMini = false }: InboxContentProps) {
    const { announcements } = useAnnouncements();
    const { 
        hasUnreadAnnouncements, hasUnreadFriendRequests, 
        markAnnouncementsAsRead, markFriendRequestsAsRead 
    } = useUnreadMessages();
    const { friendRequests, acceptFriendRequest, declineFriendRequest, friends } = useFriends();
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

    const filteredAnnouncements = useMemo(() => {
        return announcements.filter(a => 
            a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            a.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [announcements, searchTerm]);

    return (
        <div className="flex flex-col h-full bg-background/50">
            {/* Inbox Header */}
            <div className={cn(
                "p-6 border-b flex flex-col gap-4 bg-primary/5",
                isMini ? "p-4" : "p-8"
            )}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-yellow-400 text-black shadow-lg shadow-yellow-400/20">
                            <Mail className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-black text-xl tracking-tight uppercase">SOVEREIGN HUB</h4>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">System: Active Relay</p>
                        </div>
                    </div>
                    {!isMini && (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => toast({title: "Archive Purged"})} className="rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary/10">Clear Logs</Button>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10"><Settings className="h-4 w-4"/></Button>
                        </div>
                    )}
                    {isMini && (
                        <Link href="/dashboard/inbox" onClick={() => { if(hasUnreadAnnouncements) markAnnouncementsAsRead(); }}>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                                <Maximize2 className="h-4 w-4 text-primary" />
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="flex items-center justify-between p-4 rounded-3xl bg-background/80 border border-primary/10 shadow-inner">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "h-2.5 w-2.5 rounded-full",
                            isPushEnabled ? "bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse" : "bg-red-500 shadow-[0_0_8px_#ef4444]"
                        )} />
                        <div>
                            <p className="text-xs font-black uppercase tracking-tighter">Emergency Relay</p>
                            <p className="text-[9px] text-muted-foreground font-bold">{isPushEnabled ? 'PUSH ALERTS GRANTED' : 'ALERTS DISCONNECTED'}</p>
                        </div>
                    </div>
                    <Switch checked={isPushEnabled} onCheckedChange={handleTogglePush} />
                </div>
            </div>

            <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
                <div className="px-4 py-2 border-b bg-muted/20">
                    <TabsList className="grid w-full grid-cols-4 rounded-full h-11 bg-black/5 dark:bg-white/5 p-1 gap-1">
                        <TabsTrigger value="all" className="rounded-full text-[10px] font-black uppercase data-[state=active]:bg-primary data-[state=active]:text-white">All</TabsTrigger>
                        <TabsTrigger value="missions" className="rounded-full text-[10px] font-black uppercase data-[state=active]:bg-primary data-[state=active]:text-white relative">
                            Missions
                            {hasUnreadAnnouncements && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 border-2 border-background shadow-sm"/>}
                        </TabsTrigger>
                        <TabsTrigger value="allies" className="rounded-full text-[10px] font-black uppercase data-[state=active]:bg-primary data-[state=active]:text-white relative">
                            Allies
                            {(hasUnreadFriendRequests || friendRequests.length > 0) && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 border-2 border-background shadow-sm"/>}
                        </TabsTrigger>
                        <TabsTrigger value="archives" className="rounded-full text-[10px] font-black uppercase data-[state=active]:bg-primary data-[state=active]:text-white">Relay</TabsTrigger>
                    </TabsList>
                </div>

                <ScrollArea className="flex-1">
                    <div className={cn("p-4 space-y-6", !isMini && "p-8 max-w-4xl mx-auto")}>
                        <TabsContent value="all" className="m-0 space-y-6">
                            <AnnouncementsList announcements={filteredAnnouncements} isMini={isMini} />
                            <FriendRequestsList requests={friendRequests} onAccept={handleAccept} onDecline={handleDecline} isMini={isMini} />
                        </TabsContent>
                        
                        <TabsContent value="missions" className="m-0 space-y-6">
                            <AnnouncementsList announcements={filteredAnnouncements} isMini={isMini} />
                        </TabsContent>
                        
                        <TabsContent value="allies" className="m-0 space-y-6">
                            <FriendRequestsList requests={friendRequests} onAccept={handleAccept} onDecline={handleDecline} isMini={isMini} />
                            <div className="pt-4">
                                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4 px-1">Your Active Network</h5>
                                <div className="space-y-2">
                                    {friends.map(friend => (
                                        <div key={friend.uid} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-white/5">
                                            <Avatar className="h-10 w-10 border border-primary/10">
                                                <AvatarImage src={friend.photoURL}/>
                                                <AvatarFallback>{friend.displayName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm">{friend.displayName}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Alliance Member</p>
                                            </div>
                                            <Link href="/dashboard/social" onClick={() => isMini && markFriendRequestsAsRead()}>
                                                <Button size="icon" variant="ghost" className="rounded-full"><ArrowRight className="h-4 w-4"/></Button>
                                            </Link>
                                        </div>
                                    ))}
                                    {friends.length === 0 && <p className="text-center text-[10px] text-muted-foreground font-black uppercase py-8 opacity-40">No allies found</p>}
                                </div>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="archives" className="m-0">
                            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground opacity-40">
                                <div className="p-6 rounded-full bg-muted mb-4">
                                    <BellRing className="h-12 w-12" />
                                </div>
                                <p className="text-xs font-black uppercase tracking-[0.2em]">Notification Logs Clear</p>
                                <p className="text-[10px] mt-1 text-center">ONLY SYSTEM CRITICAL BRIEFINGS ARE DISPLAYED</p>
                            </div>
                        </TabsContent>
                    </div>
                </ScrollArea>
            </Tabs>
        </div>
    );
}

function AnnouncementsList({ announcements, isMini }: { announcements: any[], isMini: boolean }) {
    if (announcements.length === 0) {
        return (
            <div className="text-center py-12 opacity-30">
                <Megaphone className="h-12 w-12 mx-auto mb-2" />
                <p className="text-xs font-black uppercase tracking-widest">No active missions</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {!isMini && <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-4 px-1">Global Intelligence Feed</h5>}
            <AnimatePresence mode="popLayout">
                {announcements.map((ann, i) => (
                    <motion.div 
                        key={ann.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className={cn(
                            "relative overflow-hidden group transition-all duration-500 hover:shadow-2xl border-primary/5",
                            i === 0 ? "bg-gradient-to-br from-primary/10 via-background to-background border-primary/30 ring-1 ring-primary/10 shadow-xl" : "bg-card/50"
                        )}>
                            {i === 0 && <div className="absolute top-0 right-0 p-3"><Sparkles className="h-5 w-5 text-primary animate-pulse"/></div>}
                            <CardContent className={cn("p-5 flex flex-col gap-4", isMini ? "p-4" : "p-8")}>
                                <div className="flex gap-5">
                                    <div className={cn(
                                        "h-14 w-14 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 shadow-lg transition-transform group-hover:scale-110 duration-500",
                                        i === 0 ? "bg-primary text-white" : "bg-muted text-primary"
                                    )}>
                                        {ann.title.toLowerCase().includes('quiz') ? <BrainCircuit className="h-7 w-7"/> : 
                                         ann.title.toLowerCase().includes('credits') ? <Trophy className="h-7 w-7"/> :
                                         <Megaphone className="h-7 w-7"/>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <h6 className={cn("font-black text-base uppercase tracking-tight truncate", i === 0 && "text-primary")}>{ann.title}</h6>
                                            <span className="text-[9px] font-black uppercase opacity-40 whitespace-nowrap ml-3 bg-muted px-2 py-0.5 rounded-full">
                                                {format(ann.createdAt, 'MMM d')}
                                            </span>
                                        </div>
                                        {/* Display Full Description as per User Blueprint */}
                                        <p className="text-sm leading-relaxed text-foreground font-medium whitespace-pre-wrap">{ann.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                    <p className="text-[9px] font-black uppercase text-muted-foreground">Pulse Recorded: {format(ann.createdAt, 'HH:mm')}</p>
                                    <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">Details</Button>
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
        <div className="space-y-4">
            {!isMini && <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60 mb-4 px-1">Alliance Directives</h5>}
            {requests.map((req, i) => (
                <Card key={req.id} className="bg-emerald-500/5 border-emerald-500/20 overflow-hidden relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 group-hover:w-2 transition-all duration-300" />
                    <CardContent className={cn("p-5 flex flex-col sm:flex-row items-center gap-5", isMini ? "p-4" : "p-8")}>
                        <div className="relative">
                            <div className="absolute -inset-2 bg-emerald-500/20 rounded-full blur opacity-40" />
                            <Avatar className={cn("border-2 border-emerald-500/30 shadow-xl", isMini ? "h-12 w-12" : "h-16 w-16")}>
                                <AvatarImage src={req.sender.photoURL} />
                                <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-black text-xl">{req.sender.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex-1 text-center sm:text-left min-w-0">
                            <p className="font-black text-lg uppercase tracking-tight truncate">{req.sender.displayName}</p>
                            <p className="text-[10px] text-emerald-600/80 font-black uppercase tracking-[0.1em] mt-1 flex items-center justify-center sm:justify-start gap-2">
                                <CheckCircle className="h-3 w-3"/> NEW ALLIANCE REQUESTED
                            </p>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20" onClick={() => onDecline(req)}><XCircle className="h-6 w-6"/></Button>
                            <Button size={isMini ? "icon" : "default"} className="h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 px-6" onClick={() => onAccept(req)}>
                                {isMini ? <CheckCircle className="h-6 w-6"/> : <span className="font-black uppercase text-xs flex items-center gap-2 tracking-widest"><ShieldCheck className="h-5 w-5"/>Confirm Alliance</span>}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
