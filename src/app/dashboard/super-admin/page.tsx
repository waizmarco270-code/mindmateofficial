
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdmin, SUPER_ADMIN_UID, type User, GlobalGift, AppSettings, type CreditPack, type StoreItem, MaintenanceTheme } from '@/hooks/use-admin';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Gift, RefreshCcw, Users, ShieldCheck, UserCog, DollarSign, Wallet, ShieldX, MinusCircle, Trash2, AlertTriangle, VenetianMask, Box, UserPlus, CheckCircle, XCircle, Palette, Crown, Code, Trophy, Gamepad2, Send, History, Lock, Unlock, Rocket, KeyRound as KeyRoundIcon, Megaphone, Edit, Swords, CreditCard, UserMinus, ShoppingCart, Upload, Layers, Image as ImageIcon, Wrench } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format, formatDistanceToNow } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogClose, DialogFooter, DialogHeader, DialogTitle, DialogContent } from '@/components/ui/dialog';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';

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
    creditPacks,
    createCreditPack,
    updateCreditPack,
    deleteCreditPack,
    storeItems,
    createStoreItem,
    updateStoreItem,
    deleteStoreItem,
  } = useAdmin();
  const { toast } = useToast();
  
  const [isCreditUnlocked, setIsCreditUnlocked] = useState(false);
  const [creditPassword, setCreditPassword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState(10);
  const [spinAmount, setSpinAmount] = useState(1);
  const [guessAmount, setGuessAmount] = useState(1);
  
  const [popupTarget, setPopupTarget] = useState<'all' | 'single'>('all');
  const [popupSingleUserId, setPopupSingleUserId] = useState<string | null>(null);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupCreditAmount, setPopupCreditAmount] = useState(0);
  const [popupScratchAmount, setPopupScratchAmount] = useState(0);
  const [popupFlipAmount, setPopupFlipAmount] = useState(0);
  const [isSendingPopup, setIsSendingPopup] = useState(false);

  const [devTokenUser, setDevTokenUser] = useState<string | null>(null);
  const [generatedDevToken, setGeneratedDevToken] = useState<string | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  const [isMasterCardDialogOpen, setIsMasterCardDialogOpen] = useState(false);
  const [masterCardUser, setMasterCardUser] = useState<User | null>(null);
  const [masterCardDuration, setMasterCardDuration] = useState(7);

  const [isPackDialogOpen, setIsPackDialogOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<CreditPack | null>(null);
  const [packName, setPackName] = useState('');
  const [packCredits, setPackCredits] = useState(100);
  const [packPrice, setPackPrice] = useState(10);

  const [isStoreItemDialogOpen, setIsStoreItemDialogOpen] = useState(false);
  const [editingStoreItem, setEditingStoreItem] = useState<StoreItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemCost, setItemCost] = useState(100);
  const [itemType, setItemType] = useState<StoreItem['type']>('scratch-card');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemStock, setItemStock] = useState(100);
  const [itemIsFeatured, setItemIsFeatured] = useState(false);

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(appSettings?.isMaintenanceMode || false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(appSettings?.maintenanceMessage || '');
  const [maintenanceTheme, setMaintenanceTheme] = useState<MaintenanceTheme>(appSettings?.maintenanceTheme || 'shiny');
  const [maintenanceStartTime, setMaintenanceStartTime] = useState(appSettings?.maintenanceStartTime || '');
  const [maintenanceEndTime, setMaintenanceEndTime] = useState(appSettings?.maintenanceEndTime || '');
  const [whatsNewMessage, setWhatsNewMessage] = useState(appSettings?.whatsNewMessage || '');

  const handleCreditPasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if(creditPassword === CREDIT_PASSWORD){
        setIsCreditUnlocked(true);
        toast({ title: "Admin Controls Unlocked" });
      } else {
        toast({ variant: 'destructive', title: "Incorrect Password" });
      }
  };

  const handleMaintenanceUpdate = async () => {
      await updateAppSettings({
          isMaintenanceMode,
          maintenanceMessage,
          maintenanceTheme,
          maintenanceStartTime: maintenanceStartTime || undefined,
          maintenanceEndTime: maintenanceEndTime || undefined,
          whatsNewMessage,
          lastMaintenanceId: isMaintenanceMode ? Date.now().toString() : appSettings?.lastMaintenanceId,
      });
      toast({ title: 'Maintenance settings updated!' });
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
                This is a restricted area.
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
        
        {/* User Management */}
        <AccordionItem value="user-management" className="border-b-0">
          <Card>
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">User Management</h3>
                  <p className="text-sm text-muted-foreground text-left">Manage user roles, status, and permissions.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Credits</TableHead>
                                <TableHead>Master Card</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(u => {
                                const isUserSuperAdmin = u.uid === SUPER_ADMIN_UID;
                                const hasMasterCard = u.masterCardExpires && new Date(u.masterCardExpires) > new Date();
                                
                                return (
                                    <TableRow key={u.uid}>
                                        <TableCell className="font-medium whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={u.photoURL}/>
                                                    <AvatarFallback>{u.displayName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                {u.displayName}
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap space-x-1">
                                            {isUserSuperAdmin && <Badge className="bg-red-500 hover:bg-red-600">Dev</Badge>}
                                            {u.isAdmin && <Badge>Admin</Badge>}
                                            {u.isVip && <Badge className="bg-amber-500 hover:bg-amber-600">Elite</Badge>}
                                            {u.isGM && <Badge className="bg-blue-500 hover:bg-blue-600">GM</Badge>}
                                            {u.isChallenger && <Badge className="bg-orange-500 hover:bg-orange-600">Challenger</Badge>}
                                            {u.isCoDev && <Badge className="bg-rose-500 hover:bg-rose-600">Co-Dev</Badge>}
                                            {u.isBlocked && <Badge variant="destructive">Blocked</Badge>}
                                        </TableCell>
                                        <TableCell>{u.credits.toLocaleString()}</TableCell>
                                        <TableCell>
                                            {hasMasterCard ? (
                                                <Badge variant="outline" className="text-green-500 border-green-500">Active</Badge>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">None</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap space-x-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><UserCog className="h-4 w-4 mr-2"/> Manage</Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56">
                                                    <DropdownMenuItem onClick={() => u.isAdmin ? removeUserAdmin(u.uid) : makeUserAdmin(u.uid)}>{u.isAdmin ? <UserMinus className="mr-2 h-4 w-4"/> : <ShieldCheck className="mr-2 h-4 w-4"/>} {u.isAdmin ? 'Remove Admin' : 'Make Admin'}</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => u.isVip ? removeUserVip(u.uid) : makeUserVip(u.uid)}><Crown className="mr-2 h-4 w-4"/> {u.isVip ? 'Remove Elite' : 'Make Elite'}</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => u.isGM ? removeUserGM(u.uid) : makeUserGM(u.uid)}><Gamepad2 className="mr-2 h-4 w-4"/> {u.isGM ? 'Remove GM' : 'Make GM'}</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => u.isChallenger ? removeUserChallenger(u.uid) : makeUserChallenger(u.uid)}><Swords className="mr-2 h-4 w-4"/> {u.isChallenger ? 'Remove Challenger' : 'Make Challenger'}</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => u.isCoDev ? removeUserCoDev(u.uid) : makeUserCoDev(u.uid)}><Code className="mr-2 h-4 w-4"/> {u.isCoDev ? 'Remove Co-Dev' : 'Make Co-Dev'}</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => { setMasterCardUser(u); setIsMasterCardDialogOpen(true); }}><CreditCard className="mr-2 h-4 w-4"/> Grant Master Card</DropdownMenuItem>
                                                    {hasMasterCard && <DropdownMenuItem onClick={() => revokeMasterCard(u.uid)} className="text-destructive"><CreditCard className="mr-2 h-4 w-4"/> Revoke Master Card</DropdownMenuItem>}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive" onClick={() => toggleUserBlock(u.uid, u.isBlocked)}>{u.isBlocked ? <Unlock className="mr-2 h-4 w-4"/> : <Lock className="mr-2 h-4 w-4"/>} {u.isBlocked ? 'Unblock User' : 'Block User'}</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Global Rewards */}
        <AccordionItem value="rewards-management" className="border-b-0">
          <Card>
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <Gift className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Rewards & Credits</h3>
                  <p className="text-sm text-muted-foreground text-left">Grant rewards to users or send global gift popups.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-6">
                {!isCreditUnlocked ? (
                    <form onSubmit={handleCreditPasswordSubmit} className="flex items-center gap-4 max-w-md mx-auto">
                        <Input type="password" value={creditPassword} onChange={e => setCreditPassword(e.target.value)} placeholder="Enter Admin Password"/>
                        <Button type="submit">Unlock Controls</Button>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Direct Grant */}
                        <Card>
                            <CardHeader><CardTitle>Manual Grant</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Select User</Label>
                                    <Select onValueChange={setSelectedUserId}>
                                        <SelectTrigger><SelectValue placeholder="Choose user..."/></SelectTrigger>
                                        <SelectContent>{users.map(u => <SelectItem key={u.uid} value={u.uid}>{u.displayName}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-2">
                                        <Label>Credits</Label>
                                        <Input type="number" value={creditAmount} onChange={e => setCreditAmount(Number(e.target.value))}/>
                                        <Button size="sm" variant="outline" className="w-full" onClick={() => selectedUserId && addCreditsToUser(selectedUserId, creditAmount)} disabled={!selectedUserId}>Grant</Button>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Scratch</Label>
                                        <Input type="number" value={spinAmount} onChange={e => setSpinAmount(Number(e.target.value))}/>
                                        <Button size="sm" variant="outline" className="w-full" onClick={() => selectedUserId && addFreeSpinsToUser(selectedUserId, spinAmount)} disabled={!selectedUserId}>Grant</Button>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Flip</Label>
                                        <Input type="number" value={guessAmount} onChange={e => setGuessAmount(Number(e.target.value))}/>
                                        <Button size="sm" variant="outline" className="w-full" onClick={() => selectedUserId && addFreeGuessesToUser(selectedUserId, guessAmount)} disabled={!selectedUserId}>Grant</Button>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <Label>Global Reward (All Users)</Label>
                                    <div className="flex gap-2">
                                        <Button variant="secondary" className="flex-1" onClick={() => giftCreditsToAllUsers(50)}>+50 Credits All</Button>
                                        <Button variant="secondary" className="flex-1" onClick={() => addSpinsToAllUsers(5)}>+5 Scratch All</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Global Gift Popups */}
                        <Card>
                            <CardHeader><CardTitle>Global Gift Popup</CardTitle><CardDescription>Send a message and rewards that pops up for everyone.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Target</Label>
                                    <Select value={popupTarget} onValueChange={(v: any) => setPopupTarget(v)}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent><SelectItem value="all">All Users</SelectItem><SelectItem value="single">Single User</SelectItem></SelectContent>
                                    </Select>
                                </div>
                                {popupTarget === 'single' && (
                                    <div className="space-y-2">
                                        <Label>User</Label>
                                        <Select onValueChange={setPopupSingleUserId}>
                                            <SelectTrigger><SelectValue placeholder="Choose user..."/></SelectTrigger>
                                            <SelectContent>{users.map(u => <SelectItem key={u.uid} value={u.uid}>{u.displayName}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                )}
                                <div className="space-y-2"><Label>Message</Label><Textarea value={popupMessage} onChange={e => setPopupMessage(e.target.value)} placeholder="Enter popup message..."/></div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-1"><Label className="text-xs">Credits</Label><Input type="number" value={popupCreditAmount} onChange={e => setPopupCreditAmount(Number(e.target.value))}/></div>
                                    <div className="space-y-1"><Label className="text-xs">Scratch</Label><Input type="number" value={popupScratchAmount} onChange={e => setPopupScratchAmount(Number(e.target.value))}/></div>
                                    <div className="space-y-1"><Label className="text-xs">Flip</Label><Input type="number" value={popupFlipAmount} onChange={e => setPopupFlipAmount(Number(e.target.value))}/></div>
                                </div>
                                <Button className="w-full" onClick={() => sendGlobalGift({ message: popupMessage, target: popupTarget === 'all' ? 'all' : popupSingleUserId!, rewards: { credits: popupCreditAmount, scratch: popupScratchAmount, flip: popupFlipAmount } })}>Send Popup</Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
                
                {/* Active/Past Gifts Table */}
                <Card>
                    <CardHeader><CardTitle>Manage Global Gifts</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Message</TableHead><TableHead>Status</TableHead><TableHead>Claimed By</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {globalGifts.map(gift => (
                                    <TableRow key={gift.id}>
                                        <TableCell className="max-w-xs truncate">{gift.message}</TableCell>
                                        <TableCell><Badge variant={gift.isActive ? 'default' : 'secondary'}>{gift.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                                        <TableCell>{gift.claimedBy?.length || 0} users</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {gift.isActive && <Button variant="outline" size="sm" onClick={() => deactivateGift(gift.id)}>Deactivate</Button>}
                                            <Button variant="destructive" size="sm" onClick={() => deleteGlobalGift(gift.id)}><Trash2 className="h-4 w-4"/></Button>
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

        {/* Feature & Store Management */}
        <AccordionItem value="feature-management" className="border-b-0">
          <Card>
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <Wrench className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">App Configuration</h3>
                  <p className="text-sm text-muted-foreground text-left">Configure feature locks, maintenance mode, and store items.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-8">
                {/* Maintenance Mode */}
                <Card>
                    <CardHeader><CardTitle>Maintenance & Updates</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-base">Maintenance Mode</Label>
                                <p className="text-sm text-muted-foreground">Redirect users to a maintenance page.</p>
                            </div>
                            <Switch checked={isMaintenanceMode} onCheckedChange={setIsMaintenanceMode} />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2"><Label>Maintenance Message</Label><Textarea value={maintenanceMessage} onChange={e => setMaintenanceMessage(e.target.value)} /></div>
                            <div className="space-y-2"><Label>What's New Message (Popup)</Label><Textarea value={whatsNewMessage} onChange={e => setWhatsNewMessage(e.target.value)} placeholder="Announce new features..."/></div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2"><Label>Start Time</Label><Input type="datetime-local" value={maintenanceStartTime} onChange={e => setMaintenanceStartTime(e.target.value)}/></div>
                            <div className="space-y-2"><Label>End Time</Label><Input type="datetime-local" value={maintenanceEndTime} onChange={e => setMaintenanceEndTime(e.target.value)}/></div>
                            <div className="space-y-2">
                                <Label>Page Theme</Label>
                                <Select value={maintenanceTheme} onValueChange={(v: any) => setMaintenanceTheme(v)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="shiny">Shiny Purple</SelectItem>
                                        <SelectItem value="forest">Emerald Forest</SelectItem>
                                        <SelectItem value="sunflower">Golden Sunflower</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button className="w-full" onClick={handleMaintenanceUpdate}>Apply Settings</Button>
                    </CardContent>
                </Card>

                {/* Feature Locks */}
                <Card>
                    <CardHeader><CardTitle>Feature Unlock Costs</CardTitle><CardDescription>Set how many credits it costs to unlock specific features.</CardDescription></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Feature Name</TableHead><TableHead>Status</TableHead><TableHead>Unlock Cost</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {lockableFeatures.map(feature => {
                                    const lock = featureLocks?.[feature.id];
                                    const isLocked = lock?.isLocked ?? false;
                                    const cost = lock?.cost ?? feature.defaultCost;
                                    
                                    return (
                                        <TableRow key={feature.id}>
                                            <TableCell className="font-medium">{feature.name}</TableCell>
                                            <TableCell><Badge variant={isLocked ? 'destructive' : 'secondary'}>{isLocked ? 'Locked' : 'Open'}</Badge></TableCell>
                                            <TableCell>{isLocked ? `${cost} Credits` : 'Free'}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap space-x-2">
                                                <Dialog>
                                                    <DialogTrigger asChild><Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-2"/> Set Cost</Button></DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader><DialogTitle>Configure {feature.name}</DialogTitle></DialogHeader>
                                                        <div className="py-4 space-y-4">
                                                            <div className="space-y-2"><Label>Unlock Cost (Credits)</Label><Input type="number" defaultValue={cost} id={`cost-${feature.id}`}/></div>
                                                        </div>
                                                        <DialogFooter><Button onClick={() => { const c = Number((document.getElementById(`cost-${feature.id}`) as HTMLInputElement).value); lockFeature(feature.id, c); }}>Lock with Cost</Button></DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                                {isLocked && <Button variant="ghost" size="sm" onClick={() => unlockFeature(feature.id)}>Set Free</Button>}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Store Management */}
                <div className="grid gap-8 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>Credit Packs</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {creditPacks.map(pack => (
                                <div key={pack.id} className="flex items-center justify-between p-3 rounded-md bg-muted">
                                    <div><p className="font-bold">{pack.name}</p><p className="text-xs text-muted-foreground">{pack.credits} Credits for ₹{pack.price}</p></div>
                                    <div className="space-x-1">
                                        <Button variant="ghost" size="icon" onClick={() => { setEditingPack(pack); setPackName(pack.name); setPackCredits(pack.credits); setPackPrice(pack.price); setIsPackDialogOpen(true); }}><Edit className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteCreditPack(pack.id)}><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                </div>
                            ))}
                            <Button className="w-full" onClick={() => { setEditingPack(null); setPackName(''); setPackCredits(100); setPackPrice(10); setIsPackDialogOpen(true); }}>Add Credit Pack</Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Store Items</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {storeItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded-md bg-muted">
                                    <div><p className="font-bold">{item.name}</p><p className="text-xs text-muted-foreground">{item.cost} Credits | Stock: {item.stock}</p></div>
                                    <div className="space-x-1">
                                        <Button variant="ghost" size="icon" onClick={() => { setEditingStoreItem(item); setItemName(item.name); setItemDescription(item.description); setItemCost(item.cost); setItemType(item.type); setItemQuantity(item.quantity); setItemStock(item.stock); setItemIsFeatured(item.isFeatured); setIsStoreItemDialogOpen(true); }}><Edit className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteStoreItem(item.id)}><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                </div>
                            ))}
                            <Button className="w-full" onClick={() => { setEditingStoreItem(null); setItemName(''); setItemDescription(''); setItemCost(100); setItemType('scratch-card'); setItemQuantity(1); setItemStock(100); setItemIsFeatured(false); setIsStoreItemDialogOpen(true); }}>Add Store Item</Button>
                        </CardContent>
                    </Card>
                </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Global Chat & Leaderboards */}
        <AccordionItem value="data-cleanup" className="border-b-0">
          <Card>
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Data Cleanup</h3>
                  <p className="text-sm text-muted-foreground text-left">Clear history or reset leaderboards.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="outline"><Trash2 className="mr-2 h-4 w-4"/>Clear World Chat</Button></AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Clear All Messages?</AlertDialogTitle><AlertDialogDescription>This will delete every message from the world chat permanently.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={clearGlobalChat}>Delete Everything</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="outline"><RefreshCw className="mr-2 h-4 w-4"/>Reset Quiz Stats</Button></AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Reset Quiz Leaderboard?</AlertDialogTitle><AlertDialogDescription>This resets perfected quizzes and attempts for all users.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={clearQuizLeaderboard}>Reset Now</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="outline"><Clock className="mr-2 h-4 w-4"/>Reset Weekly Time</Button></AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Reset Study Time?</AlertDialogTitle><AlertDialogDescription>Clears weekly time tracker logs for all users.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={resetWeeklyStudyTime}>Reset Now</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="outline"><Gamepad2 className="mr-2 h-4 w-4"/>Reset Game Board</Button></AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Reset Game Scores?</AlertDialogTitle><AlertDialogDescription>Clears high scores for all arcade/puzzle games.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={resetGameZoneLeaderboard}>Reset Now</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

      </Accordion>

      {/* Dialogs */}
      <Dialog open={isMasterCardDialogOpen} onOpenChange={setIsMasterCardDialogOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Grant Master Card</DialogTitle><DialogDescription>Give {masterCardUser?.displayName} unlimited credits for a duration.</DialogDescription></DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2"><Label>Duration (Days)</Label><Input type="number" value={masterCardDuration} onChange={e => setMasterCardDuration(Number(e.target.value))}/></div>
            </div>
            <DialogFooter><Button onClick={() => { masterCardUser && grantMasterCard(masterCardUser.uid, masterCardDuration); setIsMasterCardDialogOpen(false); }}>Grant Card</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPackDialogOpen} onOpenChange={setIsPackDialogOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>{editingPack ? 'Edit' : 'Add'} Credit Pack</DialogTitle></DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2"><Label>Pack Name</Label><Input value={packName} onChange={e => setPackName(e.target.value)}/></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Credits</Label><Input type="number" value={packCredits} onChange={e => setPackCredits(Number(e.target.value))}/></div>
                    <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" value={packPrice} onChange={e => setPackPrice(Number(e.target.value))}/></div>
                </div>
            </div>
            <DialogFooter><Button onClick={() => { 
                const data = { name: packName, credits: packCredits, price: packPrice };
                editingPack ? updateCreditPack(editingPack.id, data) : createCreditPack(data);
                setIsPackDialogOpen(false);
            }}>{editingPack ? 'Save Changes' : 'Create Pack'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isStoreItemDialogOpen} onOpenChange={setIsStoreItemDialogOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>{editingStoreItem ? 'Edit' : 'Add'} Store Item</DialogTitle></DialogHeader>
            <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="space-y-2"><Label>Item Name</Label><Input value={itemName} onChange={e => setItemName(e.target.value)}/></div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={itemDescription} onChange={e => setItemDescription(e.target.value)}/></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Cost (Credits)</Label><Input type="number" value={itemCost} onChange={e => setItemCost(Number(e.target.value))}/></div>
                    <div className="space-y-2"><Label>Type</Label>
                        <Select value={itemType} onValueChange={(v: any) => setItemType(v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="scratch-card">Scratch Card</SelectItem><SelectItem value="card-flip">Card Flip Play</SelectItem></SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Quantity (per purchase)</Label><Input type="number" value={itemQuantity} onChange={e => setItemQuantity(Number(e.target.value))}/></div>
                    <div className="space-y-2"><Label>Stock</Label><Input type="number" value={itemStock} onChange={e => setItemStock(Number(e.target.value))}/></div>
                </div>
                <div className="flex items-center gap-2"><Switch checked={itemIsFeatured} onCheckedChange={setItemIsFeatured} /><Label>Feature this item</Label></div>
            </div>
            <DialogFooter><Button onClick={() => { 
                const data = { name: itemName, description: itemDescription, cost: itemCost, type: itemType, quantity: itemQuantity, stock: itemStock, isFeatured: itemIsFeatured };
                editingStoreItem ? updateStoreItem(editingStoreItem.id, data) : createStoreItem(data);
                setIsStoreItemDialogOpen(false);
            }}>{editingStoreItem ? 'Save Changes' : 'Create Item'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
