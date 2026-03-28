
'use client';

import { useMemo, useState } from 'react';
import { useAdmin, User, SUPER_ADMIN_UID, BadgeType } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    Code, ShieldCheck, Crown, Gamepad2, Swords, Bird, Moon, Flame, 
    Users, Trophy, Star, ChevronRight, Search, Info, Loader2, Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const badgeMeta: Record<BadgeType, { 
    name: string; 
    icon: React.ElementType; 
    gradient: string; 
    description: string;
    requirement: string;
    badge: JSX.Element;
}> = {
    dev: { 
        name: 'Developer', 
        icon: Code, 
        gradient: 'from-red-500 to-rose-500', 
        description: 'The master architects of the MindMate mainframe.',
        requirement: 'Hard-coded for the creators.',
        badge: <span className="dev-badge"><Code className="h-3 w-3" /> DEV</span>
    },
    'co-dev': { 
        name: 'Co-Developer', 
        icon: Code, 
        gradient: 'from-red-500 to-rose-500', 
        description: 'Elite contributors to the MindMate source code.',
        requirement: 'Awarded by the Head Developer for technical excellence.',
        badge: <span className="co-dev-badge"><Code className="h-3 w-3"/> Co-Dev</span>
    },
    admin: { 
        name: 'Admin', 
        icon: ShieldCheck, 
        gradient: 'from-green-500 to-emerald-500', 
        description: 'Guardians of the MindMate community and protocol.',
        requirement: 'Chosen by the High Council to manage citizens.',
        badge: <span className="admin-badge"><ShieldCheck className="h-3 w-3" /> ADMIN</span>
    },
    vip: { 
        name: 'Elite Member', 
        icon: Crown, 
        gradient: 'from-amber-400 to-yellow-500', 
        description: 'Citizens who have ascended to the highest social tier.',
        requirement: 'Reach significant milestones or be awarded for dedication.',
        badge: <span className="elite-badge"><Crown className="h-3 w-3" /> ELITE</span>
    },
    gm: { 
        name: 'Game Master', 
        icon: Gamepad2, 
        gradient: 'from-blue-500 to-sky-500', 
        description: 'The supreme champions of the Game Zone.',
        requirement: 'Awarded weekly to the #1 player on the Game Leaderboard.',
        badge: <span className="gm-badge">GM</span>
    },
    challenger: { 
        name: 'Challenger', 
        icon: Swords, 
        gradient: 'from-orange-500 to-red-500', 
        description: 'Warriors who conquer the impossible in the Challenger Zone.',
        requirement: 'Successfully complete a 7-day or 30-day disciplinary challenge.',
        badge: <span className="challenger-badge"><Swords className="h-3 w-3"/> Challenger</span>
    },
    'early-bird': { 
        name: 'Early Bird', 
        icon: Bird, 
        gradient: 'from-orange-400 to-yellow-500', 
        description: 'Legends who dominate their goals before the sun rises.',
        requirement: 'Consistently complete morning study sessions (4 AM - 8 AM).',
        badge: <span className="early-bird-badge"><Bird className="h-3 w-3"/> EARLY BIRD</span>
    },
    'night-owl': { 
        name: 'Night Owl', 
        icon: Moon, 
        gradient: 'from-indigo-600 to-purple-900', 
        description: 'The nocturnal guardians who outwork the world in darkness.',
        requirement: 'Complete high-focus sessions between midnight and 4 AM.',
        badge: <span className="night-owl-badge"><Moon className="h-3 w-3"/> NIGHT OWL</span>
    },
    'knowledge-knight': { 
        name: 'Knowledge Knight', 
        icon: ShieldCheck, 
        gradient: 'from-slate-600 to-gray-800', 
        description: 'Defenders of academic integrity and wisdom sharing.',
        requirement: 'Perfect 10+ quizzes and mark 50+ nuggets in the Global Forum.',
        badge: <span className="knowledge-knight-badge"><ShieldCheck className="h-3 w-3"/> KNIGHT</span>
    },
    streaker: { 
        name: 'Streaker', 
        icon: Flame, 
        gradient: 'from-orange-600 to-red-600', 
        description: 'Possessors of the Eternal Flame. Absolute masters of consistency.',
        requirement: 'Achieve and complete a full 30-day study streak.',
        badge: <span className="streaker-badge"><Flame className="h-3 w-3"/> STREAKER</span>
    }
};

