
'use client';

import { useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Trash2, Camera, Crown, ShieldPlus, ShieldX, ShieldCheck, Gift, RefreshCcw, Unlock } from 'lucide-react';
import { useAdmin, useUsers } from '@/hooks/use-admin';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// This now uses your email to identify you as the Super Admin
const SUPER_ADMIN_EMAIL = 'waizmonazzum270@gmail.com';
const CREDIT_UNLOCK_PASSWORD = "waizcredit";


function SuperAdminControl() {
  const { users, makeUserAdmin, removeUserAdmin, giftCreditsToUser, resetUserCredits } = useAdmin();
  const { toast } = useToast();
  const [targetUid, setTargetUid] = useState('');
  
  // State for credit control
  const [isCreditControlUnlocked, setIsCreditControlUnlocked] = useState(false);
  const [creditPassword, setCreditPassword] = useState('');
  const [selectedCreditUser, setSelectedCreditUser] = useState('');
  const [giftAmount, setGiftAmount] = useState(10);

  const admins = users.filter(u => u.isAdmin);

  const handleMakeAdmin = async () => {
    if (!targetUid.trim()) {
        toast({ variant: 'destructive', title: 'UID Required', description: 'Please enter a user UID.' });
        return;
    }
    try {
        await makeUserAdmin(targetUid);
        toast({ title: 'Success', description: 'User has been granted admin privileges.' });
        setTargetUid('');
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  }

   const handleRemoveAdmin = async (uid: string) => {
    try {
        await removeUserAdmin(uid);
        toast({ title: 'Success', description: 'Admin privileges have been revoked.' });
    } catch (error: any) => {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  }
  
   const handleCreditUnlock = () => {
    if(creditPassword === CREDIT_UNLOCK_PASSWORD) {
        setIsCreditControlUnlocked(true);
        toast({ title: "Access Granted", description: "Credit control panel unlocked."});
    } else {
        toast({ variant: 'destructive', title: "Access Denied", description: "The password you entered is incorrect."});
    }
    setCreditPassword('');
  }

  const handleGiftCredits = async () => {
    if(!selectedCreditUser) {
        toast({ variant: 'destructive', title: "No User Selected", description: "Please select a user to gift credits to."});
        return;
    }
    await giftCreditsToUser(selectedCreditUser, giftAmount);
    toast({ title: "Credits Gifted!", description: `Successfully sent ${giftAmount} credits.`});
  }
  
  const handleResetCredits = async () => {
    if(!selectedCreditUser) {
        toast({ variant: 'destructive', title: "No User Selected", description: "Please select a user to reset credits for."});
        return;
    }
    await resetUserCredits(selectedCreditUser);
    toast({ title: "Credits Reset!", description: `User's credits have been reset to 100.`});
  }


  return (
    <Card className="lg:col-span-3 border-amber-500/50 bg-amber-500/5">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600"><ShieldCheck className="h-5 w-5"/> Super Admin Control</CardTitle>
            <CardDescription>Manage application administrators and user credits. This panel is only visible to you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-4">
                <h4 className="font-semibold">Grant Admin Rights</h4>
                <div className="flex items-center gap-2">
                    <Input 
                        placeholder="Enter user UID to make admin"
                        value={targetUid}
                        onChange={(e) => setTargetUid(e.target.value)}
                    />
                    <Button onClick={handleMakeAdmin}><ShieldPlus className="mr-2 h-4 w-4"/> Grant Admin</Button>
                </div>
            </div>
             <Separator/>
            <div className="space-y-4">
                 <h4 className="font-semibold">Current Administrators</h4>
                 <div className="space-y-2 rounded-lg border p-2">
                    {admins.map(admin => (
                        <div key={admin.uid} className="flex items-center justify-between p-2 rounded-md hover:bg-background/50">
                           <div className="flex items-center gap-3">
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={admin.photoURL ?? undefined} />
                                <AvatarFallback>{admin.displayName.charAt(0)}</AvatarFallback>
                             </Avatar>
                             <div>
                                <p className="font-medium">{admin.displayName}</p>
                                <p className="text-xs text-muted-foreground font-mono">{admin.uid}</p>
                             </div>
                           </div>
                           
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                     <Button variant="destructive" size="sm" disabled={admin.email === SUPER_ADMIN_EMAIL}>
                                        <ShieldX className="mr-2 h-4 w-4"/> Revoke
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will revoke all admin privileges for <span className="font-bold">{admin.displayName}</span>. They will lose access to the admin panel.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleRemoveAdmin(admin.uid)}>
                                            Yes, Revoke
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ))}
                 </div>
            </div>
            <Separator />
            <div className="space-y-4">
                <h4 className="font-semibold">Credit Control</h4>
                 {!isCreditControlUnlocked ? (
                    <div className="flex items-center gap-2 max-w-sm mx-auto">
                    <Input 
                        type="password"
                        placeholder="Enter credit access password"
                        value={creditPassword}
                        onChange={e => setCreditPassword(e.target.value)}
                    />
                    <Button onClick={handleCreditUnlock}><Unlock className="mr-2 h-4 w-4" /> Unlock</Button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Gift Credits */}
                        <div className="space-y-4 p-4 border rounded-lg">
                            <h3 className="font-semibold flex items-center gap-2"><Gift className="h-5 w-5 text-green-500"/> Gift Credits</h3>
                            <div className="space-y-2">
                                <Label>Select User</Label>
                                <Select onValueChange={setSelectedCreditUser} value={selectedCreditUser}>
                                    <SelectTrigger><SelectValue placeholder="Select a user..." /></SelectTrigger>
                                    <SelectContent>{users.map(u => <SelectItem key={u.uid} value={u.uid}>{u.displayName} ({u.email})</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input type="number" value={giftAmount} onChange={e => setGiftAmount(Number(e.target.value))} />
                            </div>
                            <Button onClick={handleGiftCredits} className="bg-green-600 hover:bg-green-700">Gift Credits</Button>
                        </div>
                        {/* Reset Credits */}
                        <div className="space-y-4 p-4 border rounded-lg">
                            <h3 className="font-semibold flex items-center gap-2"><RefreshCcw className="h-5 w-5 text-destructive"/> Reset Credits</h3>
                            <p className="text-sm text-muted-foreground">This will reset the selected user's credit balance to the default 100.</p>
                            <div className="space-y-2">
                                <Label>Select User</Label>
                                <Select onValueChange={setSelectedCreditUser} value={selectedCreditUser}>
                                    <SelectTrigger><SelectValue placeholder="Select a user..." /></SelectTrigger>
                                    <SelectContent>{users.map(u => <SelectItem key={u.uid} value={u.uid}>{u.displayName} ({u.email})</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">Reset Credits to 100</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently set the selected user's credits to 100. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleResetCredits}>Yes, Reset</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                )}
            </div>
        </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState(user?.fullName || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isLoaded || !user) return null;

  const isSuperAdmin = user.primaryEmailAddress?.emailAddress === SUPER_ADMIN_EMAIL;
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    
    try {
        await user.update({
            fullName: displayName
        });
        toast({ title: "Profile Updated!", description: "Your changes have been saved successfully."});
    } catch (error: any) {
        console.error("Error updating profile:", error);
        toast({ variant: 'destructive', title: "Update Failed", description: error.message });
    } finally {
        setIsSaving(false);
    }
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: "Your User ID has been copied.",
    });
  }
  
  const isSaveDisabled = isSaving || displayName === user.fullName;

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <form onSubmit={handleUpdateProfile} className="lg:col-span-3 grid lg:grid-cols-3 gap-8 items-start">
          <Card className="lg:col-span-2">
              <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your photo, display name, and view your account details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                      <div className="relative group">
                        <Avatar className="h-24 w-24 border-2 border-primary/20">
                          <AvatarImage src={user.imageUrl ?? `https://picsum.photos/150/150?u=${user.id}`} alt={user.fullName ?? 'User'} />
                          <AvatarFallback>{user.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                         <a href={user.publicMetadata.externalProfileUrl as string | undefined ?? '/dashboard/profile'} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs text-center cursor-pointer">
                            Update on Clerk
                        </a>
                      </div>
                      
                      <div className="space-y-2">
                          <h2 className="text-2xl font-bold flex items-center gap-3">
                              {displayName || 'Anonymous User'}
                              {isAdmin && (
                                  <span className="vip-badge">
                                      <Crown className="h-3 w-3" /> VIP
                                  </span>
                              )}
                          </h2>
                          <p className="text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
                      </div>
                  </div>
                  <Separator />
                  <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="displayName">Display Name</Label>
                          <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={isSaving} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input id="email" type="email" defaultValue={user.primaryEmailAddress?.emailAddress || ''} disabled />
                      </div>
                  </div>
                  <div className="space-y-2 pt-2">
                      <Label htmlFor="uid">Your User ID (UID)</Label>
                      <div className="flex items-center gap-2">
                        <Input id="uid" type="text" value={user.id} readOnly className="font-mono bg-muted" />
                        <Button type="button" variant="outline" onClick={() => copyToClipboard(user.id)}>Copy UID</Button>
                      </div>
                  </div>
                  <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={isSaveDisabled}>
                          {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                  </div>
              </CardContent>
          </Card>

          <div className="space-y-8 lg:col-span-1">
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5"/> Account Security</CardTitle>
                      <CardDescription>Your account is managed by Clerk.</CardDescription>
                  </CardHeader>
                   <CardContent>
                     <a href={user.publicMetadata.externalProfileUrl as string | undefined ?? '/dashboard/profile'} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full">Manage Account on Clerk</Button>
                     </a>
                  </CardContent>
              </Card>

              <Card className="border-destructive/50">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-destructive"><Trash2 className="h-5 w-5"/> Delete Account</CardTitle>
                      <CardDescription>Permanently delete your account and all associated data. This action cannot be undone.</CardDescription>
                  </CardHeader>
                  <CardContent>
                       <a href={user.publicMetadata.externalProfileUrl as string | undefined ?? '/dashboard/profile'} target="_blank" rel="noopener noreferrer">
                            <Button variant="destructive" className="w-full">Delete My Account</Button>
                       </a>
                  </CardContent>
              </Card>
          </div>
        </form>

        {isSuperAdmin && <SuperAdminControl />}

      </div>
    </div>
  );
}

    