
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';

export default function InstagramWarningPage() {
    return (
        <div className="flex h-full w-full items-center justify-center p-4">
            <Card className="w-full max-w-md text-center border-rose-500/50 bg-rose-950/20">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-10 w-10 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl text-destructive">Warning!</CardTitle>
                    <CardDescription>
                       You are about to enter the endless vortex of Instagram Reels. Productivity may be lost forever.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                    <Button asChild size="lg">
                        <Link href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                           Take me to the Reels! <ArrowRight className="ml-2"/>
                        </Link>
                    </Button>
                     <Button asChild variant="outline" size="lg">
                        <Link href="/dashboard">
                           <Shield className="mr-2"/> No, I want to be productive
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
