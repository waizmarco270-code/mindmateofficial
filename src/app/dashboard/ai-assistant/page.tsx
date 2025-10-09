

'use client';

import { useState, useEffect } from 'react';
import { useImmersive } from '@/hooks/use-immersive';
import { useAdmin, useUsers } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Copy, Check, ShieldCheck, ArrowRight, Bot, Code } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const AI_ACCESS_COST = 1000;

export default function AiAssistantPage() {
  const { isImmersive, setIsImmersive } = useImmersive();
  const { user } = useUser();
  const { currentUserData, generateAiAccessToken, loading: usersLoading } = useUsers();
  const { appSettings, loading: adminLoading } = useAdmin();
  const { toast } = useToast();

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [isTokenCopied, setIsTokenCopied] = useState(false);
  
  const loading = usersLoading || adminLoading;

  const isAiLive = appSettings?.marcoAiLaunchStatus === 'live';
  const hasAccess = currentUserData?.hasAiAccess ?? false;
  const hasMasterCard = currentUserData?.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();

  useEffect(() => {
    if (hasAccess && isAiLive) {
      setIsImmersive(true);
      return () => setIsImmersive(false); // Cleanup function
    }
  }, [hasAccess, isAiLive, setIsImmersive]);

  const handlePurchase = async () => {
    if (!user || !currentUserData) return;

    if (!hasMasterCard && currentUserData.credits < AI_ACCESS_COST) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Credits',
        description: `You need ${AI_ACCESS_COST} credits to unlock Marco AI.`,
      });
      return;
    }

    setIsPurchasing(true);
    try {
      const token = await generateAiAccessToken(user.id);
      if (token) {
        setGeneratedToken(token);
        toast({
          title: 'Purchase Successful!',
          description: 'You have unlocked lifetime access to Marco AI.',
        });
      } else {
        throw new Error('Token generation failed.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Operation Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsPurchasing(false);
    }
  };


  const handleCopyToClipboardAndRedirect = () => {
    if (!generatedToken) return;
    navigator.clipboard.writeText(generatedToken);
    setIsTokenCopied(true);
    toast({ title: 'Token Copied!' });
    setTimeout(() => {
        window.location.href = 'https://aimindmate.vercel.app/';
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!isAiLive) {
     return (
        <div className="flex h-full w-full items-center justify-center p-4">
            <Card className="w-full max-w-md text-center border-amber-500/50">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Marco AI is Coming Soon!</CardTitle>
                    <CardDescription>
                       The AI is not live yet. Check the dashboard for the official launch countdown!
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


  if (!hasAccess && !generatedToken) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Unlock Marco AI</CardTitle>
            <CardDescription>
              Get lifetime access to your personal AI study partner for a one-time fee.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-muted p-6">
              <p className="text-sm text-muted-foreground">Unlock Cost</p>
               {hasMasterCard ? (
                <p className="text-5xl font-bold tracking-tighter text-green-500">FREE</p>
              ) : (
                <p className="text-5xl font-bold tracking-tighter">{AI_ACCESS_COST} <span className="text-2xl text-amber-500">credits</span></p>
              )}
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Your balance: <span className="font-bold text-foreground">{hasMasterCard ? '∞' : (currentUserData?.credits ?? 0)}</span> credits
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              className="w-full"
              size="lg"
              onClick={handlePurchase}
              disabled={isPurchasing || (!hasMasterCard && (currentUserData?.credits ?? 0) < AI_ACCESS_COST)}
            >
              {isPurchasing ? <Loader2 className="mr-2 animate-spin" /> : <ShieldCheck className="mr-2" />}
              {hasMasterCard ? 'Unlock for Free' : `Unlock for ${AI_ACCESS_COST} Credits`}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
        <iframe
        src="https://aimindmate.vercel.app/"
        className="h-full w-full border-0"
        title="Marco AI Assistant"
        allow="microphone"
        ></iframe>

      <Dialog open={!!generatedToken} onOpenChange={() => setGeneratedToken(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Access Token</DialogTitle>
            <DialogDescription>
              Copy this one-time token and paste it into Marco AI to activate your lifetime access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              After copying, you will be redirected to the Marco AI app.
            </p>
            <div className="flex items-center gap-2">
              <Input readOnly value={generatedToken || ''} className="font-mono text-lg" />
              <Button size="icon" onClick={handleCopyToClipboardAndRedirect}>
                {isTokenCopied ? <Check /> : <Copy />}
              </Button>
            </div>
          </div>
           <DialogFooter>
             <Button className="w-full" onClick={handleCopyToClipboardAndRedirect}>
                {isTokenCopied ? "Redirecting..." : "Copy & Go to AI"} <ArrowRight className="ml-2 h-4 w-4"/>
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
