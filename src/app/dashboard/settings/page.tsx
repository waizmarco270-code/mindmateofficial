
'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

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
    
    if (!isLoaded) {
        return <div>Loading...</div>;
    }
    
    if(!isSignedIn) {
        return <div>Please sign in to view your settings.</div>
    }

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
        </div>
    );
}
