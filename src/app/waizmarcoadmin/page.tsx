

'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdmin, SUPER_ADMIN_UID, type User, type AppTheme } from '@/hooks/use-admin';
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
import { Gift, RefreshCcw, Users, ShieldCheck, UserCog, DollarSign, Wallet, ShieldX, MinusCircle, Trash2, AlertTriangle, VenetianMask, Box, UserPlus, CheckCircle, XCircle, Palette, Crown, Code, Trophy, Gamepad2, Send, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';
import { Slider } from '@/components/ui/slider';


const CREDIT_PASSWORD = "waizcredit";

export default function SuperAdminPanelPage() {
  const { 
    isSuperAdmin, users, toggleUserBlock, makeUserAdmin, removeUserAdmin, 
    makeUserVip, removeUserVip,
    makeUserGM, removeUserGM,
    addCreditsToUser, giftCreditsToAllUsers,
    addFreeSpinsToUser, addSpinsToAllUsers,
    addFreeGuessesToUser, addGuessesToAllUsers,
    resetUserCredits, clearGlobalChat, clearQuizLeaderboard,
    resetWeeklyStudyTime,
    resetGameZoneLeaderboard,
    sendGlobalGift
  } = useAdmin();
  const { pendingReferrals, approveReferral, declineReferral, loading: referralsLoading } = useReferrals();
  const { toast } = useToast();
  
  // State for Credit Management
  const [isCreditUnlocked, setIsCreditUnlocked] = useState(false);
  const [creditPassword, setCreditPassword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState(10);
  const [spinAmount, setSpinAmount] = useState(1);
  const [guessAmount, setGuessAmount] = useState(1);
  
  // State for Global Gift
  const [giftMessage, setGiftMessage] = useState('');
  const [giftType, setGiftType] = useState<'credits' | 'scratch' | 'flip'>('credits');
  const [giftAmount, setGiftAmount] = useState(5);
  const [isSendingGift, setIsSendingGift] = useState(false);
  
  
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

  const handleApproveReferral = async (referral: ReferralRequest) => {
      try {
          await approveReferral(referral);
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Approval Failed', description: error.message });
      }
  }
  
  const handleDeclineReferral = async (referralId: string) => {
       try {
          await declineReferral(referralId);
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Decline Failed', description: error.message });
      }
  }

  const handleSendGlobalGift = async () => {
      if(!giftMessage.trim() || giftAmount <= 0) {
          toast({variant: 'destructive', title: 'Invalid Gift', description: 'Please provide a message and a positive gift amount.'});
          return;
      }
      setIsSendingGift(true);
      try {
          await sendGlobalGift({
              message: giftMessage,
              type: giftType,
              amount: giftAmount,
          });
          toast({ title: "Global Gift Sent!", description: "The gift is now available for all users to claim."});
          setGiftMessage('');
          setGiftAmount(5);
      } catch (error: any) {
          toast({variant: 'destructive', title: 'Failed to Send Gift', description: error.message });
      } finally {
          setIsSendingGift(false);
      }
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
        <p className="text-muted-foreground">Manage user roles, credits, rewards and app theme.</p>
      </div>

      <Accordion type="multiple" defaultValue={['user-management']} className="w-full space-y-4">
        
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
                                    ) : user.isAdmin ? (
                                        <span className="admin-badge"><ShieldCheck className="h-3 w-3"/> ADMIN</span>
                                    ) : user.isVip ? (
                                        <span className="elite-badge"><Crown className="h-3 w-3"/> ELITE</span>
                                    ) : user.isGM ? (
                                        <span className="gm-badge">GM</span>
                                    ) : (
                                        <Badge variant="outline">User</Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
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
        
        {/* Global Gifts */}
        <AccordionItem value="global-gifts" className="border-b-0">
          <Card>
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <Send className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Global Gifts</h3>
                  <p className="text-sm text-muted-foreground text-left">Send a claimable reward to all users.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                <Card>
                    <CardHeader>
                        <CardTitle>Create a New Global Gift</CardTitle>
                        <CardDescription>This gift will appear as a popup on every user's dashboard until they claim it.</CardDescription>
                    </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="gift-message">Gift Message</Label>
                        <Input id="gift-message" value={giftMessage} onChange={e => setGiftMessage(e.target.value)} placeholder="e.g., Happy New Year! Here's a gift."/>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="gift-type">Gift Type</Label>
                            <Select value={giftType} onValueChange={(v: any) => setGiftType(v)}>
                                <SelectTrigger id="gift-type"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="credits"><DollarSign className="mr-2 h-4 w-4"/> Credits</SelectItem>
                                    <SelectItem value="scratch"><VenetianMask className="mr-2 h-4 w-4"/> Scratch Cards</SelectItem>
                                    <SelectItem value="flip"><Box className="mr-2 h-4 w-4"/> Card Flip Plays</SelectItem>
                                </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="gift-amount">Amount</Label>
                            <Input id="gift-amount" type="number" value={giftAmount} onChange={e => setGiftAmount(Number(e.target.value))} min="1"/>
                          </div>
                      </div>
                      <Button onClick={handleSendGlobalGift} disabled={isSendingGift}>
                        {isSendingGift ? 'Sending...' : 'Send Global Gift to All Users'}
                      </Button>
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

        {/* Referral Management */}
        <AccordionItem value="referral-management" className="border-b-0">
           <Card>
              <AccordionTrigger className="p-6">
                <div className="flex items-center gap-3">
                  <UserPlus className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Referral Management</h3>
                    <p className="text-sm text-muted-foreground text-left">Approve or decline pending user referrals.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Referral Requests</CardTitle>
                        <CardDescription>Approve requests to grant 50 credits to the referrer.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Inviter</TableHead>
                                    <TableHead>New User</TableHead>
                                    <TableHead>Code Used</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {referralsLoading && (
                                    <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading requests...</TableCell></TableRow>
                                )}
                                {!referralsLoading && pendingReferrals.length === 0 && (
                                    <TableRow><TableCell colSpan={5} className="h-24 text-center">No pending referrals.</TableCell></TableRow>
                                )}
                                {pendingReferrals.map(req => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-medium">{req.referrerName}</TableCell>
                                        <TableCell>{req.newUserName}</TableCell>
                                        <TableCell><Badge variant="outline">{req.codeUsed}</Badge></TableCell>
                                        <TableCell>{formatDistanceToNow(req.createdAt.toDate(), { addSuffix: true })}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeclineReferral(req.id)}><XCircle /></Button>
                                            <Button variant="ghost" size="icon" className="text-green-500" onClick={() => handleApproveReferral(req)}><CheckCircle /></Button>
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
    </div>
  );
}
