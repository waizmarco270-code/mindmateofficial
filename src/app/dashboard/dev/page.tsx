
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdmin, SUPER_ADMIN_UID, type CreditPack, type StoreItem, type PurchaseRequest } from '@/hooks/use-admin';
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


export default function PaymentsPanelPage() {
    const { 
        isSuperAdmin, isCoDev,
        appSettings, updateAppSettings,
        creditPacks, createCreditPack, updateCreditPack, deleteCreditPack,
        storeItems, createStoreItem, updateStoreItem, deleteStoreItem,
        purchaseRequests, approvePurchaseRequest, declinePurchaseRequest,
        loading
    } = useAdmin();
    const { toast } = useToast();
  
    // State for Credit Packs
    const [isPackDialogOpen, setIsPackDialogOpen] = useState(false);
    const [editingPack, setEditingPack] = useState<CreditPack | null>(null);
    const [packName, setPackName] = useState('');
    const [packCredits, setPackCredits] = useState(100);
    const [packPrice, setPackPrice] = useState(10);

    // State for Store Items
    const [isStoreItemDialogOpen, setIsStoreItemDialogOpen] = useState(false);
    const [editingStoreItem, setEditingStoreItem] = useState<StoreItem | null>(null);
    const [itemName, setItemName] = useState('');
    const [itemDescription, setItemDescription] = useState('');
    const [itemCost, setItemCost] = useState(100);
    const [itemType, setItemType] = useState<StoreItem['type']>('scratch-card');
    const [itemQuantity, setItemQuantity] = useState(1);
    const [itemStock, setItemStock] = useState(100);
    const [itemIsFeatured, setItemIsFeatured] = useState(false);

    const openPackDialog = (pack: CreditPack | null) => {
        if (pack) {
            setEditingPack(pack);
            setPackName(pack.name);
            setPackCredits(pack.credits);
            setPackPrice(pack.price);
        } else {
            setEditingPack(null);
            setPackName('');
            setPackCredits(100);
            setPackPrice(10);
        }
        setIsPackDialogOpen(true);
    };

    const handleSavePack = async () => {
        if (!createCreditPack || !updateCreditPack) return;
        if (!packName.trim() || packCredits <= 0 || packPrice < 0) {
            toast({ variant: 'destructive', title: 'Invalid input for credit pack.' });
            return;
        }
        
        const packData = { name: packName, credits: packCredits, price: packPrice };

        if (editingPack) {
            await updateCreditPack(editingPack.id, packData);
            toast({ title: 'Credit Pack Updated' });
        } else {
            await createCreditPack(packData);
            toast({ title: 'Credit Pack Created' });
        }
        setIsPackDialogOpen(false);
    };
    
     const handleQrCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64String = event.target?.result as string;
            updateAppSettings({ upiQrCode: base64String });
            toast({ title: 'QR Code Updated!' });
        };
        reader.readAsDataURL(file);
    };
    
    const openStoreItemDialog = (item: StoreItem | null) => {
        if (item) {
            setEditingStoreItem(item);
            setItemName(item.name);
            setItemDescription(item.description);
            setItemCost(item.cost);
            setItemType(item.type);
            setItemQuantity(item.quantity);
            setItemStock(item.stock);
            setItemIsFeatured(item.isFeatured);
        } else {
            setEditingStoreItem(null);
            setItemName('');
            setItemDescription('');
            setItemCost(100);
            setItemType('scratch-card');
            setItemQuantity(1);
            setItemStock(100);
            setItemIsFeatured(false);
        }
        setIsStoreItemDialogOpen(true);
    }

    const handleSaveStoreItem = async () => {
        if (!createStoreItem || !updateStoreItem) return;
        if (!itemName.trim() || itemCost <= 0 || itemQuantity <= 0) {
            toast({ variant: 'destructive', title: 'Invalid input for store item.'});
            return;
        }

        const itemData = {
            name: itemName,
            description: itemDescription,
            cost: itemCost,
            type: itemType,
            quantity: itemQuantity,
            stock: itemStock,
            isFeatured: itemIsFeatured,
        };

        if (editingStoreItem) {
            await updateStoreItem(editingStoreItem.id, itemData);
            toast({ title: "Store Item Updated" });
        } else {
            await createStoreItem(itemData);
            toast({ title: "Store Item Created" });
        }
        setIsStoreItemDialogOpen(false);
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
        <p className="text-muted-foreground">Manage credit packs, store items, and approve purchase requests.</p>
      </div>

       <Card>
            <CardHeader>
                <CardTitle>Pending Purchase Requests</CardTitle>
                <CardDescription>Review and approve/decline manual UPI payments.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Pack</TableHead>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {purchaseRequests && purchaseRequests.map(req => (
                            <TableRow key={req.id}>
                                <TableCell>{req.userName}</TableCell>
                                <TableCell>{req.packName} (+{req.credits} Credits)</TableCell>
                                <TableCell className="font-mono">{req.transactionId}</TableCell>
                                <TableCell>{req.createdAt ? format(req.createdAt.toDate(), "d MMM, h:mm a") : 'N/A'}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="destructive" size="sm" onClick={() => declinePurchaseRequest && declinePurchaseRequest(req.id)}>Decline</Button>
                                    <Button size="sm" onClick={() => approvePurchaseRequest && approvePurchaseRequest(req)}>Approve</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!purchaseRequests || purchaseRequests.length === 0) && <TableRow><TableCell colSpan={5} className="h-24 text-center">No pending requests.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Manage Credit Packs</CardTitle>
                    <CardDescription>Manage packs for buying credits with real money.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {creditPacks && creditPacks.map(pack => (
                            <div key={pack.id} className="flex items-center p-3 rounded-md bg-muted">
                                <div className="flex-1">
                                    <p className="font-semibold">{pack.name}</p>
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
                                <div className="space-y-2">
                                    <Label htmlFor="pack-credits">Credits</Label>
                                    <Input id="pack-credits" type="number" value={packCredits} onChange={e => setPackCredits(Number(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pack-price">Price (₹)</Label>
                                    <Input id="pack-price" type="number" value={packPrice} onChange={e => setPackPrice(Number(e.target.value))} />
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
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Manage Redeemable Items</CardTitle>
                    <CardDescription>Manage items users can buy with credits.</CardDescription>
                </CardHeader>
                    <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {storeItems && storeItems.map(item => (
                            <div key={item.id} className="flex items-center p-3 rounded-md bg-muted">
                                <div className="flex-1">
                                    <p className="font-semibold">{item.name} {item.isFeatured && <span className="text-xs text-primary">(Featured)</span>}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.cost} Credits | Stock: {item.stock}
                                    </p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => openStoreItemDialog(item)}><Edit className="h-4 w-4"/></Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
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
                        <Button className="w-full" onClick={() => openStoreItemDialog(null)}>Add New Item</Button>
                </CardContent>
            </Card>
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Manage UPI QR Code</CardTitle>
                    <CardDescription>Upload the QR code for payments.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {appSettings?.upiQrCode ? (
                        <div className="p-2 border bg-white rounded-lg w-48 h-48 mx-auto">
                            <Image src={appSettings.upiQrCode} alt="Current UPI QR Code" className="w-full h-full object-contain" width={192} height={192} />
                        </div>
                    ) : (
                        <div className="p-2 border bg-white rounded-lg w-48 h-48 mx-auto flex items-center justify-center">
                            <ImageIcon className="h-10 w-10 text-muted-foreground"/>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="qr-upload">Upload New QR Code</Label>
                        <Input id="qr-upload" type="file" accept="image/*" onChange={handleQrCodeUpload} />
                    </div>
                </CardContent>
            </Card>
        </div>
        <Dialog open={isStoreItemDialogOpen} onOpenChange={setIsStoreItemDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingStoreItem ? 'Edit' : 'Add'} Redeemable Item</DialogTitle>
                </DialogHeader>
                    <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="item-name">Item Name</Label>
                        <Input id="item-name" value={itemName} onChange={e => setItemName(e.target.value)} />
                    </div>
                        <div className="space-y-2">
                        <Label htmlFor="item-description">Description</Label>
                        <Textarea id="item-description" value={itemDescription} onChange={e => setItemDescription(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                            <Label htmlFor="item-cost">Cost (Credits)</Label>
                            <Input id="item-cost" type="number" value={itemCost} onChange={e => setItemCost(Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="item-type">Item Type</Label>
                            <Select value={itemType} onValueChange={(v: StoreItem['type']) => setItemType(v)}>
                                <SelectTrigger id="item-type"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="scratch-card">Scratch Card</SelectItem>
                                    <SelectItem value="card-flip">Card Flip Play</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                        <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="item-quantity">Quantity (per purchase)</Label>
                            <Input id="item-quantity" type="number" value={itemQuantity} onChange={e => setItemQuantity(Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="item-stock">Stock</Label>
                            <Input id="item-stock" type="number" value={itemStock} onChange={e => setItemStock(Number(e.target.value))} />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="item-featured" checked={itemIsFeatured} onChange={e => setItemIsFeatured(e.target.checked)} />
                        <Label htmlFor="item-featured">Mark as Featured</Label>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleSaveStoreItem}>{editingStoreItem ? 'Save Changes' : 'Create Item'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
