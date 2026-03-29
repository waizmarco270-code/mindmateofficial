
'use client';

import { useAdmin } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
    Users, ShieldAlert, Terminal, Gift, 
    Key, Zap, TrendingUp, Clock, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { usePresence } from '@/hooks/use-presence';
import { Badge } from '@/components/ui/badge';

export default function SuperAdminHub() {
    const { users, isolationExitRequests } = useAdmin();
    const { onlineUsers } = usePresence();
    const onlineCount = (onlineUsers || []).filter(u => u.isOnline).length;

    const stats = [
        { label: 'Total Citizens', value: users.length, icon: Users, color: 'text-primary' },
        { label: 'Online Legends', value: onlineCount, icon: Zap, color: 'text-green-500', isPulse: true },
        { label: 'Active Appeals', value: isolationExitRequests.length, icon: ShieldAlert, color: 'text-red-500' },
        { label: 'System Health', value: 'Stable', icon: ShieldCheck, color: 'text-blue-500' },
    ];

    const modules = [
        { href: '/dashboard/super-admin/users', title: 'User Authority', desc: 'Roles, Bans & Master Cards', icon: Users, color: 'bg-primary/10 text-primary' },
        { href: '/dashboard/super-admin/appeals', title: 'Isolation Appeals', desc: 'Review breach requests', icon: ShieldAlert, color: 'bg-red-500/10 text-red-500' },
        { href: '/dashboard/super-admin/maintenance', title: 'Config & Briefings', desc: 'Lockdown & Changelogs', icon: Terminal, color: 'bg-amber-500/10 text-amber-500' },
        { href: '/dashboard/super-admin/gifts', title: 'Global Gifts', desc: 'Dispatch rewards to all', icon: Gift, color: 'bg-pink-500/10 text-pink-500' },
        { href: '/dashboard/super-admin/api', title: 'API & Continuity', desc: 'Memory & External Links', icon: Key, color: 'bg-cyan-500/10 text-cyan-500' },
        { href: '/dashboard/super-admin/overrides', title: 'System Overrides', desc: 'Intelligence & Credits', icon: Zap, color: 'bg-indigo-500/10 text-indigo-500' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(s => (
                    <Card key={s.label} className="bg-card/50 backdrop-blur-sm">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 flex items-center justify-between">
                            <span className="text-3xl font-black">{s.value}</span>
                            <s.icon className={cn("h-6 w-6 opacity-20", s.color, s.isPulse && "animate-pulse")} />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map(mod => (
                    <Link key={mod.href} href={mod.href}>
                        <Card className="h-full hover:border-primary/50 transition-all group cursor-pointer overflow-hidden relative">
                            <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]" />
                            <CardHeader className="relative z-10">
                                <div className={cn("p-3 rounded-2xl w-fit mb-4", mod.color)}>
                                    <mod.icon className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-xl font-bold uppercase italic">{mod.title}</CardTitle>
                                <CardDescription className="font-medium">{mod.desc}</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
