'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdmin, SUPER_ADMIN_UID, type User, type AppSettings, type CreditPack, type StoreItem, type MaintenanceTheme } from '@/hooks/use-admin';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Gift, Users, UserCog, DollarSign, ShieldX, Trash2, Box, CreditCard, Send, Lock, KeyRound as KeyRoundIcon, Megaphone, Edit, ShoppingCart, Terminal, Zap, Star } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format, addDays as dateFnsAddDays } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogClose, DialogFooter, DialogHeader, DialogTitle, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

const CREDIT_PASSWORD = "waizcredit";

const defaultDescriptions: Record<string, string> = {
    'scratch-card': 'Try your luck with a Premium Scratch Card! Reveal hidden treasures and win up to 500 MindMate credits instantly. Every card is a new chance to boost your balance!',
    'card-flip': 'Test your intuition in the Card Flip Challenge! Advance through levels to multiply your winnings. A single correct choice could lead to a massive credit jackpot.',
    'penalty-shield': 'The ultimate life-saver for focused students. This artifact automatically absorbs one credit penalty if you are forced to leave a Focus or Pomodoro session early. Study with total peace of mind.',
    'streak-freeze': 'Protect your hard-earned progress! This artifact automatically activates if you miss a day of study, keeping your daily streak intact. Never let a busy day break your chain.',
    'alpha-glow': 'Command attention in the MindMate community! Activating this artifact gives your name a legendary, animated radiant glow in the World Chat for 7 days. Show everyone you are a top performer.',
    'early-bird': 'Unlock the Early Bird identity badge. Let the world know you conquer your goals before sunrise!',
    'night-owl': 'Unlock the Night Owl identity badge. Show your dedication during the quietest hours of the night.',
    'knowledge-knight': 'The Knowledge Knight badge. A mark of an ultimate defender of study discipline.',
};

