
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gift } from 'lucide-react';

export function GiftBoxGame() {

    return (
        <div className="w-full max-w-md mx-auto space-y-4">
            <Card className="text-center bg-muted/50 border-dashed">
                <CardHeader>
                    <CardTitle>Guess the Box!</CardTitle>
                    <CardDescription>Pick one box for a chance to win credits. You get one guess per day!</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-8">
                     <div className="grid grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <button key={index} className="group transition-transform hover:-translate-y-2">
                                <Gift className="h-24 w-24 text-primary group-hover:animate-pulse" />
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
