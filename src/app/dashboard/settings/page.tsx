

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User as UserIcon, Palette, LifeBuoy, ArrowRight, Sun, Moon, Info, Gavel, Monitor, Shield, KeyRound, Lock, CheckCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

// Re-integrating components that were on separate pages
import FaqContent from '../faq/page';
import AboutContent from '../about/page';
import RulesContent from '../rules/page';
import { useAdmin, useUsers, SUPER_ADMIN_UID, AppThemeId } from '@/hooks/use-admin';
import { useUser, UserProfile } from '@clerk/nextjs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogClose, DialogFooter } from '@/components/ui/dialog';

const THEME_COST = 200;

const availableThemes: {id: AppThemeId, name: string, bg: string, primary: string, isDark: boolean}[] = [
    { id: 'light', name: 'Default Light', bg: 'bg-white', primary: 'bg-slate-900', isDark: false },
    { id: 'dark', name: 'Default Dark', bg: 'bg-slate-900', primary: 'bg-slate-50', isDark: true },
    { id: 'emerald-dream', name: 'Emerald Dream', bg: 'bg-emerald-50', primary: 'bg-emerald-600', isDark: false },
    { id: 'solar-flare', name: 'Solar Flare', bg: 'bg-gray-900', primary: 'bg-orange-500', isDark: true },
    { id: 'synthwave-sunset', name: 'Synthwave Sunset', bg: 'bg-indigo-950', primary: 'bg-fuchsia-500', isDark: true },
]


function AppearanceSettings() {
    const { theme, setTheme } = useTheme();
    const { user } = useUser();
    const { currentUserData, unlockThemeForUser } = useUsers();
    const [themeToUnlock, setThemeToUnlock] = useState<typeof availableThemes[0] | null>(null);
    const { toast } = useToast();

    const unlockedThemes = currentUserData?.unlockedThemes || [];

    const handleUnlockTheme = async () => {
        if (!themeToUnlock || !user || !currentUserData) return;
        if (currentUserData.credits < THEME_COST) {
            toast({ variant: "destructive", title: "Insufficient Credits" });
            return;
        }
        try {
            await unlockThemeForUser(user.id, themeToUnlock.id, THEME_COST);
            setTheme(themeToUnlock.id); // Apply the new theme immediately
            toast({ title: `Theme "${themeToUnlock.name}" Unlocked!` });
            setThemeToUnlock(null);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Unlock Failed", description: error.message });
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the app.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <Label>System</Label>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <p className="font-medium">Sync with System</p>
                            <p className="text-xs text-muted-foreground">
                                Automatically switch between light and dark themes.
                            </p>
                        </div>
                        <Button
                            variant={theme === 'system' ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setTheme('system')}
                        >
                            <Monitor className="h-5 w-5" />
                        </Button>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <Label>Themes</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {availableThemes.map(t => {
                            const isUnlocked = unlockedThemes.includes(t.id) || t.id === 'light' || t.id === 'dark';
                            const isActive = theme === t.id;

                            return (
                                <div key={t.id} className="relative">
                                    <button
                                        onClick={() => {
                                            if (isUnlocked) setTheme(t.id);
                                            else setThemeToUnlock(t);
                                        }}
                                        className={cn("w-full p-4 border-2 rounded-lg space-y-2 text-left transition-all",
                                            isActive ? 'border-primary ring-2 ring-primary/50' : 'border-border hover:border-primary/50',
                                            !isUnlocked && 'blur-sm'
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={cn("h-6 w-10 rounded-md flex items-center justify-end p-1", t.bg)}>
                                                <div className={cn("h-3 w-3 rounded-full", t.primary)}></div>
                                            </div>
                                            <span className="font-semibold text-sm">{t.name}</span>
                                        </div>
                                    </button>
                                     {!isUnlocked && (
                                        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] rounded-lg flex flex-col items-center justify-center p-2">
                                            <Button 
                                                className="w-full h-full flex flex-col" 
                                                variant="ghost" 
                                                onClick={() => setThemeToUnlock(t)}
                                            >
                                                <Lock className="h-6 w-6 mb-1 text-muted-foreground"/>
                                                <p className="text-xs font-bold">Unlock for</p>
                                                <p className="text-sm font-bold text-primary">{THEME_COST} credits</p>
                                            </Button>
                                        </div>
                                     )}
                                     {isActive && (
                                         <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
                                             <CheckCircle className="h-4 w-4"/>
                                         </div>
                                     )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </CardContent>

             <AlertDialog open={!!themeToUnlock} onOpenChange={() => setThemeToUnlock(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unlock "{themeToUnlock?.name}" Theme?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will deduct {THEME_COST} credits from your account. This action is permanent.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUnlockTheme}>Unlock</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
