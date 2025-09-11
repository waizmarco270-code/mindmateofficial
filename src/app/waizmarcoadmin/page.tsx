
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdmin } from '@/hooks/use-admin';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Gift, RefreshCcw, Users, ShieldCheck, UserCog, DollarSign, Wallet, ShieldX, MinusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const CREDIT_PASSWORD = "waizcredit";

export default function SuperAdminPanelPage() {
  const { 
    isSuperAdmin, users, toggleUserBlock, makeUserAdmin, removeUserAdmin, giftCreditsToUser, resetUserCredits, addCreditsToUser,
  } = useAdmin();
  const { toast } = useToast();
  
  // State for Credit Management
  const [isCreditUnlocked, setIsCreditUnlocked] = useState(false);
  const [creditPassword, setCreditPassword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState(10);
  
  const handleCreditPasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if(creditPassword === CREDIT_PASSWORD){
        setIsCreditUnlocked(true);
        toast({ title: "Credit Controls Unlocked" });
      } else {
        toast({ variant: 'destructive', title: "Incorrect Password" });
      }
  };

  const handleGiftCredits = async () => {
    if (!selectedUserId || !creditAmount || creditAmount <= 0) {
        toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please select a user and enter a positive credit amount.'});
        return;
    }
    await giftCreditsToUser(selectedUserId, creditAmount);
    toast({ title: 'Success', description: `${creditAmount} credits have been gifted to the user.`});
  };

  const handleDeductCredits = async () => {
     if (!selectedUserId || !creditAmount || creditAmount <= 0) {
        toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please select a user and enter a positive credit amount.'});
        return;
    }
    await addCreditsToUser(selectedUserId, -creditAmount);
    toast({ title: 'Success', description: `${creditAmount} credits have been deducted from the user.`});
  };

  const handleResetCredits = async () => {
     if (!selectedUserId) {
        toast({ variant: 'destructive', title: 'No User Selected', description: 'Please select a user to reset credits.'});
        return;
    }
    await resetUserCredits(selectedUserId);
    toast({ title: 'Success', description: `User's credits have been reset to 100.`});
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
        <p className="text-muted-foreground">Manage user roles and credits.</p>
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
                                <Badge variant={user.isAdmin ? 'default' : 'outline'}>
                                    {user.isAdmin ? 'Admin' : 'User'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                {user.uid !== 'user_32WgV1OikpqTXO9pFApoPRLLarF' && ( // Prevent super admin from losing their own status
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

        {/* Credit Management */}
        <AccordionItem value="credit-management" className="border-b-0">
           <Card>
              <AccordionTrigger className="p-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Credit Management</h3>
                    <p className="text-sm text-muted-foreground text-left">Gift, deduct, or reset credits for any user.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <Card>
                    <CardContent className="pt-6">
                        {!isCreditUnlocked ? (
                            <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-muted/50 border-2 border-dashed">
                                 <Wallet className="h-10 w-10 text-muted-foreground mb-4"/>
                                 <h3 className="font-semibold">Unlock Credit Controls</h3>
                                 <p className="text-sm text-muted-foreground mb-4">Enter the password to manage user credits.</p>
                                 <form onSubmit={handleCreditPasswordSubmit} className="flex items-center gap-2">
                                     <Input 
                                        type="password"
                                        placeholder="Credit Password..."
                                        value={creditPassword}
                                        onChange={(e) => setCreditPassword(e.target.value)}
                                     />
                                     <Button type="submit">Unlock</Button>
                                 </form>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label>Select User</Label>
                                        <Select onValueChange={setSelectedUserId} value={selectedUserId ?? undefined}>
                                            <SelectTrigger><SelectValue placeholder="Select a user..." /></SelectTrigger>
                                            <SelectContent>
                                                {users.filter(u => !u.isBlocked).map(user => (
                                                    <SelectItem key={user.uid} value={user.uid}>
                                                        {user.displayName} ({user.email}) - {user.credits} credits
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                     </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="credit-amount">Amount</Label>
                                        <Input
                                            id="credit-amount"
                                            type="number"
                                            value={creditAmount}
                                            onChange={(e) => setCreditAmount(Number(e.target.value))}
                                            min="0"
                                        />
                                     </div>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-end">
                                    <Button variant="outline" onClick={handleResetCredits} disabled={!selectedUserId}><RefreshCcw /> Reset to 100</Button>
                                    <Button variant="destructive" onClick={handleDeductCredits} disabled={!selectedUserId || creditAmount <= 0}><MinusCircle /> Deduct</Button>
                                    <Button onClick={handleGiftCredits} disabled={!selectedUserId || creditAmount <= 0}><Gift/> Gift</Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
              </AccordionContent>
            </Card>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
