
'use client';

import { useAdmin } from '@/hooks/use-admin';
import { Button } from '@/components/ui/button';
import { 
    Users, Key, ShieldAlert, Terminal, 
    Gift, Zap, LayoutDashboard, ArrowLeft,
    ShieldX
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

const adminNav = [
    { href: '/dashboard/super-admin', icon: LayoutDashboard, label: 'Hub' },
    { href: '/dashboard/super-admin/users', icon: Users, label: 'Users' },
    { href: '/dashboard/super-admin/maintenance', icon: Terminal, label: 'Config' },
    { href: '/dashboard/super-admin/gifts', icon: Gift, label: 'Gifts' },
    { href: '/dashboard/super-admin/api', icon: Key, label: 'API' },
    { href: '/dashboard/super-admin/overrides', icon: Zap, label: 'Overrides' },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const { isSuperAdmin, loading } = useAdmin();
    const pathname = usePathname();

    if (loading) return null;

    if (!isSuperAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Card className="w-full max-w-md border-destructive/50">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 text-destructive">
                            <ShieldX className="h-8 w-8"/> Access Denied
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full space-y-6">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter italic uppercase text-primary">Sovereign Command</h1>
                    <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Protocol: Mainframe Governance</p>
                </div>
                <div className="flex gap-2 p-1 bg-muted/50 rounded-xl border overflow-x-auto w-full sm:w-auto">
                    {adminNav.map(item => (
                        <Button 
                            key={item.href} 
                            asChild 
                            variant={pathname === item.href ? 'default' : 'ghost'}
                            size="sm"
                            className="rounded-lg h-9"
                        >
                            <Link href={item.href}>
                                <item.icon className="h-4 w-4 mr-2" />
                                <span className="hidden md:inline">{item.label}</span>
                            </Link>
                        </Button>
                    ))}
                </div>
            </header>
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