export default function SuperAdminPanelPage() {
  const { 
    isSuperAdmin, users, toggleUserBlock, makeUserAdmin, removeUserAdmin, 
    makeUserVip, removeUserVip,
    makeUserGM, removeUserGM,
    makeUserCoDev, removeUserCoDev,
    giftCreditsToAllUsers,
    clearGlobalChat, clearQuizLeaderboard,
    resetWeeklyStudyTime,
    resetGameZoneLeaderboard,
    sendGlobalGift,
    globalGifts,
    deactivateGift,
    deleteGlobalGift,
    appSettings,
    updateAppSettings,
    grantMasterCard,
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
  
  const [popupTarget, setPopupTarget] = useState<'all' | 'single'>('all');
  const [popupSingleUserId, setPopupSingleUserId] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupCreditAmount, setPopupCreditAmount] = useState(0);
  const [popupScratchAmount, setPopupScratchAmount] = useState(0);
  const [popupFlipAmount, setPopupFlipAmount] = useState(0);
  const [isSendingPopup, setIsSendingPopup] = useState(false);

  const [isMasterCardDialogOpen, setIsMasterCardDialogOpen] = useState(false);
  const [masterCardUser, setMasterCardUser] = useState<User | null>(null);
  const [masterCardDuration, setMasterCardDuration] = useState(7);

  const [isPackDialogOpen, setIsPackDialogOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<CreditPack | null>(null);
  const [packName, setPackName] = useState('');
  const [packCredits, setPackCredits] = useState(100);
  const [packPrice, setPackPrice] = useState(10);
  const [packBadge, setPackBadge] = useState<CreditPack['badge']>(undefined);

  const [isStoreItemDialogOpen, setIsStoreItemDialogOpen] = useState(false);
  const [editingStoreItem, setEditingStoreItem] = useState<StoreItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemCost, setItemCost] = useState(100);
  const [itemPrice, setItemPrice] = useState(10);
  const [itemPaymentType, setItemPaymentType] = useState<'credits' | 'money'>('credits');
  const [itemType, setItemType] = useState<StoreItem['type']>('scratch-card');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemStock, setItemStock] = useState(100);
  const [itemIsFeatured, setItemIsFeatured] = useState(false);
  const [itemBadge, setItemBadge] = useState<StoreItem['badge']>(undefined);

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(appSettings?.isMaintenanceMode || false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(appSettings?.maintenanceMessage || '');
  const [maintenanceTheme, setMaintenanceTheme] = useState<MaintenanceTheme>(appSettings?.maintenanceTheme || 'shiny');
  const [whatsNewMessage, setWhatsNewMessage] = useState(appSettings?.whatsNewMessage || '');

  useEffect(() => {
    if (appSettings) {
        setIsMaintenanceMode(appSettings.isMaintenanceMode || false);
        setMaintenanceMessage(appSettings.maintenanceMessage || '');
        setMaintenanceTheme(appSettings.maintenanceTheme || 'shiny');
        setWhatsNewMessage(appSettings.whatsNewMessage || '');
    }
  }, [appSettings]);

  const handleTypeChange = (type: StoreItem['type']) => {
    setItemType(type);
    const isCurrentDescDefault = Object.values(defaultDescriptions).includes(itemDescription);
    if (!itemDescription || isCurrentDescDefault) {
        setItemDescription(defaultDescriptions[type] || '');
    }
  };

  const handleCreditPasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if(creditPassword === CREDIT_PASSWORD){
        setIsCreditUnlocked(true);
        toast({ title: "System Overrides Unlocked" });
      } else {
        toast({ variant: 'destructive', title: "Incorrect Password" });
      }
  };

  const handleMaintenanceUpdate = async () => {
      await updateAppSettings({
          isMaintenanceMode,
          maintenanceMessage,
          maintenanceTheme,
          whatsNewMessage,
          lastMaintenanceId: isMaintenanceMode ? Date.now().toString() : appSettings?.lastMaintenanceId,
      });
      toast({ title: 'App Configuration Updated!' });
  };

  const handleSendGlobalGift = async () => {
      if (!popupMessage.trim()) return;
      setIsSendingPopup(true);
      try {
          await sendGlobalGift({
              message: popupMessage,
              target: popupTarget === 'all' ? 'all' : popupSingleUserId,
              rewards: {
                  credits: popupCreditAmount,
                  scratch: popupScratchAmount,
                  flip: popupFlipAmount
              }
          });
          toast({ title: "Global Gift Sent!" });
          setPopupMessage('');
          setPopupCreditAmount(0);
          setPopupScratchAmount(0);
          setPopupFlipAmount(0);
      } finally {
          setIsSendingPopup(false);
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
            <CardDescription>This is a restricted area.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Controls</h1>
        <p className="text-muted-foreground">Master controls for roles, monetization, and system state.</p>
      </div>

      <Accordion type="multiple" defaultValue={['user-management']} className="w-full space-y-4">
        
        {/* 1. User Management */}
        <AccordionItem value="user-management" className="border-b-0">
          <Card>
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">User Authority</h3>
                  <p className="text-sm text-muted-foreground text-left">Manage roles, bans, and Master Cards.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Badges</TableHead>
                                <TableHead>Credits</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
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
                                                    <AvatarFallback>{u.displayName?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold">{u.displayName}</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono">{u.uid}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap space-x-1">
                                            {isUserSuperAdmin && <Badge className="bg-red-500 text-[10px]">Dev</Badge>}
                                            {u.isAdmin && <Badge className="text-[10px]">Admin</Badge>}
                                            {u.isVip && <Badge className="bg-amber-500 text-[10px]">Elite</Badge>}
                                            {u.isGM && <Badge className="bg-blue-500 text-[10px]">GM</Badge>}
                                            {u.isCoDev && <Badge className="bg-rose-500 text-[10px]">Co-Dev</Badge>}
                                            {hasMasterCard && <Badge variant="outline" className="text-green-500 border-green-500 text-[10px]">Master</Badge>}
                                        </TableCell>
                                        <TableCell className="font-bold">{u.credits?.toLocaleString()}</TableCell>
                                        <TableCell>
                                            {u.isBlocked ? <Badge variant="destructive">Blocked</Badge> : <Badge variant="secondary">Active</Badge>}
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Manage <UserCog className="h-4 w-4 ml-2"/></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56">
                                                    <DropdownMenuItem onClick={() => u.isAdmin ? removeUserAdmin(u.uid) : makeUserAdmin(u.uid)}>{u.isAdmin ? "Remove Admin" : "Make Admin"}</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => u.isVip ? removeUserVip(u.uid) : makeUserVip(u.uid)}>{u.isVip ? "Remove Elite" : "Make Elite"}</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => u.isGM ? removeUserGM(u.uid) : makeUserGM(u.uid)}>{u.isGM ? "Remove GM" : "Make GM"}</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => u.isCoDev ? removeUserCoDev(u.uid) : makeUserCoDev(u.uid)}>{u.isCoDev ? "Remove Co-Dev" : "Make Co-Dev"}</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => { setMasterCardUser(u); setIsMasterCardDialogOpen(true); }}><CreditCard className="mr-2 h-4 w-4"/> Grant Master Card</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive" onClick={() => toggleUserBlock(u.uid, u.isBlocked)}>{u.isBlocked ? "Unblock" : "Block User"}</DropdownMenuItem>
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

        {/* 2. App Configuration */}
        <AccordionItem value="app-config" className="border-b-0">
          <Card>
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <Terminal className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">App Configuration</h3>
                  <p className="text-sm text-muted-foreground text-left">Version control and Maintenance Mode.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-amber-500/30">
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Terminal/> Maintenance Mode</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                <Label>Enable Global Maintenance</Label>
                                <Switch checked={isMaintenanceMode} onCheckedChange={setIsMaintenanceMode} />
                            </div>
                            <div className="space-y-2">
                                <Label>Maintenance Message</Label>
                                <Textarea value={maintenanceMessage} onChange={e => setMaintenanceMessage(e.target.value)} placeholder="Why is the app down?" />
                            </div>
                            <div className="space-y-2">
                                <Label>Banner Theme</Label>
                                <Select value={maintenanceTheme} onValueChange={(v: any) => setMaintenanceTheme(v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="shiny">Shiny Purple</SelectItem>
                                        <SelectItem value="forest">Forest Green</SelectItem>
                                        <SelectItem value="sunflower">Sunflower Yellow</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-primary/30">
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Megaphone/> What's New Popup</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Change Log Message</Label>
                                <Textarea value={whatsNewMessage} onChange={e => setWhatsNewMessage(e.target.value)} placeholder="List the new features..." className="min-h-[150px]" />
                            </div>
                            <p className="text-[10px] text-muted-foreground italic">Updating this will show a popup to all users.</p>
                        </CardContent>
                    </Card>
                </div>
                <Button onClick={handleMaintenanceUpdate} className="w-full">Save System Configuration</Button>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* 3. Global Gifts */}
        <AccordionItem value="global-gifts" className="border-b-0">
          <Card>
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <Gift className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Global Gifts & Alerts</h3>
                  <p className="text-sm text-muted-foreground text-left">Send rewards or messages to everyone.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Create Gift/Announcement</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Target</Label>
                                <Select value={popupTarget} onValueChange={(v: any) => setPopupTarget(v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Every Legend (All Users)</SelectItem>
                                        <SelectItem value="single">Specific ID</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {popupTarget === 'single' && <Input value={popupSingleUserId} onChange={e => setPopupSingleUserId(e.target.value)} placeholder="Enter User UID" />}
                            <div className="space-y-2">
                                <Label>Message</Label>
                                <Input value={popupMessage} onChange={e => setPopupMessage(e.target.value)} placeholder="Happy Studying!" />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1"><Label className="text-[10px]">Credits</Label><Input type="number" value={popupCreditAmount} onChange={e => setPopupCreditAmount(Number(e.target.value))} /></div>
                                <div className="space-y-1"><Label className="text-[10px]">Scratch</Label><Input type="number" value={popupScratchAmount} onChange={e => setPopupScratchAmount(Number(e.target.value))} /></div>
                                <div className="space-y-1"><Label className="text-[10px]">Flip</Label><Input type="number" value={popupFlipAmount} onChange={e => setPopupFlipAmount(Number(e.target.value))} /></div>
                            </div>
                            <Button onClick={handleSendGlobalGift} disabled={isSendingPopup || !popupMessage} className="w-full">
                                {isSendingPopup ? <Loader2 className="animate-spin" /> : <Send className="mr-2 h-4 w-4"/>} Send Gift
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Past Gifts</CardTitle></CardHeader>
                        <CardContent>
                            <ScrollArea className="h-64">
                                <div className="space-y-2">
                                    {globalGifts.map(gift => (
                                        <div key={gift.id} className="p-3 border rounded-lg bg-muted/50 text-xs flex items-center justify-between">
                                            <div className="flex-1 truncate pr-2">
                                                <p className="font-bold">{gift.message}</p>
                                                <p className="text-muted-foreground">Target: {gift.target}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                {gift.isActive && <Button variant="outline" size="sm" onClick={() => deactivateGift(gift.id)}>Stop</Button>}
                                                <Button variant="destructive" size="sm" onClick={() => deleteGlobalGift(gift.id)}><Trash2 className="h-3 w-3"/></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* 4. Store Management */}
        <AccordionItem value="feature-management" className="border-b-0">
          <Card>
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <ShoppingCart className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Store & Artifacts</h3>
                  <p className="text-sm text-muted-foreground text-left">Manage packs, items, and inventory.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Credit Packs</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {creditPacks.map(pack => (
                                <div key={pack.id} className="flex items-center justify-between p-3 rounded-md bg-muted">
                                    <div><p className="font-bold text-sm">{pack.name}</p><p className="text-[10px] text-muted-foreground">{pack.credits} Credits @ ₹{pack.price}</p></div>
                                    <div className="space-x-1">
                                        <Button variant="ghost" size="icon" onClick={() => { setEditingPack(pack); setPackName(pack.name); setPackCredits(pack.credits); setPackPrice(pack.price); setPackBadge(pack.badge); setIsPackDialogOpen(true); }}><Edit className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteCreditPack(pack.id)}><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                </div>
                            ))}
                            <Button className="w-full" variant="outline" onClick={() => { setEditingPack(null); setPackName(''); setPackCredits(100); setPackPrice(10); setPackBadge(undefined); setIsPackDialogOpen(true); }}>Add Credit Pack</Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Inventory Items</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <ScrollArea className="h-64">
                                <div className="space-y-2">
                                    {storeItems.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-3 rounded-md bg-muted">
                                            <div>
                                                <p className="font-bold text-sm">{item.name}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {item.paymentType === 'credits' ? `${item.cost} Credits` : `₹${item.price}`} | Stock: {item.stock}
                                                </p>
                                            </div>
                                            <div className="space-x-1">
                                                <Button variant="ghost" size="icon" onClick={() => { 
                                                    setEditingStoreItem(item); 
                                                    setItemName(item.name); 
                                                    setItemDescription(item.description); 
                                                    setItemCost(item.cost); 
                                                    setItemPrice(item.price || 10);
                                                    setItemPaymentType(item.paymentType || 'credits');
                                                    setItemType(item.type); 
                                                    setItemQuantity(item.quantity); 
                                                    setItemStock(item.stock); 
                                                    setItemIsFeatured(item.isFeatured); 
                                                    setItemBadge(item.badge); 
                                                    setIsStoreItemDialogOpen(true); 
                                                }}><Edit className="h-4 w-4"/></Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteStoreItem(item.id)}><Trash2 className="h-4 w-4"/></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                            <Button className="w-full" variant="outline" onClick={() => { 
                                setEditingStoreItem(null); 
                                setItemName(''); 
                                setItemDescription(''); 
                                setItemCost(100); 
                                setItemPrice(10);
                                setItemPaymentType('credits');
                                setItemType('scratch-card'); 
                                setItemQuantity(1); 
                                setItemStock(100); 
                                setItemIsFeatured(false); 
                                setItemBadge(undefined); 
                                setIsStoreItemDialogOpen(true); 
                            }}>Add New Store Item</Button>
                        </CardContent>
                    </Card>
                </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* 5. System Overrides */}
        <AccordionItem value="overrides" className="border-b-0">
          <Card>
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-red-500" />
                <div>
                  <h3 className="text-lg font-semibold">System Overrides</h3>
                  <p className="text-sm text-muted-foreground text-left">Emergency manual adjustments.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                {!isCreditUnlocked ? (
                    <form onSubmit={handleCreditPasswordSubmit} className="flex flex-col items-center gap-4 py-10 border-2 border-dashed rounded-xl">
                        <div className="p-4 bg-red-500/10 rounded-full"><KeyRoundIcon className="h-10 w-10 text-red-500"/></div>
                        <div className="text-center"><h4 className="font-bold">Restricted Area</h4><p className="text-xs text-muted-foreground">Enter Password to continue.</p></div>
                        <input type="password" value={creditPassword} onChange={e => setCreditPassword(e.target.value)} className="max-w-[200px] text-center border-2 rounded p-2" placeholder="••••••••" />
                        <Button type="submit">Unlock System</Button>
                    </form>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-red-500/20">
                            <CardHeader><CardTitle className="text-sm">Manual Credit Injection</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2"><Label>Amount to Gift EVERYONE</Label><Input type="number" id="gift-all-credits" defaultValue={100} /></div>
                                <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => {
                                    const amt = Number((document.getElementById('gift-all-credits') as HTMLInputElement).value);
                                    giftCreditsToAllUsers(amt);
                                    toast({ title: "Operation Complete", description: `Gifted ${amt} credits to all.` });
                                }}>Gift All Credits</Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="text-sm">System Cleanup</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-2 gap-2">
                                <Button variant="outline" className="text-xs" onClick={clearGlobalChat}>Clear Global Chat</Button>
                                <Button variant="outline" className="text-xs" onClick={clearQuizLeaderboard}>Reset Quizzes</Button>
                                <Button variant="outline" className="text-xs" onClick={resetWeeklyStudyTime}>Reset Study Log</Button>
                                <Button variant="outline" className="text-xs" onClick={resetGameZoneLeaderboard}>Reset Games</Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </AccordionContent>
          </Card>
        </AccordionItem>

      </Accordion>

      {/* MODALS */}
      <Dialog open={isMasterCardDialogOpen} onOpenChange={setIsMasterCardDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Grant Master Card</DialogTitle>
                <DialogDescription>Give {masterCardUser?.displayName} unlimited credits bypass for a duration.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label>Duration (Days)</Label>
                    <Select value={String(masterCardDuration)} onValueChange={v => setMasterCardDuration(Number(v))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1 Day Trial</SelectItem>
                            <SelectItem value="7">7 Days (Weekly)</SelectItem>
                            <SelectItem value="30">30 Days (Monthly)</SelectItem>
                            <SelectItem value="365">365 Days (Yearly)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={() => { if(masterCardUser) grantMasterCard(masterCardUser.uid, masterCardDuration); setIsMasterCardDialogOpen(false); toast({ title: "Master Card Granted!" }); }}>Activate Master Card</Button>
            </DialogFooter>
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
                <div className="space-y-2">
                    <Label>Value Badge</Label>
                    <Select value={packBadge || 'none'} onValueChange={(v: any) => setPackBadge(v === 'none' ? undefined : v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">No Badge</SelectItem>
                            <SelectItem value="popular">Popular</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="recommended">Recommended</SelectItem>
                            <SelectItem value="limited">Limited Edition</SelectItem>
                            <SelectItem value="hot">Hot Deal</SelectItem>
                            <SelectItem value="best-seller">Best Seller</SelectItem>
                            <SelectItem value="jackpot">Jackpot</SelectItem>
                            <SelectItem value="legendary">Legendary</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter><Button onClick={() => { 
                const data = { name: packName, credits: packCredits, price: packPrice, badge: packBadge };
                editingPack ? updateCreditPack(editingPack.id, data) : createCreditPack(data);
                setIsPackDialogOpen(false);
            }}>{editingPack ? 'Save Changes' : 'Create Pack'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isStoreItemDialogOpen} onOpenChange={setIsStoreItemDialogOpen}>
        <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editingStoreItem ? 'Edit' : 'Add'} Store Item</DialogTitle></DialogHeader>
            <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="space-y-2"><Label>Item Name</Label><Input value={itemName} onChange={e => setItemName(e.target.value)}/></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Type</Label>
                        <Select value={itemType} onValueChange={(v: any) => handleTypeChange(v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="scratch-card">Scratch Card</SelectItem>
                                <SelectItem value="card-flip">Card Flip Play</SelectItem>
                                <SelectItem value="penalty-shield">Penalty Shield (Artifact)</SelectItem>
                                <SelectItem value="streak-freeze">Streak Freeze (Artifact)</SelectItem>
                                <SelectItem value="alpha-glow">Alpha Glow (Artifact)</SelectItem>
                                <SelectItem value="early-bird">Early Bird (Badge)</SelectItem>
                                <SelectItem value="night-owl">Night Owl (Badge)</SelectItem>
                                <SelectItem value="knowledge-knight">Knowledge Knight (Badge)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2"><Label>Stock</Label><Input type="number" value={itemStock} onChange={e => setItemStock(Number(e.target.value))}/></div>
                </div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={itemDescription} onChange={e => setItemDescription(e.target.value)} className="min-h-[100px] text-xs"/></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Payment Type</Label>
                        <Select value={itemPaymentType} onValueChange={(v: any) => setItemPaymentType(v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="credits">Credits</SelectItem><SelectItem value="money">Money</SelectItem></SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        {itemPaymentType === 'credits' ? (
                            <><Label>Cost (Credits)</Label><Input type="number" value={itemCost} onChange={e => setItemCost(Number(e.target.value))}/></>
                        ) : (
                            <><Label>Price (₹)</Label><Input type="number" value={itemPrice} onChange={e => setItemPrice(Number(e.target.value))}/></>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={itemQuantity} onChange={e => setItemQuantity(Number(e.target.value))}/></div>
                    <div className="space-y-2">
                        <Label>Value Badge</Label>
                        <Select value={itemBadge || 'none'} onValueChange={(v: any) => setItemBadge(v === 'none' ? undefined : v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No Badge</SelectItem>
                                <SelectItem value="buy-or-regret">Buy or Regret</SelectItem>
                                <SelectItem value="rare">Rare</SelectItem>
                                <SelectItem value="worth-it">Worth It</SelectItem>
                                <SelectItem value="loot-deal">Loot Deal</SelectItem>
                                <SelectItem value="dev-choice">Dev Choice</SelectItem>
                                <SelectItem value="legendary">Legendary</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center gap-2"><Switch checked={itemIsFeatured} onCheckedChange={setItemIsFeatured} /><Label>Featured Item</Label></div>
            </div>
            <DialogFooter><Button onClick={() => { 
                const data = { name: itemName, description: itemDescription, cost: itemCost, price: itemPrice, paymentType: itemPaymentType, type: itemType, quantity: itemQuantity, stock: itemStock, isFeatured: itemIsFeatured, badge: itemBadge };
                editingStoreItem ? updateStoreItem(editingStoreItem.id, data) : createStoreItem(data);
                setIsStoreItemDialogOpen(false);
            }}>{editingStoreItem ? 'Save Changes' : 'Create Item'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}