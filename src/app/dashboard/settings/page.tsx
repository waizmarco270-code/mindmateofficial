'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User, Palette, Gift, LifeBuoy, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

// Re-integrating components that were on separate pages
import ReferralsPageContent from '../refer/page';
import FaqContent from '../faq/page';
import AboutContent from '../about/page';
import ToolsContent from '../tools/page';


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
                            Switch between light and dark mode.
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
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function SettingsPage() {

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Settings className="h-8 w-8 text-primary" />
                    Settings
                </h1>
                <p className="text-muted-foreground">Manage your account, preferences, and app settings.</p>
            </div>
            
            <Tabs defaultValue="profile" className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <TabsList className="md:col-span-1 flex flex-col h-auto bg-transparent p-0 border-r">
                    <TabsTrigger value="profile" className="w-full justify-start text-base py-3 px-4 rounded-r-none data-[state=active]:border-r-2 data-[state=active]:border-primary"><User className="mr-3"/> Profile</TabsTrigger>
                    <TabsTrigger value="appearance" className="w-full justify-start text-base py-3 px-4 rounded-r-none data-[state=active]:border-r-2 data-[state=active]:border-primary"><Palette className="mr-3"/> Appearance</TabsTrigger>
                    <TabsTrigger value="tools" className="w-full justify-start text-base py-3 px-4 rounded-r-none data-[state=active]:border-r-2 data-[state=active]:border-primary"><Gift className="mr-3"/> Tools</TabsTrigger>
                    <TabsTrigger value="referrals" className="w-full justify-start text-base py-3 px-4 rounded-r-none data-[state=active]:border-r-2 data-[state=active]:border-primary"><Gift className="mr-3"/> Referrals</TabsTrigger>
                    <TabsTrigger value="support" className="w-full justify-start text-base py-3 px-4 rounded-r-none data-[state=active]:border-r-2 data-[state=active]:border-primary"><LifeBuoy className="mr-3"/> Support</TabsTrigger>
                </TabsList>
                
                <div className="md:col-span-3">
                    <TabsContent value="profile">
                         <Card>
                            <CardHeader>
                                <CardTitle>Profile Management</CardTitle>
                                <CardDescription>Manage your personal information and security settings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <Link href="/dashboard/profile" className="group block">
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                        <div className="flex items-center gap-3">
                                            <User className="h-5 w-5 text-primary" />
                                            <p className="text-sm font-semibold">Go to Your Profile Page</p>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="appearance">
                        <AppearanceSettings />
                    </TabsContent>
                     <TabsContent value="tools">
                        <ToolsContent />
                    </TabsContent>
                    <TabsContent value="referrals">
                        <ReferralsPageContent />
                    </TabsContent>
                    <TabsContent value="support" className="space-y-8">
                         <Card>
                            <CardHeader><CardTitle>About MindMate</CardTitle></CardHeader>
                            <CardContent><AboutContent /></CardContent>
                         </Card>
                         <Card>
                             <CardHeader><CardTitle>Frequently Asked Questions</CardTitle></CardHeader>
                            <CardContent><FaqContent /></CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}

// Dummy Label to satisfy the compiler for the nested component
const Label = ({ children, ...props }: React.ComponentProps<'label'>) => <label {...props}>{children}</label>;
