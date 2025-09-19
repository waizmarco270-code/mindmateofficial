
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User, Palette, Gift, LifeBuoy, ArrowRight, Sun, Moon, Info, Gavel, FileText, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

// Re-integrating components that were on separate pages
import ReferralsPageContent from '../refer/page';
import FaqContent from '../faq/page';
import AboutContent from '../about/page';
import ToolsContent from '../tools/page';
import RulesContent from '../rules/page';


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
            
            <Tabs defaultValue="appearance" className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <TabsList className="md:col-span-1 flex flex-col h-auto bg-transparent p-0 border-r">
                    <TabsTrigger value="appearance" className="w-full justify-start text-base py-3 px-4 rounded-r-none data-[state=active]:border-r-2 data-[state=active]:border-primary"><Palette className="mr-3"/> Appearance</TabsTrigger>
                    <TabsTrigger value="tools" className="w-full justify-start text-base py-3 px-4 rounded-r-none data-[state=active]:border-r-2 data-[state=active]:border-primary"><FileText className="mr-3"/> Tools</TabsTrigger>
                    <TabsTrigger value="referrals" className="w-full justify-start text-base py-3 px-4 rounded-r-none data-[state=active]:border-r-2 data-[state=active]:border-primary"><Gift className="mr-3"/> Referrals</TabsTrigger>
                    <TabsTrigger value="about" className="w-full justify-start text-base py-3 px-4 rounded-r-none data-[state=active]:border-r-2 data-[state=active]:border-primary"><Info className="mr-3"/> About & FAQ</TabsTrigger>
                    <TabsTrigger value="rules" className="w-full justify-start text-base py-3 px-4 rounded-r-none data-[state=active]:border-r-2 data-[state=active]:border-primary"><Gavel className="mr-3"/> Rules & Regulations</TabsTrigger>
                </TabsList>
                
                <div className="md:col-span-3">
                    <TabsContent value="appearance">
                        <AppearanceSettings />
                    </TabsContent>
                     <TabsContent value="tools">
                        <ToolsContent />
                    </TabsContent>
                    <TabsContent value="referrals">
                        <ReferralsPageContent />
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
                </div>
            </Tabs>
        </div>
    );
}

// Dummy Label to satisfy the compiler for the nested component
const Label = ({ children, ...props }: React.ComponentProps<'label'>) => <label {...props}>{children}</label>;
