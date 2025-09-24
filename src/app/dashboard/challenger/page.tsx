
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction } from 'lucide-react';
import Link from 'next/link';

export default function ChallengerMaintenancePage() {
    return (
        <div className="flex h-full w-full items-center justify-center p-4">
            <Card className="w-full max-w-md text-center border-amber-500/50">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Construction className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Under Maintenance</CardTitle>
                    <CardDescription>
                       The Challenger Zone is currently undergoing improvements and will be back soon, better than ever!
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/dashboard">
                            &larr; Back to Dashboard
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
