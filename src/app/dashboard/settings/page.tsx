
'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, ShieldCheck, User, Link as LinkIcon, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    const { isLoaded, isSignedIn, user } = useUser();
    const { toast } = useToast();
    const [fullName, setFullName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isLoaded && user) {
            setFullName(user.fullName ?? '');
        }
    }, [isLoaded, user]);

    const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isLoaded || !user) return;

        setIsSubmitting(true);
        try {
            await user.update({ fullName });
            toast({
                title: 'Success!',
                description: 'Your profile has been updated.',
            });
        } catch (err: any) {
             const errorMsg = err.errors?.[0]?.longMessage || 'An unexpected error occurred.';
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: errorMsg,
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // As Clerk manages the user session, the user object might not be immediately available.
    if (!isLoaded) {
        return <div>Loading...</div>;
    }
    
    if(!isSignedIn) {
        return <div>Please sign in to view your settings.</div>
    }

    const userProfileUrl = process.env.NEXT_PUBLIC_CLERK_USER_PROFILE_URL || '/';

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account and profile settings.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                    <CardDescription>Update your public display name.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={user.primaryEmailAddress?.emailAddress} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Your full name"
                            />
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Account Security</CardTitle>
                    <CardDescription>Manage your password and account connections.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        For your security, these settings are managed through Clerk. Clicking a button below will take you to your secure account portal.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Button asChild variant="outline">
                            <Link href={`${userProfileUrl}/security`} target="_blank">
                                <KeyRound className="mr-2 h-4 w-4" /> Change Password
                                <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                            </Link>
                        </Button>
                         <Button asChild variant="outline">
                            <Link href={`${userProfileUrl}/security`} target="_blank">
                                <ShieldCheck className="mr-2 h-4 w-4" /> Two-Factor Authentication
                                <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                            </Link>
                        </Button>
                         <Button asChild variant="outline">
                            <Link href={userProfileUrl} target="_blank">
                                <LinkIcon className="mr-2 h-4 w-4" /> Connected Accounts
                                <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={userProfileUrl} target="_blank">
                                <User className="mr-2 h-4 w-4" /> Edit Profile Details
                                <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
