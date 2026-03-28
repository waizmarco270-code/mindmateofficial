
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
    MessageSquare, CheckCircle, XCircle, Sparkles, BrainCircuit, X,
    Users
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
    onClose?: () => void;
}

export function InboxContent({ isMini = false, onClose }: InboxContentProps) {
    const { announcements } = useAnnouncements();
    const { 
        hasUnreadAnnouncements, hasUnreadFriendRequests, 
        markAnnouncementsAsRead, markFriendRequestsAsRead 
    } = useUnreadMessages();
    const { friendRequests, acceptFriendRequest, declineFriendRequest, friends } = useFriends();
    const { notificationPermission, requestPermission } = useFCM();
    const { toast } = useToast();
    
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

    const handleCheckMissions = () => {
        if (hasUnreadAnnouncements) markAnnouncementsAsRead();
    };

    const handleCheckAllies = () => {
        if (hasUnreadFriendRequests) markFriendRequestsAsRead();
    };

    return (
        <div className="flex flex-col h-full bg-background relative overflow-hidden">
            {/* Inbox Header - Compact on Mobile */}
            <div className={cn(
                "flex-shrink-0 border-b flex flex-col gap-2 bg-primary/5",
                isMini ? "p-4" : "p-4 sm:p-8"
            )}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 rounded-xl sm:rounded-2xl bg-yellow-400 text-black shadow-lg shadow-yellow-400/20">
                            <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                            <h4 className="font-black text-lg sm:text-xl tracking-tight uppercase italic">SOVEREIGN HUB</h4>
                            <p className="text-[8px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Intelligence Relay</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {onClose && (
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-black/10 dark:bg-white/10 hover:bg-destructive/10 text-muted-foreground hover:text-destructive" onClick={onClose}>
                                <X className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-background/80 border border-primary/10 shadow-inner mt-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className={cn(
                            "h-2 w-2 rounded-full",
                            isPushEnabled ? "bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse" : "bg-red-500 shadow-[0_0_8px_#ef4444]"
                        )} />
                        <div>
                            <p className="text-[10px] sm:text-xs font-black uppercase tracking-tighter">Emergency Relay</p>
                            <p className="text-[8px] sm:text-[9px] text-muted-foreground font-bold">{isPushEnabled ? 'PUSH ALERTS ACTIVE' : 'ALERTS DISCONNECTED'}</p>
                        </div>
                    </div>
                    <Switch checked={isPushEnabled} onCheckedChange={handleTogglePush} className="scale-75 sm:scale-100" />
                </div>
            </div>

            <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
                <div className="px-4 py-2 border-b bg-muted/20 flex-shrink-0">
                    <TabsList className="grid w-full grid-cols-4 rounded-full h-10 sm:h-11 bg-black/5 dark:bg-white/5 p-1 gap-1">
                        <TabsTrigger value="all" className="rounded-full text-[9px] sm:text-[10px] font-black uppercase data-[state=active]:bg-primary data-[state=active]:text-white">All</TabsTrigger>
                        <TabsTrigger value="missions" onClick={handleCheckMissions} className="rounded-full text-[9px] sm:text-[10px] font-black uppercase data-[state=active]:bg-primary data-[state=active]:text-white relative">
                            Missions
                            {hasUnreadAnnouncements && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 border-2 border-background animate-pulse shadow-sm"/>}
                        </TabsTrigger>
                        <TabsTrigger value="allies" onClick={handleCheckAllies} className="rounded-full text-[9px] sm:text-[10px] font-black uppercase data-[state=active]:bg-primary data-[state=active]:text-white relative">
                            Allies
                            {(hasUnreadFriendRequests || friendRequests.length > 0) && <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-red-500 text-white text-[8px] sm:text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background animate-pulse">{friendRequests.length || '!'}</span>}
                        </TabsTrigger>
                        <TabsTrigger value="archives" className="rounded-full text-[9px] sm:text-[10px] font-black uppercase data-[state=active]:bg-primary data-[state=active]:text-white">Archives</TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 min-h-0 relative">
                    <TabsContent value="all" className="h-full m-0">
                        <ScrollArea className="h-full">
                            <div className={cn("p-4 sm:p-8 space-y-6 max-w-4xl mx-auto")}>
                                <AnnouncementsList announcements={filteredAnnouncements} isMini={isMini} onCheck={handleCheckMissions} />
                                <FriendRequestsList requests={friendRequests} onAccept={handleAccept} onDecline={handleDecline} isMini={isMini} />
                            </div>
                        </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="missions" className="h-full m-0">
                        <ScrollArea className="h-full">
                            <div className={cn("p-4 sm:p-8 space-y-6 max-w-4xl mx-auto")}>
                                <AnnouncementsList announcements={filteredAnnouncements} isMini={isMini} onCheck={handleCheckMissions} />
                            </div>
                        </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="allies" className="h-full m-0">
                        <ScrollArea className="h-full">
                            <div className={cn("p-4 sm:p-8 space-y-6 max-w-4xl mx-auto")}>
                                <FriendRequestsList requests={friendRequests} onAccept={handleAccept} onDecline={handleDecline} isMini={isMini} />
                                <div className="pt-2">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4 px-1 flex items-center gap-2">
                                        <Users className="h-3 w-3"/> Your Network
                                    </h5>
                                    <div className="space-y-2 pb-20">
                                        {friends.map(friend => (
                                            <div key={friend.uid} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-white/5 group hover:border-primary/20 transition-all">
                                                <Avatar className="h-10 w-10 border border-primary/10">
                                                    <AvatarImage src={friend.photoURL}/>
                                                    <AvatarFallback>{friend.displayName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm">{friend.displayName}</p>
                                                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{friend.mindMateId || 'LEGEND'}</p>
                                                </div>
                                                <Link href="/dashboard/social" onClick={() => { if(isMini) markFriendRequestsAsRead(); if(onClose) onClose(); }}>
                                                    <Button size="icon" variant="ghost" className="rounded-full sm:opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="h-4 w-4"/></Button>
                                                </Link>
                                            </div>
                                        ))}
                                        {friends.length === 0 && <p className="text-center text-[10px] text-muted-foreground font-black uppercase py-8 opacity-40">Network Offline</p>}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="archives" className="h-full m-0">
                        <ScrollArea className="h-full">
                            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground opacity-40">
                                <div className="p-6 rounded-[2rem] bg-muted mb-4 border border-dashed border-primary/20">
                                    <BellRing className="h-12 w-12" />
                                </div>
                                <p className="text-xs font-black uppercase tracking-[0.2em]">Relay Archive Clean</p>
                                <p className="text-[10px] mt-1 text-center font-bold px-10">ALL HISTORICAL MISSIONS HAVE BEEN LOGGED</p>
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}

function AnnouncementsList({ announcements, isMini, onCheck }: { announcements: any[], isMini: boolean, onCheck: () => void }) {
    if (announcements.length === 0) {
        return (
            <div className="text-center py-12 opacity-30">
                <Megaphone className="h-12 w-12 mx-auto mb-2" />
                <p className="text-xs font-black uppercase tracking-widest">No active briefings</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-2 px-1 flex items-center gap-2"><Sparkles className="h-3 w-3"/> Directive Feed</h5>
            <AnimatePresence mode="popLayout">
                {announcements.map((ann, i) => (
                    <motion.div 
                        key={ann.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className={cn(
                            "relative overflow-hidden group transition-all duration-500 hover:shadow-2xl border-primary/5 rounded-3xl",
                            i === 0 ? "bg-gradient-to-br from-primary/10 via-background to-background border-primary/30 ring-1 ring-primary/10 shadow-xl" : "bg-card/50"
                        )}>
                            {i === 0 && <div className="absolute top-0 right-0 p-3"><div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]"/></div>}
                            <CardContent className={cn("p-4 sm:p-8 flex flex-col gap-4")}>
                                <div className="flex gap-4 sm:gap-5">
                                    <div className={cn(
                                        "h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center flex-shrink-0 shadow-lg transition-transform group-hover:scale-110 duration-500",
                                        i === 0 ? "bg-primary text-white" : "bg-muted text-primary"
                                    )}>
                                        {ann.title.toLowerCase().includes('quiz') ? <BrainCircuit className="h-6 w-6 sm:h-7 sm:w-7"/> : 
                                         ann.title.toLowerCase().includes('credits') ? <Trophy className="h-6 w-6 sm:h-7 sm:w-7"/> :
                                         <Megaphone className="h-6 w-6 sm:h-7 sm:w-7"/>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1 sm:mb-2">
                                            <h6 className={cn("font-black text-sm sm:text-base uppercase tracking-tight truncate", i === 0 && "text-primary")}>{ann.title}</h6>
                                            <span className="text-[8px] sm:text-[9px] font-black uppercase opacity-40 whitespace-nowrap ml-2 bg-muted px-2 py-0.5 rounded-full border border-white/5">
                                                {format(ann.createdAt, 'MMM d')}
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm leading-relaxed text-foreground font-medium whitespace-pre-wrap opacity-90">{ann.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                    <p className="text-[8px] sm:text-[9px] font-black uppercase text-muted-foreground tracking-widest">Pulse: {format(ann.createdAt, 'HH:mm')}</p>
                                    <Button variant="ghost" size="sm" onClick={onCheck} className="h-6 sm:h-7 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/10 rounded-full px-3 sm:px-4 border border-transparent hover:border-primary/20">Check</Button>
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
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60 mb-2 px-1 flex items-center gap-2"><CheckCircle className="h-3 w-3"/> New Alliances</h5>
            {requests.map((req, i) => (
                <Card key={req.id} className="bg-emerald-500/5 border-emerald-500/20 overflow-hidden relative group rounded-3xl">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 group-hover:w-1.5 transition-all duration-300" />
                    <CardContent className={cn("p-4 sm:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-5")}>
                        <div className="relative">
                            <div className="absolute -inset-2 bg-emerald-500/20 rounded-full blur opacity-40" />
                            <Avatar className={cn("border-2 border-emerald-500/30 shadow-xl", isMini ? "h-12 w-12" : "h-14 w-14 sm:h-16 sm:w-16")}>
                                <AvatarImage src={req.sender.photoURL} />
                                <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-black text-xl">{req.sender.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex-1 text-center sm:text-left min-w-0">
                            <p className="font-black text-base sm:text-lg uppercase tracking-tight truncate">{req.sender.displayName}</p>
                            <p className="text-[9px] sm:text-[10px] text-emerald-600/80 font-black uppercase tracking-[0.1em] mt-1 flex items-center justify-center sm:justify-start gap-2">
                                <CheckCircle className="h-3 w-3"/> UPLINK PENDING
                            </p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            <Button size="icon" variant="ghost" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl text-destructive hover:bg-destructive/10" onClick={() => onDecline(req)}><XCircle className="h-5 w-5 sm:h-6 sm:w-6"/></Button>
                            <Button size="default" className="h-10 sm:h-12 flex-1 sm:flex-initial rounded-xl sm:rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 px-4 sm:px-6" onClick={() => onAccept(req)}>
                                <span className="font-black uppercase text-[10px] sm:text-xs flex items-center gap-2 tracking-widest"><ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5"/>Confirm</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
