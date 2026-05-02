'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Users, MessageSquare, Menu, Settings, Trophy, PanelLeft, Info, Zap, Crown as CrownIcon, TrendingUp, Sparkles, Clock, Target, Pin, Globe, UserCheck, ShieldAlert } from 'lucide-react';
import { GroupChat } from '@/components/groups/group-chat';
import { GroupLeaderboard } from '@/components/groups/group-leaderboard';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Group, GroupMember, GroupRole } from '@/context/groups-context';
import { useUsers, User } from '@/hooks/use-admin';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { ClanSettingsDialog } from '@/components/groups/clan-settings-dialog';
import { useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { clanLevelConfig } from '@/app/lib/clan-levels';
import { Progress } from '@/components/ui/progress';
import { ClanLevelRoadmapDialog } from '@/components/groups/clan-level-roadmap';
import { GroupFocus } from '@/components/groups/group-focus';
import { useGroups } from '@/hooks/use-groups';
import { useToast } from '@/hooks/use-toast';
import { usePresence } from '@/hooks/use-presence';

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

export default function GroupDetailPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.groupId as string;
    const { users, currentUserData, loading: usersLoading } = useUsers();
    const { user: currentUser } = useUser();
    const { applyXpBooster, applyLevelMaxer } = useGroups();
    const { onlineUsers } = usePresence();
    const { toast } = useToast();

    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
    const [showXpPulse, setShowXpPulse] = useState(false);
    const [isBoosting, setIsBoosting] = useState(false);

    const onlineInClan = useMemo(() => {
        const memberUids = group?.memberUids || [];
        return onlineUsers.filter(u => u.isOnline && memberUids.includes(u.uid)).length;
    }, [onlineUsers, group?.memberUids]);

    useEffect(() => {
        if (!groupId) return;
        
        setLoading(true);
        const groupDocRef = doc(db, 'groups', groupId);
        const unsubscribe = onSnapshot(groupDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                
                const memberDetails = (data.members as GroupMember[]).map((m: GroupMember) => {
                    const userDetail = users.find(u => u.uid === m.uid);
                    return userDetail ? { ...userDetail, role: m.role, studyContribution: m.studyContribution || 0 } : null;
                }).filter(Boolean) as (User & { role: GroupRole; studyContribution: number })[];
                
                setGroup({ id: docSnap.id, ...data, memberDetails, level: data.level || 1, xp: data.xp || 0, todayStudySeconds: data.todayStudySeconds || 0 } as Group);
            } else {
                setGroup(null);
                router.push('/dashboard/groups');
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching group:", error);
            setLoading(false);
            router.push('/dashboard/groups');
        });

        return () => unsubscribe();
    }, [groupId, users, router]);

    const handleUseXpBooster = async () => {
        if (!currentUser || isBoosting || !group) return;
        setIsBoosting(true);
        try {
            const success = await applyXpBooster(group.id);
            if (success) {
                setShowXpPulse(true);
                setTimeout(() => setShowXpPulse(false), 2000);
                toast({ title: "XP Boost Applied!", description: "+500 Clan XP injected successfully." });
            }
        } catch (e: any) {
            toast({ variant: 'destructive', title: "Boost Failed", description: e.message });
        } finally {
            setIsBoosting(false);
        }
    };

    const handleUseLevelMaxer = async () => {
        if (!currentUser || isBoosting || !group) return;
        setIsBoosting(true);
        try {
            const success = await applyLevelMaxer(group.id);
            if (success) {
                toast({ title: "CLAN ASCENDED!", description: "Your clan is now MAX LEVEL for the next 7 days!", className: "bg-yellow-500/10 border-yellow-500/50" });
            }
        } catch (e: any) {
            toast({ variant: 'destructive', title: "Ascension Failed", description: e.message });
        } finally {
            setIsBoosting(false);
        }
    };

    if (loading || usersLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-50"/></div>
    }

    if (!group) {
        return (
            <div className="text-center p-8">
                 <h2 className="text-xl font-bold">Group not found</h2>
                <p className="text-muted-foreground">The group may have been deleted or you might not be a member.</p>
                <Button onClick={() => router.push('/dashboard/groups')} className="mt-4">
                    <ArrowLeft className="mr-2"/> Back to My Clans
                </Button>
            </div>
        )
    }
    
    const isClanAdmin = currentUser?.id === group.createdBy;
    const isMember = group.memberUids?.includes(currentUser?.id || '');
    
    const isTempMax = group.tempMaxLevelExpires && new Date(group.tempMaxLevelExpires) > new Date();
    const currentEffectiveLevel = isTempMax ? 5 : group.level;

    const levelInfo = clanLevelConfig.find(l => l.level === currentEffectiveLevel) || clanLevelConfig[0];
    const nextLevelInfo = clanLevelConfig.find(l => l.level === currentEffectiveLevel + 1);
    const xpPercentage = nextLevelInfo ? (group.xp / nextLevelInfo.xpRequired) * 100 : 100;

    return (
       <div className="h-full relative overflow-hidden pb-32 max-w-7xl mx-auto px-4 sm:px-6">
            <AnimatePresence>
                {showXpPulse && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: [0, 0.5, 0], scale: [0, 2, 3] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="fixed inset-0 z-50 pointer-events-none bg-primary rounded-full blur-[100px]"
                    />
                )}
            </AnimatePresence>

            <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
                <SheetTrigger asChild>
                    <motion.div
                        initial={{ scale: 0, x: '-100%' }}
                        animate={{ scale: 1, x: 0 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
                        className="fixed bottom-24 left-4 z-40"
                    >
                         <Button className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-purple-600 shadow-2xl shadow-primary/30 flex flex-col gap-1 border-4 border-background">
                            <MessageSquare className="h-8 w-8"/>
                            <span className="text-[10px] font-black uppercase tracking-widest">WAR ROOM</span>
                        </Button>
                    </motion.div>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-full sm:max-w-md border-0 bg-whatsapp-style-bg">
                    <GroupChat group={group} />
                </SheetContent>
            </Sheet>

            <div className="space-y-8 mt-4">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div className="flex items-center gap-6">
                        <Button variant="outline" size="icon" className="rounded-2xl border-white/5 bg-white/5 hover:bg-primary/20 h-12 w-12" onClick={() => router.push('/dashboard/groups')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className={cn("relative p-1.5 rounded-[2rem] border-2 transition-all duration-700 shadow-2xl", isTempMax ? "animate-gold-shine border-yellow-400" : levelInfo.avatarBorderClass)}>
                            <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                                <AvatarImage src={group.logoUrl || undefined} />
                                <AvatarFallback className="bg-muted text-3xl font-black">{group.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {isTempMax && (
                                <div className="absolute -top-2 -right-2 bg-yellow-400 text-black rounded-full p-1.5 border-4 border-background shadow-lg">
                                    <CrownIcon className="h-5 w-5 fill-current"/>
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h1 className={cn("text-3xl sm:text-5xl font-black tracking-tighter uppercase italic truncate leading-none", isTempMax && "text-yellow-400")}>{group.name}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <p className="text-muted-foreground italic text-xs sm:text-sm font-medium">"{group.motto || 'No tactical objective set.'}"</p>
                                <div className="h-1 - 1 rounded-full bg-muted-foreground opacity-30" />
                                <div className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-green-500/80">{onlineInClan} Online</span>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button 
                            variant="outline" 
                            className={cn(
                                "flex-1 sm:flex-none h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 transition-all border-white/10 bg-white/5",
                                isLeaderboardOpen && "bg-primary text-white border-primary shadow-xl shadow-primary/20"
                            )}
                            onClick={() => setIsLeaderboardOpen(o => !o)}
                        >
                           <Trophy className={cn("mr-3 h-4 w-4", isLeaderboardOpen ? "text-white" : "text-amber-500")}/> {isLeaderboardOpen ? 'HIDE REGISTRY' : 'SHOW REGISTRY'}
                        </Button>
                        {isClanAdmin && (
                            <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-white/10 bg-white/5 hover:bg-primary/10" onClick={() => setIsSettingsOpen(true)}>
                                <Settings className="h-6 w-6 text-primary" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className={cn("transition-all duration-700 space-y-8", isLeaderboardOpen ? "lg:col-span-8" : "lg:col-span-12")}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className={cn("md:col-span-2 relative overflow-hidden rounded-[2.5rem] border-2 transition-colors duration-1000", isTempMax ? "bg-yellow-500/5 border-yellow-400/40 shadow-xl shadow-yellow-500/10" : "bg-muted/30 border-white/5")}>
                                <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
                                <CardHeader className="flex flex-row items-center justify-between p-6 relative z-10">
                                     <div className="flex flex-col gap-1">
                                         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary opacity-60">Clan Standing</p>
                                         <h4 className={cn("text-2xl font-black italic uppercase", isTempMax ? "text-yellow-400" : "text-white")}>
                                            {isTempMax ? "MAX ASCENDED (LVL 5)" : levelInfo.name}
                                         </h4>
                                     </div>
                                     <Button variant="secondary" size="sm" className="rounded-xl h-10 font-bold bg-white/5 border border-white/10 hover:bg-white/10" onClick={() => setIsRoadmapOpen(true)}>
                                        <Info className="mr-2 h-4 w-4 text-primary"/> Progress Roadmap
                                    </Button>
                                </CardHeader>
                                <CardContent className="px-6 pb-8 relative z-10">
                                     <div className="space-y-3">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-muted-foreground">Current Pulse</span>
                                            <span className="text-primary">{Math.round(group.xp).toLocaleString()} / {nextLevelInfo ? nextLevelInfo.xpRequired.toLocaleString() : 'MAX'} XP</span>
                                        </div>
                                        <Progress value={xpPercentage} className="h-2.5 bg-black/20" indicatorClassName={cn(isTempMax ? "animated-rainbow-progress" : "")} />
                                     </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-primary/5 border-2 border-primary/20 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 p-4"><Sparkles className="h-5 w-5 text-primary/20 animate-pulse"/></div>
                                <CardHeader className="p-6 pb-2 text-center">
                                    <CardTitle className="text-xs font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
                                        <Target className="h-4 w-4"/> TODAY'S SYNERGY
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 pt-0 text-center flex flex-col items-center justify-center h-32">
                                    <p className="text-6xl font-black text-white italic tracking-tighter drop-shadow-lg">
                                        {formatTime(group.todayStudySeconds)}
                                    </p>
                                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-2">Verified Team Effort</p>
                                </CardContent>
                            </Card>
                        </div>
                        
                        {/* Clan Boost Controls */}
                        {isMember && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(currentUserData?.inventory?.clanXpBoosters || 0) > 0 && (
                                    <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-2 border-primary/20 rounded-[2rem] overflow-hidden group">
                                        <CardContent className="p-6 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 rounded-2xl bg-primary/20 text-primary border border-primary/30 group-hover:scale-110 transition-transform">
                                                    <Zap className="h-6 w-6 fill-current"/>
                                                </div>
                                                <div>
                                                    <h4 className="font-black uppercase italic tracking-tight text-white">XP Injector</h4>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase">+500 Clan Power</p>
                                                </div>
                                            </div>
                                            <Button size="sm" className="rounded-xl px-6 font-black uppercase text-[10px] h-11" onClick={handleUseXpBooster} disabled={isBoosting}>
                                                {isBoosting ? <Loader2 className="animate-spin h-4 w-4"/> : 'ACTIVATE (x' + currentUserData?.inventory?.clanXpBoosters + ')'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                                {(currentUserData?.inventory?.clanLevelMaxers || 0) > 0 && !isTempMax && (
                                    <Card className="bg-gradient-to-br from-yellow-500/10 via-background to-background border-2 border-yellow-500/20 rounded-[2rem] overflow-hidden group">
                                        <CardContent className="p-6 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 rounded-2xl bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 group-hover:scale-110 transition-transform">
                                                    <CrownIcon className="h-6 w-6 fill-current"/>
                                                </div>
                                                <div>
                                                    <h4 className="font-black uppercase italic tracking-tight text-white">Clan Ascension</h4>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase">7D Max Authorization</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" className="rounded-xl px-6 font-black uppercase text-[10px] h-11 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10" onClick={handleUseLevelMaxer} disabled={isBoosting}>
                                                {isBoosting ? <Loader2 className="animate-spin h-4 w-4"/> : 'ASCEND (x' + currentUserData?.inventory?.clanLevelMaxers + ')'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        <GroupFocus group={group} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden">
                                <CardHeader className="bg-white/5 border-b border-white/5 p-6">
                                    <CardTitle className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.3em]">
                                        <Users className="h-4 w-4 text-primary" />
                                        WARRIORS ({group.members.length} / {levelInfo.memberLimit})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 max-h-96 overflow-y-auto">
                                     <div className="space-y-2">
                                        {group.memberDetails?.map(member => {
                                            const isOnline = onlineUsers.find(u => u.uid === member.uid)?.isOnline;
                                            return (
                                                <div key={member.uid} className="flex items-center gap-4 p-3 rounded-2xl bg-black/20 border border-white/5 group/member transition-all hover:border-primary/30">
                                                    <div className="relative">
                                                        <Avatar className="h-10 w-10 border shadow-md">
                                                            <AvatarImage src={member.photoURL} />
                                                            <AvatarFallback>{member.displayName.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        {isOnline && <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-background rounded-full shadow-[0_0_5px_#22c55e]" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm truncate uppercase tracking-tight">{member.displayName}</p>
                                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{formatTime(member.studyContribution)} INJECTED</p>
                                                    </div>
                                                    <Badge className="ml-auto text-[8px] font-black uppercase tracking-widest" variant={member.role === 'leader' ? 'default' : 'secondary'}>
                                                        {member.role}
                                                    </Badge>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card className="bg-primary/5 border-primary/20 rounded-[2.5rem] p-8">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2 mb-6">
                                    <ShieldAlert className="h-4 w-4" /> Clan Code of Conduct
                                </h4>
                                <ul className="space-y-4">
                                    {[
                                        { icon: Clock, text: "Active members sustain the clan energy. Inactivity limits rewards." },
                                        { icon: Zap, text: "Group sessions grant a 1.5x XP multiplier to all participants." },
                                        { icon: Users, text: "Promote elders who consistently log study hours in the Hub." },
                                        { icon: Target, text: "Level 5 clans unlock custom banners and global forum frames." }
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="p-1.5 rounded-lg bg-black/20"><item.icon className="h-3.5 w-3.5 text-primary opacity-60"/></div>
                                            <p className="text-xs font-medium text-slate-400 leading-relaxed italic">"{item.text}"</p>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </div>
                    </div>

                     <AnimatePresence>
                        {isLeaderboardOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                                className="lg:col-span-4 sticky top-24 h-fit"
                            >
                                <GroupLeaderboard group={group} />
                            </motion.div>
                        )}
                     </AnimatePresence>
                </div>
            </div>

            <ClanSettingsDialog group={group} isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen}/>
            <ClanLevelRoadmapDialog isOpen={isRoadmapOpen} onOpenChange={setIsRoadmapOpen} groupLogo={group.logoUrl} currentLevel={currentEffectiveLevel}/>
       </div>
    );
}
