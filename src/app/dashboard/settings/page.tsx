
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User as UserIcon, Palette, Gift, LifeBuoy, ArrowRight, Sun, Moon, Info, Gavel, FileText, Monitor, Shield, KeyRound, Trash2, Copy, Check, Medal, Flame, Zap, ListChecks, Code, ShieldCheck, Crown, Gamepad2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

// Re-integrating components that were on separate pages
import FaqContent from '../faq/page';
import AboutContent from '../about/page';
import ToolsContent from '../tools/page';
import RulesContent from '../rules/page';
import { useAdmin, useUsers, SUPER_ADMIN_UID } from '@/hooks/use-admin';
import { useUser, useClerk } from '@clerk/nextjs';
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
    const { user, isLoaded } = useUser();
    const { currentUserData, loading: usersLoading, deleteUserData } = useUsers();
    const { toast } = useToast();
    const { signOut } = useClerk();

    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteStep, setDeleteStep] = useState(0);
    const [password, setPassword] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    
    const loading = !isLoaded || usersLoading;

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }
    
    if (!user || !currentUserData) {
        return <p>User not found.</p>
    }

    const handleDelete = async () => {
        if (!user || !password) {
            toast({ variant: 'destructive', title: "Password is required." });
            return;
        }

        setIsDeleting(true);
        try {
            await deleteUserData(password);
            toast({ title: "Account Data Deleted", description: "You will be logged out." });
            setTimeout(() => {
                signOut(() => window.location.href = '/');
            }, 2000);
        } catch (error: any) {
             toast({ variant: 'destructive', title: "Deletion Failed", description: error.message || "Please check your password and try again." });
        } finally {
            setIsDeleting(false);
            setDeleteStep(0);
            setPassword('');
        }
    };
    
    const renderDeleteDialogContent = () => {
        switch (deleteStep) {
            case 1:
                return (
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone. This will permanently delete all your data, including credits, progress, friends, and settings.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteStep(0)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => setDeleteStep(2)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                );
            case 2:
                 return (
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
                            <AlertDialogDescription>To confirm, please enter your password. Your account will be logged out and all data will be erased permanently.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password..." />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteStep(0)}>Cancel</AlertDialogCancel>
                            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting || !password}>
                                {isDeleting ? 'Deleting...' : 'Delete My Data Forever'}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                );
            default:
                return null;
        }
    };

    const handleCopyId = () => {
        navigator.clipboard.writeText(user.id);
        setIsCopied(true);
        toast({ title: 'User ID Copied!' });
        setTimeout(() => setIsCopied(false), 2000);
    };
    
    const isSuperAdmin = currentUserData.uid === SUPER_ADMIN_UID;
    const isAdmin = currentUserData.isAdmin;
    const isVip = currentUserData.isVip;
    const isGM = currentUserData.isGM;

    const stats = [
        { label: 'Current Credits', value: currentUserData.credits || 0, icon: Medal, color: 'text-amber-500' },
        { label: 'Current Streak', value: currentUserData.streak || 0, icon: Flame, color: 'text-orange-500' },
        { label: 'Longest Streak', value: currentUserData.longestStreak || 0, icon: Flame, color: 'text-red-500' },
        { label: 'Focus Sessions', value: currentUserData.focusSessionsCompleted || 0, icon: Zap, color: 'text-green-500' },
        { label: 'Tasks Completed', value: currentUserData.dailyTasksCompleted || 0, icon: ListChecks, color: 'text-blue-500' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-primary shadow-lg">
                    <AvatarImage src={currentUserData.photoURL} alt={currentUserData.displayName} />
                    <AvatarFallback className="text-3xl">{currentUserData.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">{currentUserData.displayName}</h1>
                    <p className="text-muted-foreground">{currentUserData.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                        {isSuperAdmin ? (
                            <span className="dev-badge"><Code className="h-3 w-3" /> DEV</span>
                        ) : isAdmin ? (
                            <span className="admin-badge"><ShieldCheck className="h-3 w-3"/> ADMIN</span>
                        ) : isVip ? (
                            <span className="elite-badge"><Crown className="h-3 w-3"/> ELITE</span>
                        ) : isGM ? (
                            <span className="gm-badge">GM</span>
                        ) : (
                             <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border"><UserIcon className="h-3 w-3" /> Member</span>
                        )}
                    </div>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Your Statistics</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     {stats.map(stat => (
                        <Card key={stat.label}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                                <stat.icon className={cn("h-5 w-5 text-muted-foreground", stat.color)} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold">{stat.value.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Account Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <div>
                            <p className="text-sm text-muted-foreground">User ID</p>
                            <p className="font-mono text-xs">{user.id}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleCopyId}>
                            {isCopied ? <Check className="h-4 w-4 text-green-500"/> : <Copy className="h-4 w-4"/>}
                        </Button>
                    </div>
                     <Card className="border-destructive/50 bg-destructive/5">
                        <CardHeader>
                            <CardTitle className="text-destructive text-lg">Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data from our servers. This action is irreversible.</p>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" onClick={() => setDeleteStep(1)}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Account Data
                                    </Button>
                                </AlertDialogTrigger>
                                {renderDeleteDialogContent()}
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </div>
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
                    <TabsTrigger value="tools" className="w-full justify-start text-base py-3 px-4 rounded-r-none data-[state=active]:border-r-2 data-[state=active]:border-primary"><FileText className="mr-3"/> Tools</TabsTrigger>
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
                     <TabsContent value="tools">
                        <ToolsContent />
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
