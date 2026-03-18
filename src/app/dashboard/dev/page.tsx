
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdmin, SUPER_ADMIN_UID, type CreditPack, type StoreItem } from '@/hooks/use-admin';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Gift, RefreshCcw, Users, ShieldCheck, UserCog, DollarSign, Wallet, ShieldX, MinusCircle, Trash2, AlertTriangle, VenetianMask, Box, UserPlus, CheckCircle, XCircle, Palette, Crown, Code, Trophy, Gamepad2, Send, History, Lock, Unlock, Rocket, KeyRound as KeyRoundIcon, Megaphone, Edit, Swords, CreditCard, UserMinus, ShoppingCart, Upload, Layers, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { Dialog, DialogClose, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogContent } from '@/components/ui/dialog';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

const defaultDescriptions: Record<string, string> = {
    'scratch-card': 'Try your luck with a Premium Scratch Card! Reveal hidden treasures and win up to 500 MindMate credits instantly. Every card is a new chance to boost your balance!',
    'card-flip': 'Test your intuition in the Card Flip Challenge! Advance through levels to multiply your winnings. A single correct choice could lead to a massive credit jackpot.',
    'penalty-shield': 'The ultimate life-saver for focused students. This artifact automatically absorbs one credit penalty if you are forced to leave a Focus or Pomodoro session early. Study with total peace of mind.',
    'streak-freeze': 'Protect your hard-earned progress! This artifact automatically activates if you miss a day of study, keeping your daily streak intact. Never let a busy day break your chain.',
    'alpha-glow': 'Command attention in the MindMate community! Activating this artifact gives your name a legendary, animated radiant glow in the World Chat for 7 days. Show everyone you are a top performer.',
    'early-bird': 'A legendary badge for the early morning warriors. Show the world you conquer your goals while others are still dreaming.',
    'night-owl': 'A prestigious badge for the midnight grinders. Let everyone know you own the night and work when the world is quiet.',
    'knowledge-knight': 'A heavy-duty identity badge for those who defend their study schedule at any cost. A true mark of a MindMate protector.',
};

