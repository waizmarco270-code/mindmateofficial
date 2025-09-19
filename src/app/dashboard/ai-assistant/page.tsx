
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, Link as LinkIcon, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AiAssistantPage() {
  const externalAiLink = "https://aimindmate.vercel.app/";

  return (
    <div className="h-full flex items-center justify-center">
        <Card className="w-full max-w-md text-center border-dashed">
            <CardHeader>
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                        <Bot className="h-12 w-12 text-primary" />
                    </div>
                </div>
                <CardTitle>Access Marco AI</CardTitle>
                <CardDescription>
                   You are about to be redirected to our dedicated AI assistant, powered by Google's Gemini models for an enhanced experience.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="font-bold text-lg text-primary animate-pulse">Ready to Go!</p>
                <div className="mt-6">
                    <Button asChild variant="outline">
                        <Link href={externalAiLink} target="_blank">
                            <LinkIcon className="mr-2 h-4 w-4" />
                            Access Marco AI Now
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
