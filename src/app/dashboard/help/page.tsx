
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LifeBuoy, Send, CheckCircle, MailQuestion, AlertTriangle, Award } from 'lucide-react';
import { useAdmin } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { useUser, SignedOut } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function HelpPage() {
    const { user, isSignedIn } = useUser();
    const { submitSupportTicket } = useAdmin();
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
            toast({ title: "Message Sent!", description: "An admin will review your message shortly."});
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
                <p className="text-muted-foreground">Have a problem or a suggestion? Let us know!</p>
            </div>
            <div className="max-w-2xl mx-auto space-y-6">
                <Card className="relative">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MailQuestion className="text-primary"/> Contact an Admin</CardTitle>
                        <CardDescription>Your message will be sent directly to the site administrators. We'll do our best to get back to you if needed.</CardDescription>
                    </CardHeader>
                    {isSubmitted ? (
                        <CardContent className="text-center py-16">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold">Thank You!</h3>
                            <p className="text-muted-foreground mb-6">Your message has been received.</p>
                            <Button onClick={() => setIsSubmitted(false)}>Send Another Message</Button>
                        </CardContent>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <CardContent>
                                <Textarea 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Describe your issue or suggestion here..."
                                    rows={8}
                                    disabled={isSubmitting}
                                />
                            </CardContent>
                            <CardContent>
                                <Button type="submit" className="w-full" disabled={isSubmitting || !message.trim()}>
                                    <Send className="mr-2 h-4 w-4"/> {isSubmitting ? 'Sending...' : 'Send Message'}
                                </Button>
                            </CardContent>
                        </form>
                    )}
                </Card>
                
                 <Alert>
                    <Award className="h-4 w-4" />
                    <AlertTitle className="font-bold">Found a Bug?</AlertTitle>
                    <AlertDescription>
                       The reward is based on the bug's severity—the more critical the bug, the better the reward. Potential rewards include <span className="font-bold text-primary">credits, scratch cards, card flip plays, or even the Elite Member badge!</span>
                    </AlertDescription>
                </Alert>

                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                       Please send genuine and clear messages. Sending unnecessary or spam messages will result in a <span className="font-bold">credit penalty</span>.
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    );
}