export default function PaymentsPanelPage() {
    const { 
        isSuperAdmin, isCoDev,
        appSettings, updateAppSettings,
        creditPacks, createCreditPack, updateCreditPack, deleteCreditPack,
        storeItems, createStoreItem, updateStoreItem, deleteStoreItem,
        loading
    } = useAdmin();
    const { toast } = useToast();
  
    // State for Credit Packs
    const [isPackDialogOpen, setIsPackDialogOpen] = useState(false);
    const [editingPack, setEditingPack] = useState<CreditPack | null>(null);
    const [packName, setPackName] = useState('');
    const [packCredits, setPackCredits] = useState(100);
    const [packPrice, setPackPrice] = useState(10);
    const [packBadge, setPackBadge] = useState<CreditPack['badge']>(undefined);

    // State for Store Items
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

    const handleTypeChange = (type: StoreItem['type']) => {
        setItemType(type);
        const isCurrentDescDefault = Object.values(defaultDescriptions).includes(itemDescription);
        if (!itemDescription || isCurrentDescDefault) {
            setItemDescription(defaultDescriptions[type] || '');
        }
    };

    const openPackDialog = (pack: CreditPack | null) => {
        if (pack) {
            setEditingPack(pack);
            setPackName(pack.name);
            setPackCredits(pack.credits);
            setPackPrice(pack.price);
            setPackBadge(pack.badge);
        } else {
            setEditingPack(null);
            setPackName('');
            setPackCredits(100);
            setPackPrice(10);
            setPackBadge(undefined);
        }
        setIsPackDialogOpen(true);
    };

    const handleSavePack = async () => {
        if (!createCreditPack || !updateCreditPack) return;
        if (!packName.trim() || packCredits <= 0 || packPrice < 0) {
            toast({ variant: 'destructive', title: 'Invalid input for credit pack.' });
            return;
        }
        
        const packData = { name: packName, credits: packCredits, price: packPrice, badge: packBadge };

        try {
            if (editingPack) {
                await updateCreditPack(editingPack.id, packData);
                toast({ title: 'Credit Pack Updated' });
            } else {
                await createCreditPack(packData);
                toast({ title: 'Credit Pack Created' });
            }
            setIsPackDialogOpen(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Operation Failed', description: error.message });
        }
    };
    
    const openStoreItemDialog = (item: StoreItem | null) => {
        if (item) {
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
        } else {
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
        }
        setIsStoreItemDialogOpen(true);
    }

    const handleSaveStoreItem = async () => {
        if (!createStoreItem || !updateStoreItem) return;
        if (!itemName.trim() || (itemPaymentType === 'credits' && itemCost <= 0) || (itemPaymentType === 'money' && itemPrice <= 0) || itemQuantity <= 0) {
            toast({ variant: 'destructive', title: 'Invalid input for store item.'});
            return;
        }

        const itemData = {
            name: itemName,
            description: itemDescription,
            cost: itemCost,
            price: itemPrice,
            paymentType: itemPaymentType,
            type: itemType,
            quantity: itemQuantity,
            stock: itemStock,
            isFeatured: itemIsFeatured,
            badge: itemBadge,
        };

        try {
            if (editingStoreItem) {
                await updateStoreItem(editingStoreItem.id, itemData);
                toast({ title: "Store Item Updated" });
            } else {
                await createStoreItem(itemData);
                toast({ title: "Store Item Created" });
            }
            setIsStoreItemDialogOpen(false);
        } catch(error: any) {
             toast({ variant: 'destructive', title: 'Operation Failed', description: error.message });
        }
    };

    if (!isSuperAdmin && !isCoDev) {
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments Panel</h1>
        <p className="text-muted-foreground">Manage credit packs and store items. Payments are automated via Razorpay.</p>
      </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Credit Packs</CardTitle>
                    <CardDescription>Manage packs for buying credits with real money.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {creditPacks && creditPacks.map(pack => (
                            <div key={pack.id} className="flex items-center p-3 rounded-md bg-muted">
                                <div className="flex-1">
                                    <p className="font-semibold">{pack.name} {pack.badge && <Badge variant="outline" className="ml-2 uppercase text-[10px]">{pack.badge}</Badge>}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {pack.credits.toLocaleString()} Credits for ₹{pack.price}
                                    </p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => openPackDialog(pack)}><Edit className="h-4 w-4"/></Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete this pack?</AlertDialogTitle>
                                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteCreditPack && deleteCreditPack(pack.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
                    </div>
                     <Dialog open={isPackDialogOpen} onOpenChange={setIsPackDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full" onClick={() => openPackDialog(null)}>Add New Credit Pack</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingPack ? 'Edit' : 'Add'} Credit Pack</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pack-name">Pack Name</Label>
                                    <Input id="pack-name" value={packName} onChange={e => setPackName(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="pack-credits">Credits</Label>
                                        <Input id="pack-credits" type="number" value={packCredits} onChange={e => setPackCredits(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pack-price">Price (₹)</Label>
                                        <Input id="pack-price" type="number" value={packPrice} onChange={e => setPackPrice(Number(e.target.value))} />
                                    </div>
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
                                            <SelectItem value="exclusive">Exclusive</SelectItem>
                                            <SelectItem value="limited">Limited Edition</SelectItem>
                                            <SelectItem value="hot">Hot Deal</SelectItem>
                                            <SelectItem value="best-seller">Best Seller</SelectItem>
                                            <SelectItem value="jackpot">Jackpot</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                <Button onClick={handleSavePack}>{editingPack ? 'Save Changes' : 'Create Pack'}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Redeemable Items</CardTitle>
                    <CardDescription>Manage items users can buy with credits or money.</CardDescription>
                </CardHeader>
                    <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {storeItems && storeItems.map(item => (
                            <div key={item.id} className="flex items-center p-3 rounded-md bg-muted">
                                <div className="flex-1">
                                    <p className="font-semibold">{item.name} {item.isFeatured && <span className="text-xs text-primary">(Featured)</span>}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.paymentType === 'credits' ? `${item.cost} Credits` : `₹${item.price}`} | Stock: {item.stock} | Type: {item.type}
                                    </p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => openStoreItemDialog(item)}><Edit className="h-4 w-4"/></Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Delete this item?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteStoreItem && deleteStoreItem(item.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
                    </div>
                     <Dialog open={isStoreItemDialogOpen} onOpenChange={setIsStoreItemDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full" onClick={() => openStoreItemDialog(null)}>Add New Item</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingStoreItem ? 'Edit' : 'Add'} Store Item</DialogTitle>
                            </DialogHeader>
                                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2 text-left">
                                <div className="space-y-2">
                                    <Label htmlFor="item-name">Item Name</Label>
                                    <Input id="item-name" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="e.g. Penalty Shield" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="item-type">Item Type</Label>
                                        <Select value={itemType} onValueChange={(v: StoreItem['type']) => handleTypeChange(v)}>
                                            <SelectTrigger id="item-type"><SelectValue/></SelectTrigger>
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
                                    <div className="space-y-2">
                                        <Label htmlFor="item-stock">Stock</Label>
                                        <Input id="item-stock" type="number" value={itemStock} onChange={e => setItemStock(Number(e.target.value))} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="item-description">Description</Label>
                                    <Textarea id="item-description" value={itemDescription} onChange={e => setItemDescription(e.target.value)} placeholder="What does this item do?" className="min-h-[100px]" />
                                </div>
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
                                                <Label htmlFor="item-cost">Cost (Credits)</Label>
                                                <Input id="item-cost" type="number" value={itemCost} onChange={e => setItemCost(Number(e.target.value))} />
                                            </>
                                        ) : (
                                            <>
                                                <Label htmlFor="item-price">Price (₹)</Label>
                                                <Input id="item-price" type="number" value={itemPrice} onChange={e => setItemPrice(Number(e.target.value))} />
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="item-quantity">Quantity (per purchase)</Label>
                                        <Input id="item-quantity" type="number" value={itemQuantity} onChange={e => setItemQuantity(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Value Badge</Label>
                                        <Select value={itemBadge || 'none'} onValueChange={(v: any) => setItemBadge(v === 'none' ? undefined : v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Badge</SelectItem>
                                                <SelectItem value="popular">Popular</SelectItem>
                                                <SelectItem value="new">New</SelectItem>
                                                <SelectItem value="recommended">Recommended</SelectItem>
                                                <SelectItem value="exclusive">Exclusive</SelectItem>
                                                <SelectItem value="limited">Limited Edition</SelectItem>
                                                <SelectItem value="hot">Hot Deal</SelectItem>
                                                <SelectItem value="best-seller">Best Seller</SelectItem>
                                                <SelectItem value="jackpot">Jackpot</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="item-featured" checked={itemIsFeatured} onCheckedChange={setItemIsFeatured} />
                                    <Label htmlFor="item-featured">Mark as Featured</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                <Button onClick={handleSaveStoreItem}>{editingStoreItem ? 'Save Changes' : 'Create Item'}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
