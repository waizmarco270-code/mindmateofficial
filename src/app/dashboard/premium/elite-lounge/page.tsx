
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Crown, Construction, Loader2, ShieldX, Gift, CheckCircle, BarChart, FileCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { format, isToday, parseISO } from 'date-fns';

export default function EliteLoungePage() {
  const { user } = useUser();
  const { currentUserData, isAdmin, isSuperAdmin, loading, claimEliteDailyReward } = useAdmin();
  const { toast } = useToast();
  
  const hasAccess = currentUserData?.isVip || currentUserData?.isGM || isAdmin || isSuperAdmin;

  const hasClaimedToday = !!currentUserData?.lastEliteClaim && isToday(parseISO(currentUserData.lastEliteClaim));

  const handleClaim = async () => {
    if (!user) return;
    try {
        await claimEliteDailyReward(user.id);
        toast({
            title: "Treasury Claimed!",
            description: "Your daily elite rewards have been added to your account.",
            className: "bg-green-500/10 border-green-500/50"
        });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Claim Failed", description: error.message });
    }
  };


  if (loading) {
      return (
        <div className="flex h-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
  }

  if (!hasAccess) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Card className="w-full max-w-md border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-destructive">
                    <ShieldX className="h-8 w-8"/> Access Denied
                </CardTitle>
                <CardDescription>
                    You do not have the necessary permissions to view this page. This is an exclusive area for Elite members, GMs, and Admins.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                    <Link href="/dashboard">
                       &larr; Back to Dashboard
                    </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
      );
  }


  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Crown className="h-8 w-8 text-yellow-400 [text-shadow:0_0_8px_currentColor]" />
          Elite Lounge
        </h1>
        <p className="text-muted-foreground">Exclusive benefits and tools for our top members.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-yellow-400/50 bg-gradient-to-br from-yellow-950/30 to-background flex flex-col justify-between">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
                        <Gift className="h-8 w-8 text-yellow-400"/>
                    </div>
                    <div>
                        <CardTitle className="text-2xl text-yellow-400">Elite Daily Treasury</CardTitle>
                        <CardDescription className="text-yellow-400/80">Claim your exclusive rewards every day.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="text-center space-y-2">
                <p className="font-bold text-lg">+20 Credits</p>
                <p className="font-bold text-lg">+5 Scratch Cards</p>
                <p className="font-bold text-lg">+5 Card Flip Plays</p>
            </CardContent>
            <CardFooter>
                <Button 
                    className="w-full"
                    onClick={handleClaim}
                    disabled={hasClaimedToday}
                >
                    {hasClaimedToday ? <><CheckCircle className="mr-2"/> Claimed for Today</> : 'Claim Daily Reward'}
                </Button>
            </CardFooter>
        </Card>
        
        <Card>
             <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <BarChart className="h-8 w-8 text-primary"/>
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Insider's Circle</CardTitle>
                        <CardDescription>Your voice matters. Shape the future of MindMate.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="p-4 rounded-lg bg-muted flex items-center justify-between">
                    <p className="font-semibold">Exclusive Polls</p>
                    <div className="text-sm font-bold text-muted-foreground flex items-center gap-2"><Construction className="h-4 w-4"/> Coming Soon</div>
                 </div>
                  <div className="p-4 rounded-lg bg-muted flex items-center justify-between">
                    <p className="font-semibold">Early Access Features</p>
                    <div className="text-sm font-bold text-muted-foreground flex items-center gap-2"><Construction className="h-4 w-4"/> Coming Soon</div>
                 </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
