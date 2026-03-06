
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdmin, SUPER_ADMIN_UID, type User, GlobalGift, AppSettings, type CreditPack, type StoreItem, MaintenanceTheme, type PurchaseRequest } from '@/hooks/use-admin';
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
    purchaseRequests,
    approvePurchaseRequest,
    declinePurchaseRequest,
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
        <AccordionItem value="store-management" className="border-b-0">
          <Card>
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <ShoppingCart className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Store Management</h3>
                  <p className="text-sm text-muted-foreground text-left">Verify payments and manage items.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-6">
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
                                    <TableHead>TX ID</TableHead>
                                    <TableHead>Screenshot</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchaseRequests && purchaseRequests.map(req => (
                                    <TableRow key={req.id}>
                                        <TableCell>{req.userName}</TableCell>
                                        <TableCell>{req.packName} (+{req.credits})</TableCell>
                                        <TableCell className="font-mono text-xs">{req.transactionId}</TableCell>
                                        <TableCell>
                                            {req.screenshotUrl ? (
                                                <a href={req.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                                                    <ImageIcon className="h-4 w-4"/> View
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground">No Proof</span>
                                            )}
                                        </TableCell>
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
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Restore the rest of the AccordionItems from context history... */}
        <AccordionItem value="user-management" className="border-b-0">
          <Card>
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">User Management</h3>
                  <p className="text-sm text-muted-foreground text-left">Manage user roles and statuses.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(u => (
                            <TableRow key={u.uid}>
                                <TableCell>{u.displayName}</TableCell>
                                <TableCell>
                                    {u.isAdmin ? <Badge>Admin</Badge> : <Badge variant="outline">User</Badge>}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" onClick={() => makeUserAdmin(u.uid)}>Admin</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