function BadgeDetailsDialog({ badgeKey, isOpen, onOpenChange, users }: { badgeKey: BadgeType | null, isOpen: boolean, onOpenChange: (o: boolean) => void, users: User[] }) {
    const [seeAll, setSeeAll] = useState(false);
    
    const owners = useMemo(() => {
        if (!badgeKey) return [];
        return users.filter(u => {
            if (badgeKey === 'dev') return u.uid === SUPER_ADMIN_UID;
            if (badgeKey === 'co-dev') return u.isCoDev;
            if (badgeKey === 'admin') return u.isAdmin;
            if (badgeKey === 'vip') return u.isVip;
            if (badgeKey === 'gm') return u.isGM;
            if (badgeKey === 'challenger') return u.isChallenger;
            if (badgeKey === 'streaker') return u.isStreaker;
            if (badgeKey === 'early-bird') return u.isEarlyBird;
            if (badgeKey === 'night-owl') return u.isNightOwl;
            if (badgeKey === 'knowledge-knight') return u.isKnowledgeKnight;
            return false;
        }).sort((a, b) => (b.credits || 0) - (a.credits || 0));
    }, [badgeKey, users]);

    if (!badgeKey) return null;
    const meta = badgeMeta[badgeKey];

    return (
        <Dialog open={isOpen} onOpenChange={(o) => { onOpenChange(o); if(!o) setSeeAll(false); }}>
            <DialogContent className="max-w-xl p-0 overflow-hidden border-primary/20 bg-background/95 backdrop-blur-xl">
                <div className={cn("h-32 flex items-center justify-center relative", meta.gradient)}>
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative p-4 rounded-3xl bg-black/20 border-2 border-white/20 shadow-2xl">
                        <meta.icon className="h-12 w-12 text-white" />
                    </div>
                </div>
                
                <div className="p-6 space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-3xl font-black tracking-tight uppercase italic">{meta.name}</h2>
                            {meta.badge}
                        </div>
                        <p className="text-muted-foreground font-medium">{meta.description}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Requirement</p>
                        <p className="text-sm font-bold">{meta.requirement}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary"/> Verified Masters ({owners.length})
                            </h4>
                            {owners.length > 5 && (
                                <button onClick={() => setSeeAll(!seeAll)} className="text-[10px] font-black uppercase text-primary hover:underline">
                                    {seeAll ? 'Show Top 5' : 'See All'}
                                </button>
                            )}
                        </div>

                        <ScrollArea className={cn("rounded-2xl border bg-muted/30", seeAll ? "h-64" : "h-auto")}>
                            <div className="p-2 space-y-1">
                                {(seeAll ? owners.slice(0, 100) : owners.slice(0, 5)).map((owner, i) => (
                                    <div key={owner.uid} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                                        <div className="font-black text-[10px] text-muted-foreground w-4">{i + 1}</div>
                                        <Avatar className="h-8 w-8 border">
                                            <AvatarImage src={owner.photoURL} />
                                            <AvatarFallback>{owner.displayName?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{owner.displayName}</p>
                                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">{owner.mindMateId || 'LEGEND'}</p>
                                        </div>
                                        {i === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                                    </div>
                                ))}
                                {owners.length === 0 && (
                                    <div className="p-8 text-center opacity-40">
                                        <ShieldCheck className="h-8 w-8 mx-auto mb-2" />
                                        <p className="text-xs font-black uppercase">No holders found</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
                <DialogFooter className="p-4 bg-muted/30 border-t">
                    <DialogClose asChild><Button className="w-full h-12 font-black uppercase tracking-widest">Understood</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function BadgesTreasuryPage() {
    const { users, loading } = useAdmin();
    const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBadges = useMemo(() => {
        return (Object.keys(badgeMeta) as BadgeType[]).filter(key => 
            badgeMeta[key].name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            badgeMeta[key].description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            <div className="text-center space-y-4">
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                        BADGE TREASURY
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        The ultimate registry of rank and honor in the MindMate ecosystem. Earn your place among the legends.
                    </p>
                </motion.div>
            </div>

            <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Filter by badge name or perk..." 
                    className="pl-10 h-12 rounded-2xl bg-muted/50 border-primary/10"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBadges.map((key, i) => {
                    const meta = badgeMeta[key];
                    const ownerCount = users.filter(u => {
                        if (key === 'dev') return u.uid === SUPER_ADMIN_UID;
                        if (key === 'co-dev') return u.isCoDev;
                        if (key === 'admin') return u.isAdmin;
                        if (key === 'vip') return u.isVip;
                        if (key === 'gm') return u.isGM;
                        if (key === 'challenger') return u.isChallenger;
                        if (key === 'streaker') return u.isStreaker;
                        if (key === 'early-bird') return u.isEarlyBird;
                        if (key === 'night-owl') return u.isNightOwl;
                        if (key === 'knowledge-knight') return u.isKnowledgeKnight;
                        return false;
                    }).length;

                    return (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => setSelectedBadge(key)}
                            className="cursor-pointer group"
                        >
                            <Card className="h-full flex flex-col relative overflow-hidden hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 rounded-[2rem]">
                                <div className={cn("absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity", meta.gradient)} />
                                <CardHeader className="p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className={cn("p-4 rounded-3xl bg-black/5 dark:bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500", meta.gradient.replace('from-', 'text-'))}>
                                            <meta.icon className="h-8 w-8" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Holders</p>
                                            <p className="text-2xl font-black">{ownerCount}</p>
                                        </div>
                                    </div>
                                    <CardTitle className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-2">
                                        {meta.name}
                                        <Sparkles className="h-4 w-4 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </CardTitle>
                                    <CardDescription className="text-base line-clamp-2 mt-2 font-medium">
                                        {meta.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="mt-auto p-8 pt-0">
                                    <div className="w-full flex items-center justify-between">
                                        <div className="scale-90 origin-left">{meta.badge}</div>
                                        <Button variant="ghost" size="sm" className="rounded-full text-primary hover:bg-primary/10">
                                            Inspect <ChevronRight className="ml-1 h-4 w-4"/>
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            <BadgeDetailsDialog 
                badgeKey={selectedBadge} 
                isOpen={!!selectedBadge} 
                onOpenChange={(o) => !o && setSelectedBadge(null)} 
                users={users}
            />
        </div>
    );
}
