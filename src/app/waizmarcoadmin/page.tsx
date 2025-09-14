
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
import { Gift, RefreshCcw, Users, ShieldCheck, UserCog, DollarSign, Wallet, ShieldX, MinusCircle, Trash2, AlertTriangle, VenetianMask, Box, UserPlus, CheckCircle, XCircle, Palette, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';
import { Slider } from '@/components/ui/slider';


const CREDIT_PASSWORD = "waizcredit";

const themePresets: Record<string, AppTheme> = {
    "Default Theme": { primary: "262 80% 56%", background: "240 10% 3.9%", accent: "240 3.7% 15.9%", radius: 0.8 },
    "Crimson Red": { primary: "0 84.2% 60.2%", background: "240 10% 3.9%", accent: "0 84.2% 60.2%", radius: 0.8 },
    "Ocean Blue": { primary: "207 90% 54%", background: "222 84% 4.9%", accent: "217 33% 17%", radius: 0.8 },
    "Forest Green": { primary: "142 76% 36%", background: "142 100% 4%", accent: "142 76% 15%", radius: 0.8 },
    "Goldenrod Yellow": { primary: "45 100% 51%", background: "45 100% 5%", accent: "45 100% 20%", radius: 0.8 },
    "Royal Purple": { primary: "262 80% 56%", background: "240 10% 3.9%", accent: "240 3.7% 15.9%", radius: 0.8 },
    "Electric Lime": { primary: "84 100% 50%", background: "240 10% 3.9%", accent: "84 100% 20%", radius: 0.8 },
    "Slate Gray": { primary: "215 28% 47%", background: "222 47% 11%", accent: "215 28% 27%", radius: 0.8 },
    "Cyberpunk Pink": { primary: "316 100% 64%", background: "316 100% 5%", accent: "316 100% 25%", radius: 0.8 },
    "Mocha Brown": { primary: "30 59% 45%", background: "25 60% 10%", accent: "30 59% 25%", radius: 0.8 },
}


export default function SuperAdminPanelPage() {
  const { 
    isSuperAdmin, users, toggleUserBlock, makeUserAdmin, removeUserAdmin, 
    makeUserVip, removeUserVip,
    addCreditsToUser, giftCreditsToAllUsers,
    addFreeSpinsToUser, addSpinsToAllUsers,
    addFreeGuessesToUser, addGuessesToAllUsers,
    resetUserCredits, clearGlobalChat,
    appTheme, updateAppTheme,
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

  // State for Theme Management
  const [themePrimary, setThemePrimary] = useState('262 80% 56%');
  const [themeBackground, setThemeBackground] = useState('240 10% 3.9%');
  const [themeAccent, setThemeAccent] = useState('240 3.7% 15.9%');
  const [themeRadius, setThemeRadius] = useState(0.8);

  useEffect(() => {
    if (appTheme) {
        setThemePrimary(appTheme.primary);
        setThemeBackground(appTheme.background);
        setThemeAccent(appTheme.accent);
        setThemeRadius(appTheme.radius);
    }
  }, [appTheme]);
  
  
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

  const handleUpdateTheme = async () => {
    const newTheme: AppTheme = {
        primary: themePrimary,
        background: themeBackground,
        accent: themeAccent,
        radius: themeRadius
    };
    try {
        await updateAppTheme(newTheme);
        const root = document.documentElement;
        root.style.setProperty('--primary', `hsl(${newTheme.primary})`);
        root.style.setProperty('--background', `hsl(${newTheme.background})`);
        root.style.setProperty('--accent', `hsl(${newTheme.accent})`);
        root.style.setProperty('--radius', `${newTheme.radius}rem`);
        toast({ title: 'Theme Updated!', description: 'The new theme has been applied globally.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Theme Update Failed', description: error.message });
    }
  }

   const applyPreset = (presetName: string) => {
        const preset = themePresets[presetName];
        if (preset) {
            setThemePrimary(preset.primary);
            setThemeBackground(preset.background);
            setThemeAccent(preset.accent);
            setThemeRadius(preset.radius);
            toast({ title: 'Preset Applied!', description: `"${presetName}" values are ready. Click "Update Global Theme" to save.` });
        }
    };

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
                  <CardContent className="pt-6">
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
                                    {user.isAdmin && <Badge>Admin</Badge>}
                                    {user.isVip && <span className="vip-badge"><Crown className="h-3 w-3"/> VIP</span>}
                                    {!user.isAdmin && !user.isVip && <Badge variant="outline">User</Badge>}
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
                                                <Crown className="mr-2 h-4 w-4"/>Remove VIP
                                            </Button>
                                        ) : (
                                            <Button variant="outline" size="sm" onClick={() => makeUserVip(user.uid)}>
                                                <Crown className="mr-2 h-4 w-4"/>Make VIP
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
        
        {/* Theme Management */}
        <AccordionItem value="theme-management" className="border-b-0">
           <Card>
              <AccordionTrigger className="p-6">
                <div className="flex items-center gap-3">
                  <Palette className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Theme Management</h3>
                    <p className="text-sm text-muted-foreground text-left">Customize the look and feel of the app for all users.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Global Theme Settings</CardTitle>
                        <CardDescription>Changes will be applied to all users instantly. Use HSL values without 'hsl()' for colors.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="theme-primary">Primary Color (HSL)</Label>
                                <Input id="theme-primary" value={themePrimary} onChange={e => setThemePrimary(e.target.value)} placeholder="e.g. 262 80% 56%"/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="theme-background">Background (HSL)</Label>
                                <Input id="theme-background" value={themeBackground} onChange={e => setThemeBackground(e.target.value)} placeholder="e.g. 240 10% 3.9%"/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="theme-accent">Accent (HSL)</Label>
                                <Input id="theme-accent" value={themeAccent} onChange={e => setThemeAccent(e.target.value)} placeholder="e.g. 240 3.7% 15.9%"/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="theme-radius">Border Radius: {themeRadius}rem</Label>
                            <Slider id="theme-radius" value={[themeRadius]} onValueChange={(v) => setThemeRadius(v[0])} max={1} step={0.1}/>
                        </div>
                        <Button onClick={handleUpdateTheme}>
                            <RefreshCcw className="mr-2 h-4 w-4"/> Update Global Theme
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Theme Preset Guide</CardTitle>
                        <CardDescription>Click a preset to apply its colors to the fields above, then save.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {Object.entries(themePresets).map(([name, theme]) => (
                                <AccordionItem value={name} key={name}>
                                    <AccordionTrigger>{name}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                                            <div className="space-y-1 text-sm">
                                                <p><b>Primary:</b> {theme.primary}</p>
                                                <p><b>Background:</b> {theme.background}</p>
                                                <p><b>Accent:</b> {theme.accent}</p>
                                            </div>
                                            <Button onClick={() => applyPreset(name)}>Apply</Button>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
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
              <AccordionContent className="p-6 pt-0">
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
              </AccordionContent>
            </Card>
        </AccordionItem>

      </Accordion>
    </div>
  );
}

    