
'use client';

import { BadgeType, SUPER_ADMIN_UID } from '@/hooks/use-admin';
import { 
    Code, ShieldCheck, Crown, Gamepad2, Swords, Bird, Moon, Flame, 
    ShieldAlert, Anchor, Lock, Zap, CheckCircle, Sparkles, Skull
} from 'lucide-react';
import { UserWithStats } from '@/hooks/use-leaderboard-data';
import { cn } from '@/lib/utils';

export const SkullFire = ({ className }: { className?: string }) => (
  <div className={cn(className, "relative flex items-center justify-center")}>
    <Skull className="h-full w-full" />
    <div className="absolute inset-0 flex items-center justify-center opacity-80 pointer-events-none">
        <Sparkles className="h-[35%] w-[35%] text-orange-500 animate-pulse" style={{ transform: 'translate(-20%, -10%)' }} />
        <Sparkles className="h-[35%] w-[35%] text-orange-500 animate-pulse" style={{ transform: 'translate(20%, -10%)' }} />
    </div>
  </div>
);

export const badgeMeta: Record<BadgeType, { name: string; badge: JSX.Element }> = {
    dev: { name: 'Developer', badge: <span className="dev-badge"><Code className="h-3 w-3" /> DEV</span> },
    'co-dev': { name: 'Co-Developer', badge: <span className="co-dev-badge"><Code className="h-3 w-3"/> Co-Dev</span> },
    admin: { name: 'Admin', badge: <span className="admin-badge"><ShieldCheck className="h-3 w-3" /> ADMIN</span> },
    vip: { name: 'Elite Member', badge: <span className="elite-badge"><Crown className="h-3 w-3" /> ELITE</span> },
    gm: { name: 'Game Master', badge: <span className="gm-badge">GM</span> },
    challenger: { name: 'Challenger', badge: <span className="challenger-badge"><Swords className="h-3 w-3"/> Challenger</span> },
    champion: { name: 'Champion', badge: <span className="champion-badge"><SkullFire className="h-3.5 w-3.5"/> Champion</span> },
    'early-bird': { name: 'Early Bird', badge: <span className="early-bird-badge"><Bird className="h-3 w-3"/> EARLY BIRD</span> },
    'night-owl': { name: 'Night Owl', badge: <span className="night-owl-badge"><Moon className="h-3 w-3"/> NIGHT OWL</span> },
    'knowledge-knight': { name: 'Knowledge Knight', badge: <span className="knowledge-knight-badge"><ShieldCheck className="h-3 w-3"/> KNIGHT</span> },
    streaker: { name: 'Streaker', badge: <span className="streaker-badge"><Flame className="h-3 w-3"/> STREAKER</span> },
    isolater: { name: 'Isolater', badge: <span className="isolater-badge">ISOLATER</span> },
    'iso-warrior': { name: 'ISO-Warrior', badge: <span className="iso-warrior-badge">ISO-WARRIOR</span> },
    warrior: { name: 'Warrior', badge: <span className="warrior-badge">WARRIOR</span> },
    'iso-master': { name: 'ISO-Master', badge: <span className="iso-master-badge">ISO-MASTER</span> },
    sovereign: { name: 'Sovereign', badge: <span className="sovereign-badge">Sovereign</span> },
    premium: { name: 'Premium', badge: <span className="premium-badge"><Crown className="h-3 w-3"/> PREMIUM</span> }
};

export function getOwnedBadges(user: any) {
    if (!user) return [];
    const isSuperAdmin = user.uid === SUPER_ADMIN_UID;
    const badges: BadgeType[] = [];
    if (isSuperAdmin) badges.push('dev');
    if (user.isPlusMember) badges.push('premium');
    if (user.isCoDev) badges.push('co-dev');
    if (user.isAdmin) badges.push('admin');
    if (user.isVip) badges.push('vip');
    if (user.isGM) badges.push('gm');
    if (user.isChallenger) badges.push('challenger');
    if (user.isChampion) badges.push('champion');
    if (user.isEarlyBird) badges.push('early-bird');
    if (user.isNightOwl) badges.push('night-owl');
    if (user.isKnowledgeKnight) badges.push('knowledge-knight');
    if (user.isStreaker) badges.push('streaker');
    if (user.isIsolater) badges.push('isolater');
    if (user.isIsoWarrior) badges.push('iso-warrior');
    if (user.isWarrior) badges.push('warrior');
    if (user.isIsoMaster) badges.push('iso-master');
    if (user.isSovereign) badges.push('sovereign');
    return badges;
}

export function ShowcaseBadge({ user }: { user: any }) {
    if (!user) return null;
    const owned = getOwnedBadges(user);
    if (owned.length === 0) return null;
    
    const badgeKey = user.showcasedBadge && owned.includes(user.showcasedBadge) 
        ? user.showcasedBadge 
        : owned[0];
        
    return badgeMeta[badgeKey]?.badge ?? null;
}
