
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
import { Gift, RefreshCcw, Users, ShieldCheck, UserCog, DollarSign, Wallet, ShieldX, MinusCircle, Trash2, AlertTriangle, VenetianMask, Box, UserPlus, CheckCircle, XCircle, Palette, Crown, Code, Trophy, Gamepad2, Send, History, Lock, Unlock, Rocket, KeyRound as KeyRoundIcon, Megaphone, Edit, Swords, CreditCard, UserMinus, ShoppingCart, Upload, Layers, Image as ImageIcon, Wrench, Avatar, AvatarImage, AvatarFallback } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format, formatDistanceToNow } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogClose, DialogFooter, DialogHeader, DialogTitle, DialogContent } from '@/components/ui/dialog';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

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
                                                    <AvatarFallback>{u.displayName?.charAt(0)}</AvatarFallback>
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
                                        <TableCell>{u.credits?.toLocaleString()}</TableCell>
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

        {/* FEATURE & STORE MANAGEMENT */}
        <AccordionItem value="feature-management" className="border-b-0">
          <Card>
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <ShoppingCart className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Store & Artifact Management</h3>
                  <p className="text-sm text-muted-foreground text-left">Manage packs, artifacts, and app configurations.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-8">
                {/* Store Management */}
                <div className="grid gap-8 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>Credit Packs</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {creditPacks.map(pack => (
                                <div key={pack.id} className="flex items-center justify-between p-3 rounded-md bg-muted">
                                    <div><p className="font-bold">{pack.name} {pack.badge && <Badge variant="outline" className="ml-2 uppercase text-[10px]">{pack.badge}</Badge>}</p><p className="text-xs text-muted-foreground">{pack.credits} Credits for ₹{pack.price}</p></div>
                                    <div className="space-x-1">
                                        <Button variant="ghost" size="icon" onClick={() => { setEditingPack(pack); setPackName(pack.name); setPackCredits(pack.credits); setPackPrice(pack.price); setPackBadge(pack.badge); setIsPackDialogOpen(true); }}><Edit className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteCreditPack(pack.id)}><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                </div>
                            ))}
                            <Button className="w-full" onClick={() => { setEditingPack(null); setPackName(''); setPackCredits(100); setPackPrice(10); setPackBadge(undefined); setIsPackDialogOpen(true); }}>Add Credit Pack</Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Redeemable Items (Artifacts)</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {storeItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded-md bg-muted">
                                    <div>
                                        <p className="font-bold">{item.name} {item.isFeatured && <span className="text-xs text-primary">(Featured)</span>}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.paymentType === 'credits' ? `${item.cost} Credits` : `₹${item.price}`} | Stock: {item.stock} | Type: {item.type}
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
                            <Button className="w-full" onClick={() => { 
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
                            }}>Add Store Item</Button>
                        </CardContent>
                    </Card>
                </div>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>

      {/* DIALOGS */}
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
                    <Label>Value Badge (Optional)</Label>
                    <Select value={packBadge || 'none'} onValueChange={(v: any) => setPackBadge(v === 'none' ? undefined : v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">No Badge</SelectItem>
                            <SelectItem value="popular">Popular</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="recommended">Recommended</SelectItem>
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
        <DialogContent>
            <DialogHeader><DialogTitle>{editingStoreItem ? 'Edit' : 'Add'} Store Item</DialogTitle></DialogHeader>
            <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="space-y-2"><Label>Item Name</Label><Input value={itemName} onChange={e => setItemName(e.target.value)}/></div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={itemDescription} onChange={e => setItemDescription(e.target.value)}/></div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Payment Type</Label>
                        <Select value={itemPaymentType} onValueChange={(v: any) => setItemPaymentType(v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="credits">Credits</SelectItem>
                                <SelectItem value="money">Money (Razorpay)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        {itemPaymentType === 'credits' ? (
                            <>
                                <Label>Cost (Credits)</Label>
                                <Input type="number" value={itemCost} onChange={e => setItemCost(Number(e.target.value))}/>
                            </>
                        ) : (
                            <>
                                <Label>Price (₹)</Label>
                                <Input type="number" value={itemPrice} onChange={e => setItemPrice(Number(e.target.value))}/>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Type</Label>
                        <Select value={itemType} onValueChange={(v: any) => setItemType(v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="scratch-card">Scratch Card</SelectItem>
                                <SelectItem value="card-flip">Card Flip Play</SelectItem>
                                <SelectItem value="penalty-shield">Penalty Shield (Artifact)</SelectItem>
                                <SelectItem value="streak-freeze">Streak Freeze (Artifact)</SelectItem>
                                <SelectItem value="alpha-glow">Alpha Glow (Artifact)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2"><Label>Stock</Label><Input type="number" value={itemStock} onChange={e => setItemStock(Number(e.target.value))}/></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Quantity (per purchase)</Label><Input type="number" value={itemQuantity} onChange={e => setItemQuantity(Number(e.target.value))}/></div>
                    <div className="space-y-2">
                        <Label>Value Badge (Optional)</Label>
                        <Select value={itemBadge || 'none'} onValueChange={(v: any) => setItemBadge(v === 'none' ? undefined : v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No Badge</SelectItem>
                                <SelectItem value="popular">Popular</SelectItem>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="recommended">Recommended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center gap-2"><Switch checked={itemIsFeatured} onCheckedChange={setItemIsFeatured} /><Label>Feature this item</Label></div>
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
