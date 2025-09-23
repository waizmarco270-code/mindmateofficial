

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User as UserIcon, Palette, Gift, LifeBuoy, ArrowRight, Sun, Moon, Info, Gavel, FileText, Monitor, Shield, KeyRound, Trash2, Copy, Check, Medal, Flame, Zap, ListChecks, Code, ShieldCheck, Crown, Gamepad2, Swords } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

// Re-integrating components that were on separate pages
import FaqContent from '../faq/page';
import AboutContent from '../about/page';
import RulesContent from '../rules/page';
import { useAdmin, useUsers, SUPER_ADMIN_UID } from '@/hooks/use-admin';
import { useUser, useClerk, UserProfile } from '@clerk/nextjs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';


function AppearanceSettings() {
    const { theme, setTheme } = useTheme();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the app.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label>Theme</Label>
                        <p className="text-xs text-muted-foreground">
                            Switch between light, dark, and system modes.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={theme === 'light' ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setTheme('light')}
                        >
                            <Sun className="h-5 w-5" />
                        </Button>
                         <Button
                            variant={theme === 'dark' ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setTheme('dark')}
                        >
                            <Moon className="h-5 w-5" />
                        </Button>
                        <Button
                            variant={theme === 'system' ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setTheme('system')}
                        >
                            <Monitor className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function AccountSettings() {
    return (
        <Card>
            <CardContent className="p-0">
                 <UserProfile
                    routing="hash"
                    appearance={{
                        variables: {
                            colorBackground: 'hsl(var(--background))',
                            colorText: 'hsl(var(--foreground))',
                            colorPrimary: 'hsl(var(--primary))',
                            colorInputBackground: 'hsl(var(--input))',
                            colorInputText: 'hsl(var(--foreground))',
                        },
                        elements: {
                            card: {
                                boxShadow: 'none',
                                width: '100%',
                            },
                            scrollBox: {
                                padding: '1.5rem' // Corresponds to p-6
                            },
                            navbar: {
                                padding: '1.5rem',
                            },
                            navbarMobileMenuButton: {
                                 color: 'hsl(var(--foreground))',
                            }
                        }
                    }}
                 />
            </CardContent>
        </Card>
    );
}


function AdminSettings() {
    const { isSuperAdmin } = useAdmin();
    return (
         <Card>
            <CardHeader>
                <CardTitle>Admin Access</CardTitle>
                <CardDescription>Access administrative panels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Link href="/dashboard/admin" className="block">
                    <Card className="hover:bg-muted transition-colors">
                        <CardHeader className="flex-row items-center gap-4">
                            <Shield className="h-8 w-8 text-primary"/>
                            <div>
                                <CardTitle className="text-lg">Admin Panel</CardTitle>
                                <CardDescription>Manage application content and users.</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>
                {isSuperAdmin && (
                    <Link href="/dashboard/super-admin" className="block">
                        <Card className="hover:bg-muted transition-colors border-amber-500/50">
                            <CardHeader className="flex-row items-center gap-4">
                                <KeyRound className="h-8 w-8 text-amber-500"/>
                                <div>
                                    <CardTitle className="text-lg">Super Admin Panel</CardTitle>
                                    <CardDescription>Access root-level application controls.</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}

export default function SettingsPage() {
    const { isAdmin, isSuperAdmin } = useAdmin();
    const showAdminTab = isAdmin || isSuperAdmin;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Settings className="h-8 w-8 text-primary" />
                    Settings & Info
                </h1>
                <p className="text-muted-foreground">Manage your account, preferences, and app settings.</p>
            </div>
            
            <Tabs defaultValue="account" className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <TabsList className="md:col-span-1 flex flex-col h-auto bg-transparent p-0 border-r">
                    <TabsTrigger value="account" className="w-full justify-start text-base py-3 px-4 rounded-r-none data-[state=active]:border-r-2 data-[state=active]:border-primary"><UserIcon className="mr-3"/> Account</TabsTrigger>
                    <TabsTrigger value="appearance" className="w-full justify-start text-base py-3 px-4 rounded-r-none data-[state=active]:border-r-2 data-[state=active]:border-primary"><Palette className="mr-3"/> Appearance</TabsTrigger>
                    <TabsTrigger value="about" className="w-full justify-start text-base py-3 px-4 rounded-r-none data-[state=active]:border-r-2 data-[state=active]:border-primary"><Info className="mr-3"/> About & FAQ</TabsTrigger>
                    <TabsTrigger value="rules" className="w-full justify-start text-base py-3 px-4 rounded-r-none data-[state=active]:border-r-2 data-[state=active]:border-primary"><Gavel className="mr-3"/> Rules & Regulations</TabsTrigger>
                     {showAdminTab && (
                        <TabsTrigger value="admin" className="w-full justify-start text-base py-3 px-4 rounded-r-none data-[state=active]:border-r-2 data-[state=active]:border-primary"><Shield className="mr-3"/> Admin</TabsTrigger>
                    )}
                </TabsList>
                
                <div className="md:col-span-3">
                     <TabsContent value="account">
                        <AccountSettings />
                    </TabsContent>
                    <TabsContent value="appearance">
                        <AppearanceSettings />
                    </TabsContent>
                    <TabsContent value="about" className="space-y-8">
                         <Card>
                            <CardHeader><CardTitle>About MindMate</CardTitle></CardHeader>
                            <CardContent><AboutContent /></CardContent>
                         </Card>
                         <Card>
                             <CardHeader><CardTitle>Frequently Asked Questions</CardTitle></CardHeader>
                            <CardContent><FaqContent /></CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="rules">
                        <Card>
                            <CardHeader><CardTitle>Rules & Regulations</CardTitle></CardHeader>
                            <CardContent><RulesContent /></CardContent>
                        </Card>
                    </TabsContent>
                    {showAdminTab && (
                        <TabsContent value="admin">
                            <AdminSettings />
                        </TabsContent>
                    )}
                </div>
            </Tabs>
        </div>
    );
}

// Dummy Label to satisfy the compiler for the nested component
const Label = ({ children, ...props }: React.ComponentProps<'label'>) => <label {...props}>{children}</label>;
