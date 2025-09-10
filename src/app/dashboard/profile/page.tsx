
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
import { KeyRound, Trash2, Camera, Crown } from 'lucide-react';
import { useAdmin } from '@/hooks/use-admin';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState(user?.fullName || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isLoaded || !user) return null;

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

      </div>
    </div>
  );
}

    