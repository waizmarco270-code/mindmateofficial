
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { SignUpButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';

interface LoginWallProps {
    title: string;
    description: string;
    className?: string;
}

export function LoginWall({ title, description, className }: LoginWallProps) {
    return (
        <Card className={cn("absolute inset-0 z-20 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6", className)}>
            <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Lock className="h-8 w-8 text-primary"/>
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-muted-foreground mt-2 mb-6 max-w-sm">{description}</p>
            <SignUpButton mode="modal">
                <Button>Sign Up for Free to Unlock</Button>
            </SignUpButton>
        </Card>
    );
}
