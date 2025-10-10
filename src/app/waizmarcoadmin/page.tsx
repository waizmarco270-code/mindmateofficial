

'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdmin, SUPER_ADMIN_UID, type User, type AppTheme, type FeatureLock, GlobalGift, AppSettings, FeatureShowcase, ShowcaseTemplate } from '@/hooks/use-admin';
import { useReferrals, type ReferralRequest } from '@/hooks/use-referrals';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Gift, RefreshCcw, Users, ShieldCheck, UserCog, DollarSign, Wallet, ShieldX, MinusCircle, Trash2, AlertTriangle, VenetianMask, Box, UserPlus, CheckCircle, XCircle, Palette, Crown, Code, Trophy, Gamepad2, Send, History, Lock, Unlock, Rocket, KeyRound as KeyRoundIcon, Megaphone, Edit, Swords, CreditCard, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Slider } from '@/components/ui/slider';
import { lockableFeatures } from '@/lib/features';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogClose, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogContent } from '@/components/ui/dialog';
import { sendNotification } from '@/server/flows/notify-flow';
import { sendNotificationToUser } from '@/server/flows/notify-user-flow';


const CREDIT_PASSWORD = "waizcredit";

export default function SuperAdminPanelPage() {
  const { 
    isSuperAdmin, users, toggleUserBlock, makeUserAdmin, removeUserAdmin, 
    makeUserVip, removeUserVip,
    makeUserGM, removeUserGM,
    makeUserChallenger, removeUserChallenger,
    makeUserCoDev, removeUserCoDev,
    addCreditsToUser, giftCreditsToAllUsers,
    addFreeSpinsToUser, addSpinsToAllUsers,
    addFreeGuessesToUser, addGuessesToAllUsers,
    resetUserCredits, clearGlobalChat, clearQuizLeaderboard,
    resetWeeklyStudyTime,
    resetGameZoneLeaderboard,
    sendGlobalGift,
    globalGifts,
    deactivateGift,
    deleteGlobalGift,
    featureLocks,
    lockFeature,
    unlockFeature,
    appSettings,
    updateAppSettings,
    generateDevAiAccessToken,
    grantMasterCard,
    revokeMasterCard,
  } = useAdmin();
  const { toast } = useToast();
  
  // State for Credit Management
  const [isCreditUnlocked, setIsCreditUnlocked] = useState(false);
  const [creditPassword, setCreditPassword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState(10);
  const [spinAmount, setSpinAmount] = useState(1);
  const [guessAmount, setGuessAmount] = useState(1);
  
  // State for Personalized Popup
  const [popupTarget, setPopupTarget] = useState<'all' | 'single'>('all');
  const [popupSingleUserId, setPopupSingleUserId] = useState<string | null>(null);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupCreditAmount, setPopupCreditAmount] = useState(0);
  const [popupScratchAmount, setPopupScratchAmount] = useState(0);
  const [popupFlipAmount, setPopupFlipAmount] = useState(0);
  const [isSendingPopup, setIsSendingPopup] = useState(false);

  // State for dev token generation
  const [devTokenUser, setDevTokenUser] = useState<string | null>(null);
  const [generatedDevToken, setGeneratedDevToken] = useState<string | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  // Master Card
  const [isMasterCardDialogOpen, setIsMasterCardDialogOpen] = useState(false);
  const [masterCardUser, setMasterCardUser] = useState<User | null>(null);
  const [masterCardDuration, setMasterCardDuration] = useState(7);


  // State for Feature Locks
  const [featureCosts, setFeatureCosts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Initialize local costs state when featureLocks are loaded
    const initialCosts = lockableFeatures.reduce((acc, feature) => {
        acc[feature.id] = featureLocks?.[feature.id]?.cost ?? feature.defaultCost;
        return acc;
    }, {} as Record<string, number>);
    setFeatureCosts(initialCosts);
  }, [featureLocks]);
  
  
  const handleCreditPasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if(creditPassword === CREDIT_PASSWORD){
        setIsCreditUnlocked(true);
        toast({ title: "Admin Controls Unlocked" });
      } else {
        toast({ variant: 'destructive', title: "Incorrect Password" });
      }
  };

  const handleGiftCredits = async () => {
    if (!selectedUserId || !creditAmount || creditAmount <= 0) {
        toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please select a user/group and enter a positive credit amount.'});
        return;
    }
    
    if (selectedUserId === '__all__') {
        await giftCreditsToAllUsers(creditAmount);
        toast({ title: 'Success', description: `${creditAmount} credits have been gifted to all users.`});
    } else {
        await addCreditsToUser(selectedUserId, creditAmount);
        toast({ title: 'Success', description: `${creditAmount} credits have been gifted to the user.`});
    }
  };
  
  const handleGiftSpins = async () => {
    if (!selectedUserId || !spinAmount || spinAmount <= 0) {
        toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please select a user/group and enter a positive amount.'});
        return;
    }

    if (selectedUserId === '__all__') {
        await addSpinsToAllUsers(spinAmount);
        toast({ title: 'Success', description: `${spinAmount} free card(s) have been gifted to all users.`});
    } else {
        await addFreeSpinsToUser(selectedUserId, spinAmount);
        toast({ title: 'Success', description: `${spinAmount} free card(s) have been gifted to the user.`});
    }
  };
  
  const handleGiftGuesses = async () => {
    if (!selectedUserId || !guessAmount || guessAmount <= 0) {
        toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please select a user/group and enter a positive amount.'});
        return;
    }
    
    if (selectedUserId === '__all__') {
        await addGuessesToAllUsers(guessAmount);
        toast({ title: 'Success', description: `${guessAmount} free guess(es) have been gifted to all users.`});
    } else {
        await addFreeGuessesToUser(selectedUserId, guessAmount);
        toast({ title: 'Success', description: `${guessAmount} free guess(es) have been gifted to the user.`});
    }
  };


  const handleDeductCredits = async () => {
     if (!selectedUserId || !creditAmount || creditAmount <= 0 || selectedUserId === '__all__') {
        toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please select a single user and enter a positive credit amount.'});
        return;
    }
    await addCreditsToUser(selectedUserId, -creditAmount);
    toast({ title: 'Success', description: `${creditAmount} credits have been deducted from the user.`});
  };

  const handleResetCredits = async () => {
     if (!selectedUserId || selectedUserId === '__all__') {
        toast({ variant: 'destructive', title: 'No User Selected', description: 'Please select a single user to reset credits.'});
        return;
    }
    await resetUserCredits(selectedUserId);
    toast({ title: 'Success', description: `User's credits have been reset to 100.`});
  };
  
  const handleClearGlobalChat = async () => {
      try {
          await clearGlobalChat();
          toast({ title: "Global Chat Cleared", description: "All messages have been permanently deleted." });
      } catch (error: any) {
          toast({ variant: 'destructive', title: "Error Clearing Chat", description: error.message });
      }
  };
  
  const handleClearQuizLeaderboard = async () => {
      try {
          await clearQuizLeaderboard();
          toast({ title: "Quiz Leaderboard Cleared", description: "All user quiz stats have been reset." });
      } catch (error: any) {
          toast({ variant: 'destructive', title: "Error Clearing Leaderboard", description: error.message });
      }
  };

  const handleResetWeeklyStudy = async () => {
    try {
        await resetWeeklyStudyTime();
        toast({ title: "Weekly Study Time Reset", description: "All time tracking sessions for this week have been deleted." });
    } catch (error: any) {
        toast({ variant: 'destructive', title: "Error Resetting Study Time", description: error.message });
    }
  }

  const handleResetGameZoneLeaderboard = async () => {
      try {
          await resetGameZoneLeaderboard();
          toast({ title: "Game Zone Leaderboard Reset", description: "All game high scores have been reset to 0." });
      } catch (error: any) {
          toast({ variant: 'destructive', title: "Error Resetting Game Leaderboard", description: error.message });
      }
  }

  const handleSendPopup = async () => {
    if (!popupMessage.trim()) {
        toast({ variant: 'destructive', title: 'Invalid Popup', description: 'Please provide a message.' });
        return;
    }
    if (popupTarget === 'single' && !popupSingleUserId) {
        toast({ variant: 'destructive', title: 'No User Selected', description: 'Please select a user to send the popup to.' });
        return;
    }
    setIsSendingPopup(true);
    try {
        const rewards = {
            credits: popupCreditAmount,
            scratch: popupScratchAmount,
            flip: popupFlipAmount,
        };
        const target = popupTarget === 'all' ? 'all' : popupSingleUserId;

        await sendGlobalGift({
            message: popupMessage,
            rewards: rewards,
            target: target
        });

        // Send push notification
        if (target === 'all') {
            await sendNotification({ title: "A Gift From The Admins!", body: popupMessage });
        } else if (target) {
            await sendNotificationToUser({ userId: target, title: "A Gift For You!", body: popupMessage });
        }

        toast({ title: "Popup Sent!", description: "The message is now active and notifications have been sent." });
        setPopupMessage('');
        setPopupCreditAmount(0);
        setPopupScratchAmount(0);
        setPopupFlipAmount(0);
        setPopupSingleUserId(null);

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Failed to Send Popup', description: error.message });
    } finally {
        setIsSendingPopup(false);
    }
};


  const handleCostChange = (featureId: string, cost: number) => {
    setFeatureCosts(prev => ({ ...prev, [featureId]: cost }));
  };

  const handleLockFeature = (featureId: string, cost: number) => {
    lockFeature(featureId, cost);
    toast({ title: "Feature Locked", description: `Users will now need ${cost} credits to unlock it.`});
  };

  const handleToggleLaunch = (status: AppSettings['marcoAiLaunchStatus']) => {
    const newStatus = status === 'live' ? 'countdown' : 'live';
    updateAppSettings({ marcoAiLaunchStatus: newStatus });
    toast({ title: `Marco AI is now ${newStatus === 'live' ? 'LIVE' : 'in countdown mode'}.`});
  };

  const handleGenerateDevToken = async () => {
    if (!devTokenUser) {
        toast({ variant: 'destructive', title: 'No user selected' });
        return;
    }
    setIsGeneratingToken(true);
    try {
        const token = await generateDevAiAccessToken(devTokenUser);
        if(token) {
            setGeneratedDevToken(token);
            toast({ title: "Dev Token Generated" });
        } else {
            throw new Error("Token generation failed");
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
        setGeneratedDevToken(null);
    } finally {
        setIsGeneratingToken(false);
    }
  };

  const handleGrantMasterCard = async () => {
      if (!masterCardUser) return;
      await grantMasterCard(masterCardUser.uid, masterCardDuration);
      toast({ title: `Master Card granted to ${masterCardUser.displayName} for ${masterCardDuration} days.`});
      setIsMasterCardDialogOpen(false);
      setMasterCardUser(null);
  };

  const handleRevokeMasterCard = async (user: User) => {
      await revokeMasterCard(user.uid);
      toast({ title: `Master Card revoked from ${user.displayName}.`});
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Card className="w-full max-w-md border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
                <ShieldX className="h-8 w-8"/> Access Denied
            </CardTitle>
            <CardDescription>
                This is a restricted area. You do not have permissions to be here.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Controls</h1>
        <p className="text-muted-foreground">Manage user roles, credits, rewards and app settings.</p>
      </div>

      <Accordion type="multiple" defaultValue={['user-management']} className="w-full space-y-4">
        {/* App Settings */}
        <AccordionItem value="app-settings" className="border-b-0">
          <Card>
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <Rocket className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">App Launch Settings</h3>
                  <p className="text-sm text-muted-foreground text-left">Control global feature launches.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                <Card>
                    <CardHeader>
                        <CardTitle>Marco AI Launch Status</CardTitle>
                        <CardDescription>Toggle the Marco AI feature between countdown and live mode for all users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                        <div className="flex-1">
                          <p className="font-semibold">Current Status:</p>
                           <Badge variant={appSettings?.marcoAiLaunchStatus === 'live' ? 'default' : 'secondary'} className="text-base mt-1">
                              {appSettings?.marcoAiLaunchStatus === 'live' ? 'Live' : 'Countdown'}
                           </Badge>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant={appSettings?.marcoAiLaunchStatus === 'live' ? 'destructive' : 'default'}>
                                  {appSettings?.marcoAiLaunchStatus === 'live' ? 'Deactivate (Back to Countdown)' : 'Launch Marco AI!'}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will change the Marco AI status for all users.
                                        {appSettings?.marcoAiLaunchStatus === 'live' ? 
                                        ' Deactivating will hide the AI and show the countdown again.' : 
                                        ' Launching will make the AI accessible to users who purchase it.'}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleToggleLaunch(appSettings?.marcoAiLaunchStatus ?? 'countdown')}>
                                      Confirm
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                </Card>
            </AccordionContent>
          </Card>
        </AccordionItem>
        
        {/* User Management */}
        <AccordionItem value="user-management" className="border-b-0">
          <Card>
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">User Management</h3>
                  <p className="text-sm text-muted-foreground text-left">View and manage all registered users and their roles.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                <Card>
                    <CardHeader>
                        <CardTitle>All Registered Users</CardTitle>
                        <CardDescription>Total Users: {users.length}</CardDescription>
                    </CardHeader>
                  <CardContent className="pt-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Master Card</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map(user => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.displayName}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell><Badge variant={user.isBlocked ? 'destructive' : 'secondary'}>{user.isBlocked ? 'Blocked' : 'Active'}</Badge></TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {user.uid === SUPER_ADMIN_UID ? (
                                        <span className="dev-badge"><Code className="h-3 w-3" /> DEV</span>
                                    ) : user.isCoDev ? (
                                        <span className="co-dev-badge"><Code className="h-3 w-3"/> Co-Dev</span>
                                    ) : user.isAdmin ? (
                                        <span className="admin-badge"><ShieldCheck className="h-3 w-3"/> ADMIN</span>
                                    ) : user.isChallenger ? (
                                         <span className="challenger-badge"><Swords className="h-3 w-3"/> Challenger</span>
                                    ) : user.isVip ? (
                                        <span className="elite-badge"><Crown className="h-3 w-3"/> ELITE</span>
                                    ) : user.isGM ? (
                                        <span className="gm-badge">GM</span>
                                    ) : (
                                        <Badge variant="outline">User</Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                {user.masterCardExpires && new Date(user.masterCardExpires) > new Date() ? (
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="border-yellow-500 text-yellow-500">Active until {format(new Date(user.masterCardExpires), 'd MMM')}</Badge>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                 <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive"><UserMinus /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Revoke Master Card?</AlertDialogTitle><AlertDialogDescription>This will immediately remove Master Card access for {user.displayName}.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleRevokeMasterCard(user)}>Revoke</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                ) : (
                                    <Badge variant="secondary">None</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="outline" size="sm" onClick={() => { setMasterCardUser(user); setIsMasterCardDialogOpen(true); }}>
                                    <CreditCard className="mr-2 h-4 w-4"/> Grant Card
                                </Button>
                                {user.uid !== SUPER_ADMIN_UID && ( // Prevent super admin from losing their own status
                                    <>
                                        {user.isAdmin ? (
                                            <Button variant="secondary" size="sm" onClick={() => removeUserAdmin(user.uid)}>
                                                <UserCog className="mr-2 h-4 w-4"/>Remove Admin
                                            </Button>
                                        ) : (
                                            <Button variant="outline" size="sm" onClick={() => makeUserAdmin(user.uid)}>
                                                <ShieldCheck className="mr-2 h-4 w-4"/>Make Admin
                                            </Button>
                                        )}
                                        {user.isCoDev ? (
                                            <Button variant="secondary" size="sm" onClick={() => removeUserCoDev(user.uid)}>
                                                <Code className="mr-2 h-4 w-4"/>Remove Co-Dev
                                            </Button>
                                        ) : (
                                            <Button variant="outline" size="sm" onClick={() => makeUserCoDev(user.uid)}>
                                                <Code className="mr-2 h-4 w-4"/>Make Co-Dev
                                            </Button>
                                        )}
                                        {user.isChallenger ? (
                                            <Button variant="secondary" size="sm" onClick={() => removeUserChallenger(user.uid)}>
                                                <Swords className="mr-2 h-4 w-4"/>Remove Challenger
                                            </Button>
                                        ) : (
                                            <Button variant="outline" size="sm" onClick={() => makeUserChallenger(user.uid)}>
                                                <Swords className="mr-2 h-4 w-4"/>Make Challenger
                                            </Button>
                                        )}
                                        {user.isVip ? (
                                            <Button variant="secondary" size="sm" onClick={() => removeUserVip(user.uid)}>
                                                <Crown className="mr-2 h-4 w-4"/>Remove Elite
                                            </Button>
                                        ) : (
                                            <Button variant="outline" size="sm" onClick={() => makeUserVip(user.uid)}>
                                                <Crown className="mr-2 h-4 w-4"/>Make Elite
                                            </Button>
                                        )}
                                        {user.isGM ? (
                                            <Button variant="secondary" size="sm" onClick={() => removeUserGM(user.uid)}>
                                                <Gamepad2 className="mr-2 h-4 w-4"/>Remove GM
                                            </Button>
                                        ) : (
                                            <Button variant="outline" size="sm" onClick={() => makeUserGM(user.uid)}>
                                                <Gamepad2 className="mr-2 h-4 w-4"/>Make GM
                                            </Button>
                                        )}
                                        <Button variant={user.isBlocked ? 'outline' : 'destructive'} size="sm" onClick={() => toggleUserBlock(user.uid, user.isBlocked)}>
                                            {user.isBlocked ? 'Unblock' : 'Block'} User
                                        </Button>
                                    </>
                                )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
            </AccordionContent>
          </Card>
        </AccordionItem>
        
        {/* Developer Tools */}
        <AccordionItem value="dev-tools" className="border-b-0">
          <Card>
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <KeyRoundIcon className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Developer Tools</h3>
                  <p className="text-sm text-muted-foreground text-left">Tools for testing and development.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                <Card>
                    <CardHeader>
                        <CardTitle>Generate AI Access Token</CardTitle>
                        <CardDescription>Generate a one-time access token for Marco AI for any user without deducting credits.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Select User to Generate Token For</Label>
                        <Select onValueChange={setDevTokenUser} value={devTokenUser ?? undefined}>
                            <SelectTrigger><SelectValue placeholder="Select a user..." /></SelectTrigger>
                            <SelectContent>
                                {users.filter(u => !u.isBlocked).map(user => (
                                    <SelectItem key={user.uid} value={user.uid}>
                                        {user.displayName} {user.uid === SUPER_ADMIN_UID && "(You)"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleGenerateDevToken} disabled={isGeneratingToken || !devTokenUser}>
                          {isGeneratingToken ? "Generating..." : "Generate Token"}
                      </Button>
                      {generatedDevToken && (
                        <div className="space-y-2 pt-4">
                           <Label>Generated Token</Label>
                           <Input readOnly value={generatedDevToken} className="font-mono"/>
                           <p className="text-xs text-muted-foreground">This is a one-time use token. The user's `hasAiAccess` flag has also been set to true.</p>
                        </div>
                      )}
                    </CardContent>
                </Card>
            </AccordionContent>
          </Card>
        </AccordionItem>

         {/* Feature Management */}
        <AccordionItem value="feature-management" className="border-b-0">
          <Card>
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <Lock className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Feature Management</h3>
                  <p className="text-sm text-muted-foreground text-left">Control access to premium features.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                <Card>
                    <CardHeader>
                        <CardTitle>Feature Locks & Costs</CardTitle>
                        <CardDescription>Set which features require credits to unlock and how much they cost. A cost of 0 means the feature is free.</CardDescription>
                    </CardHeader>
                  <CardContent className="pt-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Feature</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Unlock Cost</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lockableFeatures.map(feature => {
                            const lockInfo = featureLocks?.[feature.id];
                            const isLocked = lockInfo?.isLocked ?? false;
                            const currentCost = featureCosts[feature.id] ?? feature.defaultCost;
                            return (
                                <TableRow key={feature.id}>
                                    <TableCell className="font-medium">
                                        <p>{feature.name}</p>
                                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={isLocked ? 'destructive' : 'secondary'}>
                                            {isLocked ? 'Locked' : 'Unlocked'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Input 
                                                type="number" 
                                                className="w-24 h-8"
                                                value={currentCost}
                                                onChange={(e) => handleCostChange(feature.id, Number(e.target.value))}
                                            />
                                            <span>credits</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                         {isLocked ? (
                                            <Button variant="outline" size="sm" onClick={() => unlockFeature(feature.id)}>
                                                <Unlock className="mr-2 h-4 w-4"/>Unlock
                                            </Button>
                                        ) : (
                                            <Button variant="secondary" size="sm" onClick={() => handleLockFeature(feature.id, currentCost)}>
                                                <Lock className="mr-2 h-4 w-4"/>Lock
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
            </AccordionContent>
          </Card>
        </AccordionItem>
        
        {/* Global Gifts */}
        <AccordionItem value="global-gifts" className="border-b-0">
          <Card>
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <Send className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Personalized Popups</h3>
                  <p className="text-sm text-muted-foreground text-left">Send a targeted popup with a message and optional rewards.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Create a New Popup</CardTitle>
                        <CardDescription>Send a message to all users or a specific user. Set reward amounts to 0 for an informational popup.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="popup-message">Message</Label>
                            <Input id="popup-message" value={popupMessage} onChange={e => setPopupMessage(e.target.value)} placeholder="e.g., Happy New Year! Here's a gift."/>
                        </div>
                        <div className="space-y-2">
                            <Label>Target User</Label>
                            <div className="flex gap-4">
                                <Select value={popupTarget} onValueChange={(v: 'all' | 'single') => setPopupTarget(v)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Users</SelectItem>
                                        <SelectItem value="single">Single User</SelectItem>
                                    </SelectContent>
                                </Select>
                                {popupTarget === 'single' && (
                                     <Select onValueChange={setPopupSingleUserId} value={popupSingleUserId ?? undefined}>
                                        <SelectTrigger><SelectValue placeholder="Select a user..." /></SelectTrigger>
                                        <SelectContent>
                                            {users.filter(u => !u.isBlocked).map(user => (
                                                <SelectItem key={user.uid} value={user.uid}>
                                                    {user.displayName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                             <Label>Rewards (Optional)</Label>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border rounded-lg">
                                <div className="space-y-1">
                                    <Label htmlFor="popup-credits" className="text-xs flex items-center gap-1"><DollarSign className="h-3 w-3"/> Credits</Label>
                                    <Input id="popup-credits" type="number" value={popupCreditAmount} onChange={e => setPopupCreditAmount(Number(e.target.value))} min="0"/>
                                </div>
                                 <div className="space-y-1">
                                    <Label htmlFor="popup-scratch" className="text-xs flex items-center gap-1"><VenetianMask className="h-3 w-3"/> Scratch Cards</Label>
                                    <Input id="popup-scratch" type="number" value={popupScratchAmount} onChange={e => setPopupScratchAmount(Number(e.target.value))} min="0"/>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="popup-flip" className="text-xs flex items-center gap-1"><Box className="h-3 w-3"/> Card Flips</Label>
                                    <Input id="popup-flip" type="number" value={popupFlipAmount} onChange={e => setPopupFlipAmount(Number(e.target.value))} min="0"/>
                                </div>
                             </div>
                        </div>

                        <Button onClick={handleSendPopup} disabled={isSendingPopup}>
                            {isSendingPopup ? 'Sending...' : 'Send Popup & Notification'}
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Sent Gifts/Popups</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {globalGifts.map(gift => (
                                    <TableRow key={gift.id}>
                                        <TableCell className="max-w-xs truncate">{gift.message}</TableCell>
                                        <TableCell>
                                            <Badge variant={gift.isActive ? 'default' : 'secondary'}>
                                                {gift.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="capitalize">
                                            {gift.target === 'all' ? 'All Users' : users.find(u => u.uid === gift.target)?.displayName || 'Single User'}
                                        </TableCell>
                                        <TableCell>{(gift.createdAt && typeof (gift.createdAt as any).toDate === 'function') ? formatDistanceToNow((gift.createdAt as any).toDate(), {addSuffix: true}) : 'Just now'}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {gift.isActive && (
                                                 <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button variant="destructive" size="sm">Deactivate</Button></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Deactivate this popup?</AlertDialogTitle><AlertDialogDescription>This will prevent any new users from seeing or claiming it. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deactivateGift(gift.id)}>Deactivate</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Delete this popup history?</AlertDialogTitle><AlertDialogDescription>This will permanently remove this record from the history. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteGlobalGift(gift.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {globalGifts.length === 0 && <TableRow><TableCell colSpan={5} className="text-center h-24">No popups sent yet.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Credit/Reward Management */}
        <AccordionItem value="credit-management" className="border-b-0">
           <Card>
              <AccordionTrigger className="p-6">
                <div className="flex items-center gap-3">
                  <Gift className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Reward Management</h3>
                    <p className="text-sm text-muted-foreground text-left">Gift credits or free rewards to any user.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <Card>
                    <CardContent className="pt-6">
                        {!isCreditUnlocked ? (
                            <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-muted/50 border-2 border-dashed">
                                 <Wallet className="h-10 w-10 text-muted-foreground mb-4"/>
                                 <h3 className="font-semibold">Unlock Admin Controls</h3>
                                 <p className="text-sm text-muted-foreground mb-4">Enter the password to manage user rewards.</p>
                                 <form onSubmit={handleCreditPasswordSubmit} className="flex items-center gap-2">
                                     <Input 
                                        type="password"
                                        placeholder="Admin Password..."
                                        value={creditPassword}
                                        onChange={(e) => setCreditPassword(e.target.value)}
                                     />
                                     <Button type="submit">Unlock</Button>
                                 </form>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Select User</Label>
                                    <Select onValueChange={setSelectedUserId} value={selectedUserId ?? undefined}>
                                        <SelectTrigger><SelectValue placeholder="Select a user or group..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__all__">
                                                <span className="font-bold text-primary">Gift to All Users</span>
                                            </SelectItem>
                                            {users.filter(u => !u.isBlocked).map(user => (
                                                <SelectItem key={user.uid} value={user.uid}>
                                                    {user.displayName} ({user.email}) - {user.credits} credits, {user.freeRewards || 0} cards, {user.freeGuesses || 0} guesses
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                 </div>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {/* Credit Management */}
                                    <div className="space-y-4 rounded-lg border p-4">
                                        <h4 className="font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4" /> Manage Credits</h4>
                                        <div className="space-y-2">
                                            <Label htmlFor="credit-amount">Amount</Label>
                                            <Input id="credit-amount" type="number" value={creditAmount} onChange={(e) => setCreditAmount(Number(e.target.value))} min="0" />
                                        </div>
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            <Button variant="destructive" onClick={handleDeductCredits} disabled={!selectedUserId || creditAmount <= 0 || selectedUserId === '__all__'}><MinusCircle /> Deduct</Button>
                                            <Button onClick={handleGiftCredits} disabled={!selectedUserId || creditAmount <= 0}><Gift/> Gift</Button>
                                        </div>
                                        <Button variant="outline" className="w-full" onClick={handleResetCredits} disabled={!selectedUserId || selectedUserId === '__all__'}><RefreshCcw /> Reset to 100</Button>
                                    </div>
                                    {/* Spin Management */}
                                     <div className="space-y-4 rounded-lg border p-4">
                                        <h4 className="font-semibold flex items-center gap-2"><VenetianMask className="h-4 w-4" /> Manage Scratch Cards</h4>
                                        <div className="space-y-2">
                                            <Label htmlFor="spin-amount">Cards to Add</Label>
                                            <Input id="spin-amount" type="number" value={spinAmount} onChange={(e) => setSpinAmount(Number(e.target.value))} min="1" />
                                        </div>
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            <Button onClick={handleGiftSpins} disabled={!selectedUserId || spinAmount <= 0}><Gift/> Gift Cards</Button>
                                        </div>
                                    </div>
                                     {/* Guess Management */}
                                     <div className="space-y-4 rounded-lg border p-4">
                                        <h4 className="font-semibold flex items-center gap-2"><Box className="h-4 w-4" /> Manage Free Guesses</h4>
                                        <div className="space-y-2">
                                            <Label htmlFor="guess-amount">Guesses to Add</Label>
                                            <Input id="guess-amount" type="number" value={guessAmount} onChange={(e) => setGuessAmount(Number(e.target.value))} min="1" />
                                        </div>
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            <Button onClick={handleGiftGuesses} disabled={!selectedUserId || guessAmount <= 0}><Gift/> Gift Guesses</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
              </AccordionContent>
            </Card>
        </AccordionItem>

        {/* Data Management */}
         <AccordionItem value="data-management" className="border-b-0">
           <Card>
              <AccordionTrigger className="p-6">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Data Management</h3>
                    <p className="text-sm text-muted-foreground text-left">Perform global data operations.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Global Chat</CardTitle>
                        <CardDescription>Permanently delete all messages from the public community hub chat.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4"/> Clear Global Chat
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle/>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete all messages in the global community hub for all users.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClearGlobalChat}>Yes, delete all messages</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Quiz Leaderboard</CardTitle>
                        <CardDescription>Permanently reset all quiz-related stats for all users (perfected quizzes, attempts).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trophy className="mr-2 h-4 w-4"/> Reset Quiz Leaderboard
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle/>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will reset the Quiz Zone leaderboard for everyone by clearing all perfected quiz records and attempt counts. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClearQuizLeaderboard}>Yes, reset the leaderboard</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Game Zone Leaderboard</CardTitle>
                        <CardDescription>Permanently reset all game high scores for all users. This is useful for starting a new season.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Gamepad2 className="mr-2 h-4 w-4"/> Reset Game Zone Leaderboard
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle/>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will reset all `gameHighScores` to 0 for every user. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleResetGameZoneLeaderboard}>Yes, reset game scores</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Weekly Study Leaderboard</CardTitle>
                        <CardDescription>Permanently delete all of this week's study sessions for all users. This is useful for correcting data after a bug.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <History className="mr-2 h-4 w-4"/> Reset Weekly Study Time
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle/>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will delete all `timeTrackerSessions` for the current week for all users. This cannot be undone and will reset the weekly leaderboard.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleResetWeeklyStudy}>Yes, reset weekly time</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>

              </AccordionContent>
            </Card>
        </AccordionItem>

      </Accordion>

         <Dialog open={isMasterCardDialogOpen} onOpenChange={setIsMasterCardDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Grant Master Card to {masterCardUser?.displayName}</DialogTitle>
                    <DialogDescription>
                        This will grant the user unlimited credits and bypass all credit costs for a limited time. This action is powerful and should be used wisely.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Label>Select Duration</Label>
                     <Select onValueChange={(v) => setMasterCardDuration(Number(v))} defaultValue="7">
                        <SelectTrigger>
                            <SelectValue placeholder="Select duration..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1 Day</SelectItem>
                            <SelectItem value="3">3 Days</SelectItem>
                            <SelectItem value="7">7 Days</SelectItem>
                            <SelectItem value="15">15 Days</SelectItem>
                            <SelectItem value="30">30 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleGrantMasterCard}>Grant Card for {masterCardDuration} Days</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}

