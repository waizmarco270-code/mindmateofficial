
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';

export default function YouTubeWarningPage() {
    return (
        <div className="flex h-full w-full items-center justify-center p-4">
            <Card className="w-full max-w-md text-center border-red-500/50 bg-red-950/20">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                        <AlertTriangle className="h-10 w-10 text-red-500" />
                    </div>
                    <CardTitle className="text-2xl text-red-500">Danger Zone!</CardTitle>
                    <CardDescription>
                       The endless scroll of YouTube Shorts awaits. Are you sure you want to proceed? Time is ticking...
                    </CardDescription>
                </CardHeader>
                 <CardContent className="grid grid-cols-1 gap-4">
                    <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
                        <Link href="https://www.youtube.com/shorts" target="_blank" rel="noopener noreferrer">
                           Just one more video... <ArrowRight className="ml-2"/>
                        </Link>
                    </Button>
                     <Button asChild variant="outline" size="lg">
                        <Link href="/dashboard">
                           <Shield className="mr-2"/> Stay Focused
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
