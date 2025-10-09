

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { Gift, Copy, Check, ShieldCheck, AlertTriangle, Share2, Users, Crown, Star, Medal, Trophy } from 'lucide-react';
import { useReferrals } from '@/hooks/use-referrals';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

const REFERRAL_REWARD = 50;

const milestoneRewards = [
    { referrals: 1, reward: "100 Credits", icon: Medal },
    { referrals: 3, reward: "300 Credits", icon: Medal },
    { referrals: 5, reward: "500 Credits", icon: Medal },
    { referrals: 8, reward: "1000 Credits", icon: Star },
    { referrals: 15, reward: "Permanent VIP & MindMate Plus", icon: Crown },
];

export default function ReferralsPage() {
    const { user } = useUser();
    const { currentUserData } = useUsers();
    const { submitReferralCode } = useReferrals();
    const { toast } = useToast();

    const [isCodeCopied, setIsCodeCopied] = useState(false);
    const [isInviteShared, setIsInviteShared] = useState(false);
    const [referralCodeInput, setReferralCodeInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userReferralCode = useMemo(() => {
        if (!currentUserData) return '';
        // Generate a referral code, e.g., 'JohnD-123'
        const namePart = (currentUserData.displayName || 'user').replace(/\s+/g, '').substring(0, 7);
        const idPart = currentUserData.uid.substring(currentUserData.uid.length - 3);
        return `${namePart}-${idPart}`.toUpperCase();
    }, [currentUserData]);
    
    const handleCopyCode = () => {
        navigator.clipboard.writeText(userReferralCode);
        setIsCodeCopied(true);
        toast({ title: "Code copied to clipboard!" });
        setTimeout(() => setIsCodeCopied(false), 2000);
    };

    const handleShareInvite = async () => {
        const appUrl = window.location.origin;
        const inviteMessage = `Hey! I'm using MindMate to supercharge my studies. It has an AI tutor, focus modes, and tons of resources. Sign up for free and use my referral code to get started: ${userReferralCode}\n\nJoin me here: ${appUrl}`;
        const shareData = {
            title: 'Join me on MindMate!',
            text: inviteMessage,
            url: appUrl,
        };

        if (navigator.share && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                toast({ title: "Invite Shared!" });
            } catch (error) {
                console.error('Error sharing:', error);
                toast({ variant: 'destructive', title: "Could not share", description: "Your browser may have blocked the share attempt." });
            }
        } else {
            // Fallback for desktop or unsupported browsers
            navigator.clipboard.writeText(inviteMessage);
            toast({ title: "Invite message copied!" });
        }
        
        setIsInviteShared(true);
        setTimeout(() => setIsInviteShared(false), 2000);
    }
    
    const handleSubmitCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!referralCodeInput.trim() || !user || !currentUserData) return;
        
        if (currentUserData.referralUsed) {
            toast({ variant: 'destructive', title: 'Code Already Used', description: 'You have already submitted a referral code.' });
            return;
        }

        setIsSubmitting(true);
        try {
            await submitReferralCode(referralCodeInput.toUpperCase());
            toast({ title: "Referral Code Submitted!", description: "Your request is pending admin approval."});
            setReferralCodeInput('');
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Submission Failed", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Invite & Earn</h1>
                <p className="text-muted-foreground">Share the love and earn legendary rewards when your friends join MindMate.</p>
            </div>
            <Card className="border-primary/20 shadow-lg shadow-primary/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Gift className="text-primary"/>Your Referral Code</CardTitle>
                    <CardDescription>Share this code with your friends to climb the milestone ladder and earn rewards.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input 
                        readOnly
                        value={userReferralCode}
                        className="text-2xl font-mono tracking-widest h-14 text-center bg-muted"
                    />
                    <div className="flex gap-2">
                         <Button onClick={handleCopyCode} className="w-full" variant="outline">
                            {isCodeCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                            {isCodeCopied ? 'Code Copied!' : 'Copy Code'}
                        </Button>
                        <Button onClick={handleShareInvite} className="w-full">
                            {isInviteShared ? <Check className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
                            {isInviteShared ? 'Shared!' : 'Share Invite'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Trophy className="text-amber-500" /> Milestone Rewards</CardTitle>
                    <CardDescription>The more friends you invite, the bigger the reward. Track your progress and aim for the top!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative pl-6">
                        {/* Vertical line */}
                        <div className="absolute top-4 bottom-4 left-9 w-0.5 bg-border -z-10"></div>
                        
                        {milestoneRewards.map((milestone, index) => {
                            const Icon = milestone.icon;
                             const isLegendary = milestone.referrals === 15;
                            return (
                                <motion.div 
                                    key={index} 
                                    className="flex items-center gap-6 relative"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center bg-background border-2 font-bold z-10 shrink-0",
                                        isLegendary ? "border-amber-400 text-amber-400" : "border-primary text-primary"
                                    )}>
                                        {milestone.referrals}
                                    </div>
                                    <div className={cn(
                                        "flex-1 flex items-center justify-between p-3 rounded-lg border",
                                        isLegendary ? "bg-amber-400/10 border-amber-400/20" : "bg-muted"
                                    )}>
                                        <p className={cn("font-semibold", isLegendary && "text-amber-400")}>{milestone.reward}</p>
                                        <Icon className={cn("h-6 w-6", isLegendary ? "text-amber-400 animate-gold-shine" : "text-primary")} />
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users />Got a Code?</CardTitle>
                    <CardDescription>If a friend referred you, enter their code here to help them earn a reward.</CardDescription>
                </CardHeader>
                <CardContent>
                    {currentUserData?.referralUsed ? (
                         <div className="flex items-center justify-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-green-700 dark:text-green-300 h-full">
                            <ShieldCheck className="h-6 w-6"/>
                            <p className="font-semibold text-center">You've already used a referral code. Thanks for joining!</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitCode} className="flex items-center gap-4">
                            <Input 
                                placeholder="ENTER-CODE-HERE"
                                value={referralCodeInput}
                                onChange={(e) => setReferralCodeInput(e.target.value)}
                                className="h-12"
                            />
                            <Button type="submit" disabled={isSubmitting} className="h-12">
                                {isSubmitting ? 'Submitting...' : 'Submit Code'}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-destructive">How It Works</h4>
                        <ul className="text-sm text-destructive/80 list-disc pl-5 mt-2 space-y-1">
                            <li>You can only use one referral code.</li>
                            <li>Your friend (the inviter) will receive their milestone reward only after a Super Admin approves the referral.</li>
                            <li>This system is in place to prevent misuse. All referrals are manually checked.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
