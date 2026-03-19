
'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdmin, SUPER_ADMIN_UID, type User, type AppSettings, type MaintenanceTheme } from '@/hooks/use-admin';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Gift, Users, UserCog, ShieldX, Trash2, CreditCard, Send, KeyRound as KeyRoundIcon, Megaphone, Terminal, Zap, Search, CheckCircle2, X, BrainCircuit, Loader2, Sparkles, ScrollText, MessageSquare, CloudRain } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format, addDays as dateFnsAddDays } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogClose, DialogFooter, DialogHeader, DialogTitle, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type AegisPulseOutput } from '@/ai/flows/aegis-sentinel-flow';

const CREDIT_PASSWORD = "waizcredit";

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
    triggerAegisPulse,
    announcements
  } = useAdmin();
  const { toast } = useToast();
  
  const [isCreditUnlocked, setIsCreditUnlocked] = useState(false);
  const [creditPassword, setCreditPassword] = useState('');
  
  // Global Gift State
  const [popupTarget, setPopupTarget] = useState<'all' | 'single'>('all');
  const [popupSingleUserId, setPopupSingleUserId] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupCreditAmount, setPopupCreditAmount] = useState(0);
  const [popupScratchAmount, setPopupScratchAmount] = useState(0);
  const [popupFlipAmount, setPopupFlipAmount] = useState(0);
  const [isSendingPopup, setIsSendingPopup] = useState(false);

  // Aegis State
  const [isAegisPulseRunning, setIsAegisPulseRunning] = useState(false);
  const [aegisLastDecision, setAegisLastDecision] = useState<AegisPulseOutput | null>(null);
  const [isDecisionDialogOpen, setIsDecisionDialogOpen] = useState(false);

  // User Search Logic
  const filteredUsers = useMemo(() => {
    if (!userSearchTerm.trim()) return [];
    return users.filter(u => 
        u.displayName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        u.uid.toLowerCase() === userSearchTerm.toLowerCase()
    ).slice(0, 5);
  }, [users, userSearchTerm]);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setPopupSingleUserId(user.uid);
    setUserSearchTerm('');
  };

  const [isMasterCardDialogOpen, setIsMasterCardDialogOpen] = useState(false);
  const [masterCardUser, setMasterCardUser] = useState<User | null>(null);
  const [masterCardDuration, setMasterCardDuration] = useState(7);

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(appSettings?.isMaintenanceMode || false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(appSettings?.maintenanceMessage || '');
  const [maintenanceTheme, setMaintenanceTheme] = useState<MaintenanceTheme>(appSettings?.maintenanceTheme || 'shiny');
  const [whatsNewMessage, setWhatsNewMessage] = useState(appSettings?.whatsNewMessage || '');
  const [isAegisMode, setIsAegisMode] = useState(appSettings?.isAegisMode || false);

  useEffect(() => {
    if (appSettings) {
        setIsMaintenanceMode(appSettings.isMaintenanceMode || false);
        setMaintenanceMessage(appSettings.maintenanceMessage || '');
        setMaintenanceTheme(appSettings.maintenanceTheme || 'shiny');
        setWhatsNewMessage(appSettings.whatsNewMessage || '');
        setIsAegisMode(appSettings.isAegisMode || false);
    }
  }, [appSettings]);

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
          isAegisMode,
          lastMaintenanceId: isMaintenanceMode ? Date.now().toString() : appSettings?.lastMaintenanceId,
      });
      toast({ title: 'App Configuration Updated!' });
  };

  const handleAegisPulse = async () => {
      setIsAegisPulseRunning(true);
      try {
          const result = await triggerAegisPulse();
          setAegisLastDecision(result);
          setIsDecisionDialogOpen(true);
          toast({
              title: "Aegis Intelligence Pulse Complete",
              description: `Aegis has completed its analysis.`,
          });
      } catch (error: any) {
          toast({ variant: 'destructive', title: "Aegis Error", description: error.message });
      } finally {
          setIsAegisPulseRunning(false);
      }
  };

  const handleSendGlobalGift = async () => {
      if (!popupMessage.trim()) return;
      if (popupTarget === 'single' && !popupSingleUserId) {
          toast({ variant: 'destructive', title: "Error", description: "Please select a user." });
          return;
      }

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
          setSelectedUser(null);
          setPopupSingleUserId('');
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

      <Accordion type="multiple" defaultValue={['user-management', 'aegis-intelligence']} className="w-full space-y-4">
        
        {/* 1. Aegis Intelligence Hub */}
        <AccordionItem value="aegis-intelligence" className="border-b-0">
          <Card className="border-primary/30 bg-primary/5">
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <BrainCircuit className="h-6 w-6 text-primary animate-pulse" />
                <div>
                  <h3 className="text-lg font-semibold">Aegis Intelligence Hub</h3>
                  <p className="text-sm text-muted-foreground text-left">Autonomous app governance & engagement agent.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-6">
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    <Card className="bg-background">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2"><Zap className="text-yellow-500 h-4 w-4"/> Control System</CardTitle>
                            <CardDescription>Configure Aegis's level of autonomy.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-xl">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Auto-Pilot Mode</Label>
                                    <p className="text-xs text-muted-foreground">Allow Aegis to post announcements and surprises independently.</p>
                                </div>
                                <Switch checked={isAegisMode} onCheckedChange={setIsAegisMode} />
                            </div>
                            <Button onClick={handleMaintenanceUpdate} variant="outline" className="w-full">Save Aegis Mode Status</Button>
                        </CardContent>
                    </Card>
                    <Card className="bg-background">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2"><Sparkles className="text-primary h-4 w-4"/> Manual Sentinel Pulse</CardTitle>
                            <CardDescription>Force Aegis to analyze and act right now.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-xl bg-muted/50 border italic text-xs text-muted-foreground">
                                Last Pulse: {appSettings?.lastAegisPulse ? format(new Date(appSettings.lastAegisPulse), 'PPP p') : 'Never'}
                            </div>
                            <Button 
                                onClick={handleAegisPulse} 
                                className="w-full h-12 text-lg font-bold" 
                                disabled={isAegisPulseRunning}
                            >
                                {isAegisPulseRunning ? <Loader2 className="animate-spin mr-2" /> : <BrainCircuit className="mr-2" />}
                                Trigger Intelligence Pulse
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* 2. User Management */}
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
                                                    <DropdownMenuItem onClick={() => u.isCoDev ? makeUserCoDev(u.uid) : makeUserCoDev(u.uid)}>{u.isCoDev ? "Remove Co-Dev" : "Make Co-Dev"}</DropdownMenuItem>
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

        {/* 3. App Configuration */}
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
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
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

        {/* 4. Global Gifts */}
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
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Create Gift/Announcement</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Target Audience</Label>
                                <Select value={popupTarget} onValueChange={(v: any) => { setPopupTarget(v); if(v === 'all') setSelectedUser(null); }}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Every Legend (All Users)</SelectItem>
                                        <SelectItem value="single">Specific Student</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {popupTarget === 'single' && (
                                <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
                                    <Label className="text-xs font-bold uppercase">Search Student</Label>
                                    {selectedUser ? (
                                        <div className="flex items-center justify-between p-2 bg-background rounded-md border border-primary/30">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6"><AvatarImage src={selectedUser.photoURL}/><AvatarFallback>U</AvatarFallback></Avatar>
                                                <span className="text-sm font-bold">{selectedUser.displayName}</span>
                                            </div>
                                            <button className="h-6 w-6" onClick={() => {setSelectedUser(null); setPopupSingleUserId('');}}><X className="h-3 w-3"/></button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                            <Input 
                                                value={userSearchTerm} 
                                                onChange={e => setUserSearchTerm(e.target.value)} 
                                                placeholder="Type name or UID..." 
                                                className="pl-8 h-9"
                                            />
                                            {filteredUsers.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg overflow-hidden">
                                                    {filteredUsers.map(u => (
                                                        <button 
                                                            key={u.uid} 
                                                            className="w-full flex items-center gap-2 p-2 hover:bg-muted text-left text-sm"
                                                            onClick={() => handleUserSelect(u)}
                                                        >
                                                            <Avatar className="h-6 w-6"><AvatarImage src={u.photoURL}/><AvatarFallback>U</AvatarFallback></Avatar>
                                                            <span className="flex-1 font-medium">{u.displayName}</span>
                                                            <span className="text-[10px] text-muted-foreground">{u.uid.slice(-5)}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Message</Label>
                                <Input value={popupMessage} onChange={e => setPopupMessage(e.target.value)} placeholder="Happy Studying!" />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Credits</Label><Input type="number" value={popupCreditAmount} onChange={e => setPopupCreditAmount(Number(e.target.value))} className="h-9" /></div>
                                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Scratch</Label><Input type="number" value={popupScratchAmount} onChange={e => setPopupScratchAmount(Number(e.target.value))} className="h-9" /></div>
                                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Flip</Label><Input type="number" value={popupFlipAmount} onChange={e => setPopupFlipAmount(Number(e.target.value))} className="h-9" /></div>
                            </div>
                            
                            <Button onClick={handleSendGlobalGift} disabled={isSendingPopup || !popupMessage} className="w-full h-11 font-bold">
                                {isSendingPopup ? <Loader2 className="animate-spin" /> : <Send className="mr-2 h-4 w-4"/>} Send Gift
                            </Button>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader><CardTitle className="text-base">Active & Past Gifts</CardTitle></CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[280px]">
                                <div className="space-y-2">
                                    {globalGifts.map(gift => (
                                        <div key={gift.id} className="p-3 border rounded-lg bg-muted/50 text-xs flex items-center justify-between">
                                            <div className="flex-1 truncate pr-2">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {gift.isActive ? <Badge className="bg-green-500 h-2 w-2 p-0 rounded-full" /> : <Badge className="bg-muted h-2 w-2 p-0 rounded-full" />}
                                                    <p className="font-bold">{gift.message}</p>
                                                </div>
                                                <p className="text-muted-foreground">Target: {gift.target === 'all' ? 'All Users' : gift.target.slice(0, 10) + '...'}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                {gift.isActive && <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => deactivateGift(gift.id)}>Stop</Button>}
                                                <Button variant="destructive" size="sm" className="h-7 w-7 p-0" onClick={() => deleteGlobalGift(gift.id)}><Trash2 className="h-3.5 w-3.5"/></Button>
                                            </div>
                                        </div>
                                    ))}
                                    {globalGifts.length === 0 && <p className="text-center text-muted-foreground py-10 text-sm italic">No gifts sent yet.</p>}
                                </div>
                            </ScrollArea>
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
                        <input type="password" value={creditPassword} onChange={e => setCreditPassword(e.target.value)} className="max-w-[200px] text-center border-2 rounded p-2 bg-background" placeholder="••••••••" />
                        <Button type="submit">Unlock System</Button>
                    </form>
                ) : (
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
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
            <div className="py-4 space-y-4 text-left">
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

      {/* Aegis Decision Dialog */}
      <Dialog open={isDecisionDialogOpen} onOpenChange={setIsDecisionDialogOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                    <BrainCircuit className="text-primary animate-pulse"/> Sentinel Decision Log
                </DialogTitle>
                <DialogDescription>
                    Review the autonomous reasoning and actions taken by Aegis.
                </DialogDescription>
            </DialogHeader>
            
            {aegisLastDecision && (
                <div className="py-6 space-y-6">
                    <div className="p-4 rounded-xl bg-muted/50 border-l-4 border-primary">
                        <div className="flex items-center gap-2 mb-2">
                            <ScrollText className="h-4 w-4 text-primary"/>
                            <h4 className="font-bold text-sm uppercase tracking-wider">Aegis Reasoning</h4>
                        </div>
                        <p className="text-sm leading-relaxed italic">"{aegisLastDecision.decision}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <h5 className="font-bold text-xs uppercase text-muted-foreground px-1">Actions Executed</h5>
                            <div className="space-y-2">
                                {aegisLastDecision.announcement && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                        <Megaphone className="h-4 w-4 text-blue-500"/>
                                        <span className="text-xs font-semibold">Post Announcement</span>
                                    </div>
                                )}
                                {aegisLastDecision.dailySurprise && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                        <Sparkles className="h-4 w-4 text-purple-500"/>
                                        <span className="text-xs font-semibold">Update Daily Surprise</span>
                                    </div>
                                )}
                                {aegisLastDecision.creditRain && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                        <CloudRain className="h-4 w-4 text-cyan-500"/>
                                        <span className="text-xs font-semibold">Trigger Credit Rain</span>
                                    </div>
                                )}
                                {aegisLastDecision.globalGift && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                        <Gift className="h-4 w-4 text-amber-500"/>
                                        <span className="text-xs font-semibold">Send Targeted Gift</span>
                                    </div>
                                )}
                                {aegisLastDecision.actionTaken === 'idled' && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border">
                                        <X className="h-4 w-4 text-muted-foreground"/>
                                        <span className="text-xs font-semibold">No Action Needed</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {aegisLastDecision.announcement && (
                            <div className="space-y-3">
                                <h5 className="font-bold text-xs uppercase text-muted-foreground px-1">Announcement Preview</h5>
                                <div className="p-3 rounded-lg border bg-background space-y-1">
                                    <p className="font-bold text-sm">{aegisLastDecision.announcement.title}</p>
                                    <p className="text-[10px] text-muted-foreground line-clamp-3">{aegisLastDecision.announcement.description}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <DialogFooter>
                <DialogClose asChild>
                    <Button className="w-full">Understood, Sentinel</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
