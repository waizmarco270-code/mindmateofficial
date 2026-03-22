
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LifeBuoy, Send, CheckCircle, MailQuestion, AlertTriangle, Award, ShieldCheck, Sparkles, Bug, FileText, ArrowRight } from 'lucide-react';
import { useAdmin } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { useUser, SignedOut } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function HelpPage() {
    const { user } = useUser();
    const { submitSupportTicket, currentUserData } = useAdmin();
    const { toast } = useToast();
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            toast({ variant: 'destructive', title: 'Message cannot be empty.' });
            return;
        }
        if (!user) {
             toast({ variant: 'destructive', title: 'Sign In Required', description: 'You need to sign in to send a message.' });
            return;
        }

        setIsSubmitting(true);
        try {
            await submitSupportTicket(message);
            setIsSubmitted(true);
            setMessage('');
            toast({ title: "Message Sent!", description: "The High Council (Admins) will review your missive."});
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <LifeBuoy className="h-10 w-10 text-primary" />
                        Support Command Center
                    </h1>
                    <p className="text-muted-foreground">The ultimate gateway for technical assistance and platform improvement.</p>
                </div>
                <Button asChild variant="outline" className="rounded-full px-6 border-primary/20 hover:bg-primary/5">
                    <Link href="/dashboard/docs">
                        <FileText className="mr-2 h-4 w-4 text-primary"/>
                        View Documentation
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
                 <SignedOut>
                    <LoginWall title="Sign In for Support" description="Create a free account or sign in to contact our support team and report bugs." />
                </SignedOut>

                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-primary/20 shadow-xl overflow-hidden">
                        <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MailQuestion className="text-primary h-5 w-5"/>
                                <span className="font-bold uppercase text-xs tracking-widest">Transmit Message to Admins</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] bg-background">Active Uplink</Badge>
                        </div>
                        {isSubmitted ? (
                            <CardContent className="text-center py-20">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                                    <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                                </motion.div>
                                <h3 className="text-3xl font-black text-foreground">TRANSMISSION RECEIVED</h3>
                                <p className="text-muted-foreground mt-2 mb-8 max-w-sm mx-auto">Your message has been securely sent to the Admin team. Expect a response via email or in-app notification.</p>
                                <Button onClick={() => setIsSubmitted(false)} variant="outline">New Message</Button>
                            </CardContent>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <CardContent className="pt-6">
                                    <Textarea 
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Describe your issue, report a bug, or suggest a legendary feature..."
                                        className="min-h-[250px] bg-muted/30 border-primary/10 focus-visible:ring-primary/30 text-lg"
                                        disabled={isSubmitting}
                                    />
                                </CardContent>
                                <CardFooter className="bg-muted/30 border-t p-4">
                                    <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20" disabled={isSubmitting || !message.trim()}>
                                        {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> SECURING CHANNEL...</> : <><Send className="mr-2 h-5 w-5"/> TRANSMIT TO HIGH COUNCIL</>}
                                    </Button>
                                </CardFooter>
                            </form>
                        )}
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-gradient-to-br from-green-500/10 via-background to-background border-green-500/20">
                            <CardHeader className="p-4">
                                <CardTitle className="text-sm flex items-center gap-2 text-green-600 dark:text-green-400">
                                    <ShieldCheck className="h-4 w-4"/> Protocol: Ethics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                                Only genuine and clear reports are processed. False transmissions result in a <span className="font-bold text-destructive">-50 Credit penalty</span> to maintain system integrity.
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-blue-500/10 via-background to-background border-blue-500/20">
                            <CardHeader className="p-4">
                                <CardTitle className="text-sm flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                    <Sparkles className="h-4 w-4"/> Bounty Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                                All reporters are eligible for the <span className="font-bold text-primary">Sentinel's Bounty</span>. High-quality bug reports are rewarded manually by WaizMarco.
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="border-amber-500/30 bg-amber-500/5 overflow-hidden">
                        <div className="p-4 border-b border-amber-500/20 bg-amber-500/10 flex items-center gap-2">
                            <Bug className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            <h3 className="font-black text-xs uppercase tracking-widest text-amber-700 dark:text-amber-300">Bug Bounty Program</h3>
                        </div>
                        <CardContent className="p-6 space-y-4">
                            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">Found a crack in the system? Report it and earn legendary rewards!</p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-amber-500/20">
                                    <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center font-bold text-amber-600">C</div>
                                    <div className="text-xs">
                                        <p className="font-bold">Critical Vulnerability</p>
                                        <p className="text-muted-foreground">+500 Credits & Elite Badge</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-amber-500/20">
                                    <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center font-bold text-amber-600">M</div>
                                    <div className="text-xs">
                                        <p className="font-bold">Major UI/Logic Bug</p>
                                        <p className="text-muted-foreground">+100 Credits & Scratch Card</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-amber-500/20">
                                    <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center font-bold text-amber-600">L</div>
                                    <div className="text-xs">
                                        <p className="font-bold">Minor Typo/Visual</p>
                                        <p className="text-muted-foreground">+20 Credits</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/20 bg-muted/30">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Self-Help Hub</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-2">
                            <Button asChild variant="ghost" className="w-full justify-between hover:bg-primary/5 text-sm group h-12">
                                <Link href="/dashboard/docs">
                                    <span className="flex items-center gap-2"><FileText className="h-4 w-4"/> User Manual</span>
                                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"/>
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" className="w-full justify-between hover:bg-primary/5 text-sm group h-12">
                                <Link href="/dashboard/settings">
                                    <span className="flex items-center gap-2"><MessageSquare className="h-4 w-4"/> Common FAQs</span>
                                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"/>
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
