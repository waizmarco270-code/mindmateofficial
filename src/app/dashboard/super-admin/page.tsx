
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
import { Gift, Users, UserCog, ShieldX, Trash2, CreditCard, Send, KeyRound as KeyRoundIcon, Megaphone, Terminal, Zap, Search, CheckCircle2, X, BrainCircuit, Loader2, Sparkles, ScrollText, MessageSquare, CloudRain, Gavel, Timer, Ban, Link as LinkIcon, Key, Copy, Check } from 'lucide-react';
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
import { usePresence } from '@/hooks/use-presence';
import { cn } from '@/lib/utils';

const CREDIT_PASSWORD = "waizcredit";
const MASTER_API_KEY = "EMITYGATE_SOVEREIGN_LINK_99"; // Sync with API route

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
  const { onlineUsers } = usePresence();
  const { toast } = useToast();
  
  const [isCreditUnlocked, setIsCreditUnlocked] = useState(false);
  const [creditPassword, setCreditPassword] = useState('');
  const [isApiKeyCopied, setIsApiKeyCopied] = useState(false);
  
  // Ban State
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [userToBan, setUserToBan] = useState<User | null>(null);
  const [banType, setBanType] = useState<'permanent' | 'temporary'>('temporary');
  const [banDays, setBanDays] = useState(3);
  const [banReason, setBanReason] = useState('');

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

  const handleExecuteBan = async () => {
      if (!userToBan) return;
      await toggleUserBlock(userToBan.uid, true, banType, banDays, banReason);
      toast({ title: "Ban Protocol Executed", description: `${userToBan.displayName} has been excluded.` });
      setIsBanDialogOpen(false);
      setUserToBan(null);
      setBanReason('');
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

  const copyApiKey = () => {
      navigator.clipboard.writeText(MASTER_API_KEY);
      setIsApiKeyCopied(true);
      toast({ title: "API Key Secured" });
      setTimeout(() => setIsApiKeyCopied(false), 2000);
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

  const onlineCount = onlineUsers.filter(u => u.isOnline).length;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-black tracking-tighter italic uppercase text-primary">Sovereign Command</h1>
            <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Protocol: Mainframe Governance</p>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary px-3 py-1 font-black">CORE v2.5</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="p-4 pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Citizens</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0 flex items-center justify-between">
                  <span className="text-3xl font-black">{users.length}</span>
                  <Users className="h-8 w-8 text-primary opacity-20"/>
              </CardContent>
          </Card>
          <Card className="bg-green-500/5 border-green-500/20">
              <CardHeader className="p-4 pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Online Now</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0 flex items-center justify-between">
                  <span className="text-3xl font-black">{onlineCount}</span>
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"/>
              </CardContent>
          </Card>
      </div>

      <Accordion type="multiple" defaultValue={['emitygate-integration', 'aegis-intelligence']} className="w-full space-y-4">
        
        {/* 0. EmityGate Integration Hub (NEW) */}
        <AccordionItem value="emitygate-integration" className="border-b-0">
          <Card className="border-blue-500/30 bg-blue-500/5">
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <LinkIcon className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">EmityGate Link Protocol</h3>
                  <p className="text-xs text-muted-foreground text-left font-bold uppercase opacity-60">Cross-product synchronization & API Hub.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-6">
                <Card className="bg-background border-blue-500/20 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2"><Key className="text-blue-500 h-4 w-4"/> Sovereign API Key</CardTitle>
                        <CardDescription>Use this key on EmityGate.com to securely pull user statistics.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Input readOnly value={MASTER_API_KEY} className="font-mono text-xs bg-muted/50 h-12" />
                            <Button size="icon" variant="outline" className="h-12 w-12" onClick={copyApiKey}>
                                {isApiKeyCopied ? <Check className="h-4 w-4 text-green-500"/> : <Copy className="h-4 w-4"/>}
                            </Button>
                        </div>
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                            <p className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest">Active Endpoint</p>
                            <code className="text-[10px] block p-2 bg-black/20 rounded font-mono break-all text-muted-foreground">
                                GET https://mindmate.emitygate.com/api/v1/user/[userId]
                            </code>
                        </div>
                    </CardContent>
                </Card>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* 1. Aegis Intelligence Hub */}
        <AccordionItem value="aegis-intelligence" className="border-b-0">
          <Card className="border-primary/30 bg-primary/5">
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <BrainCircuit className="h-6 w-6 text-primary animate-pulse" />
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Aegis Intelligence Hub</h3>
                  <p className="text-xs text-muted-foreground text-left font-bold uppercase opacity-60">Autonomous app governance & engagement engine.</p>
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
                                    <Label className="text-base font-bold">Auto-Pilot Mode</Label>
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
                                className="w-full h-12 text-lg font-black uppercase shadow-lg shadow-primary/20" 
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
                  <h3 className="text-lg font-black uppercase tracking-tight">User Authority</h3>
                  <p className="text-xs text-muted-foreground text-left font-bold uppercase opacity-60">Manage roles, bans, and Master Cards.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Badges</TableHead>
                                <TableHead>Credits</TableHead>
                                <TableHead>Health</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(u => {
                                const isUserSuperAdmin = u.uid === SUPER_ADMIN_UID;
                                const hasMasterCard = u.masterCardExpires && new Date(u.masterCardExpires) > new Date();
                                const isOnline = onlineUsers.find(ou => ou.uid === u.uid)?.isOnline;
                                
                                return (
                                    <TableRow key={u.uid} className={cn(u.isBlocked && "opacity-60 bg-red-500/5")}>
                                        <TableCell>
                                            <div className={cn("h-2.5 w-2.5 rounded-full", isOnline ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" : "bg-muted")} />
                                        </TableCell>
                                        <TableCell className="font-medium whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 border shadow-sm">
                                                    <AvatarImage src={u.photoURL}/>
                                                    <AvatarFallback>{u.displayName?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold">{u.displayName}</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{u.uid.slice(-8)}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap space-x-1">
                                            {isUserSuperAdmin && <Badge className="bg-red-500 text-[10px] font-black">Dev</Badge>}
                                            {u.isAdmin && <Badge className="text-[10px] font-black">Admin</Badge>}
                                            {u.isVip && <Badge className="bg-amber-500 text-[10px] font-black text-black">Elite</Badge>}
                                            {u.isCoDev && <Badge className="bg-rose-500 text-[10px] font-black">Co-Dev</Badge>}
                                            {hasMasterCard && <Badge variant="outline" className="text-green-500 border-green-500 text-[10px] font-black">Master</Badge>}
                                        </TableCell>
                                        <TableCell className="font-bold font-mono">{u.credits?.toLocaleString()}</TableCell>
                                        <TableCell>
                                            {u.isBlocked ? (
                                                <Badge variant="destructive" className="animate-pulse font-black uppercase text-[10px]">BANNED</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="font-black uppercase text-[10px]">STABLE</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="font-bold">Action <UserCog className="h-4 w-4 ml-2"/></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56">
                                                    <DropdownMenuItem onClick={() => u.isAdmin ? removeUserAdmin(u.uid) : makeUserAdmin(u.uid)}>{u.isAdmin ? "Remove Admin" : "Make Admin"}</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => u.isVip ? removeUserVip(u.uid) : makeUserVip(u.uid)}>{u.isVip ? "Remove Elite" : "Make Elite"}</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => u.isGM ? removeUserGM(u.uid) : makeUserGM(u.uid)}>{u.isGM ? "Remove GM" : "Make GM"}</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => u.isCoDev ? removeUserCoDev(u.uid) : makeUserCoDev(u.uid)}>{u.isCoDev ? "Remove Co-Dev" : "Make Co-Dev"}</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => { setMasterCardUser(u); setIsMasterCardDialogOpen(true); }}><CreditCard className="mr-2 h-4 w-4"/> Grant Master Card</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {u.isBlocked ? (
                                                        <DropdownMenuItem onClick={() => toggleUserBlock(u.uid, false)} className="text-green-500 font-bold">REINSTATE USER</DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem className="text-destructive font-bold" onClick={() => { setUserToBan(u); setIsBanDialogOpen(true); }}><Ban className="mr-2 h-4 w-4"/> EXECUTE BAN</DropdownMenuItem>
                                                    )}
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
                  <h3 className="text-lg font-black uppercase tracking-tight">App Configuration</h3>
                  <p className="text-xs text-muted-foreground text-left font-bold uppercase opacity-60">System states and deployment messages.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-6">
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    <Card className="border-amber-500/30">
                        <CardHeader><CardTitle className="text-base flex items-center gap-2 font-black uppercase tracking-tight"><Terminal className="h-4 w-4"/> Maintenance Mode</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border">
                                <Label className="font-bold">Global Maintenance</Label>
                                <Switch checked={isMaintenanceMode} onCheckedChange={setIsMaintenanceMode} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest">Display Message</Label>
                                <Textarea value={maintenanceMessage} onChange={e => setMaintenanceMessage(e.target.value)} placeholder="Mainframe upgrades in progress..." />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest">Visual Theme</Label>
                                <Select value={maintenanceTheme} onValueChange={(v: any) => setMaintenanceTheme(v)}>
                                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="shiny">Shiny Purple (Animated)</SelectItem>
                                        <SelectItem value="forest">Forest Green (Calm)</SelectItem>
                                        <SelectItem value="sunflower">Sunflower Yellow (Warning)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-primary/30">
                        <CardHeader><CardTitle className="text-base flex items-center gap-2 font-black uppercase tracking-tight"><Megaphone className="h-4 w-4"/> What's New Popup</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest">Protocol Changelog</Label>
                                <Textarea value={whatsNewMessage} onChange={e => setWhatsNewMessage(e.target.value)} placeholder="Brief the citizens on the new updates..." className="min-h-[150px]" />
                            </div>
                            <p className="text-[10px] text-muted-foreground italic font-medium">💡 Updating this will trigger an un-dismissible popup for all active users.</p>
                        </CardContent>
                    </Card>
                </div>
                <Button onClick={handleMaintenanceUpdate} className="w-full h-14 text-lg font-black uppercase shadow-xl shadow-primary/20">Save System Configuration</Button>
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
                  <h3 className="text-lg font-black uppercase tracking-tight">Global Gifts & Alerts</h3>
                  <p className="text-xs text-muted-foreground text-left font-bold uppercase opacity-60">Reward citizens or announce events.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-6">
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle className="text-base font-black uppercase">Create New Directive</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Target Population</Label>
                                <Select value={popupTarget} onValueChange={(v: any) => { setPopupTarget(v); if(v === 'all') setSelectedUser(null); }}>
                                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Every Citizen (Global)</SelectItem>
                                        <SelectItem value="single">Targeted Individual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {popupTarget === 'single' && (
                                <div className="space-y-3 p-3 rounded-xl border bg-muted/30">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Locate Scholar</Label>
                                    {selectedUser ? (
                                        <div className="flex items-center justify-between p-2 bg-background rounded-lg border border-primary/30">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6"><AvatarImage src={selectedUser.photoURL}/><AvatarFallback>U</AvatarFallback></Avatar>
                                                <span className="text-sm font-bold">{selectedUser.displayName}</span>
                                            </div>
                                            <button className="h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center" onClick={() => {setSelectedUser(null); setPopupSingleUserId('');}}><X className="h-3 w-3"/></button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                            <Input 
                                                value={userSearchTerm} 
                                                onChange={e => setUserSearchTerm(e.target.value)} 
                                                placeholder="Enter identifier..." 
                                                className="pl-9 h-10 rounded-lg"
                                            />
                                            {filteredUsers.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border-2 rounded-xl shadow-2xl overflow-hidden">
                                                    {filteredUsers.map(u => (
                                                        <button 
                                                            key={u.uid} 
                                                            className="w-full flex items-center gap-3 p-3 hover:bg-primary/5 text-left border-b last:border-0"
                                                            onClick={() => handleUserSelect(u)}
                                                        >
                                                            <Avatar className="h-8 w-8"><AvatarImage src={u.photoURL}/><AvatarFallback>U</AvatarFallback></Avatar>
                                                            <div className="flex-1">
                                                                <p className="text-xs font-black">{u.displayName}</p>
                                                                <p className="text-[10px] text-muted-foreground font-mono">{u.uid.slice(-8)}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Encryption Message</Label>
                                <Input value={popupMessage} onChange={e => setPopupMessage(e.target.value)} placeholder="Transmission content..." className="h-11" />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[9px] uppercase font-black text-muted-foreground">Credits</Label>
                                    <Input type="number" value={popupCreditAmount} onChange={e => setPopupCreditAmount(Number(e.target.value))} className="h-10 font-bold" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[9px] uppercase font-black text-muted-foreground">Scratch</Label>
                                    <Input type="number" value={popupScratchAmount} onChange={e => setPopupScratchAmount(Number(e.target.value))} className="h-10 font-bold" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[9px] uppercase font-black text-muted-foreground">Flip</Label>
                                    <Input type="number" value={popupFlipAmount} onChange={e => setPopupFlipAmount(Number(e.target.value))} className="h-10 font-bold" />
                                </div>
                            </div>
                            
                            <Button onClick={handleSendGlobalGift} disabled={isSendingPopup || !popupMessage} className="w-full h-12 font-black uppercase tracking-widest">
                                {isSendingPopup ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4"/>} Dispatch Assets
                            </Button>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-primary/10">
                        <CardHeader><CardTitle className="text-base font-black uppercase">Active Transmissions</CardTitle></CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[320px]">
                                <div className="space-y-3 pr-4">
                                    {globalGifts.map(gift => (
                                        <div key={gift.id} className="p-4 border-2 rounded-2xl bg-muted/30 text-xs flex items-center justify-between group transition-all hover:border-primary/20">
                                            <div className="flex-1 truncate pr-2">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    {gift.isActive ? <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> : <div className="h-2 w-2 rounded-full bg-muted" />}
                                                    <p className="font-black text-sm uppercase tracking-tight truncate">{gift.message}</p>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-60 font-bold uppercase text-[9px] tracking-widest">
                                                    <span>TARGET: {gift.target === 'all' ? 'GLOBAL' : gift.target.slice(-8)}</span>
                                                    <span>•</span>
                                                    <span>SENT: {format(gift.createdAt, 'MMM d, p')}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {gift.isActive && <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase border-primary/20" onClick={() => deactivateGift(gift.id)}>HALT</Button>}
                                                <Button variant="destructive" size="icon" className="h-8 w-8 rounded-lg shadow-lg" onClick={() => deleteGlobalGift(gift.id)}><Trash2 className="h-4 w-4"/></Button>
                                            </div>
                                        </div>
                                    ))}
                                    {globalGifts.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-48 opacity-20">
                                            <Gift className="h-12 w-12 mb-2" />
                                            <p className="font-black uppercase tracking-[0.2em] text-[10px]">No active gifts</p>
                                        </div>
                                    )}
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
                  <h3 className="text-lg font-black uppercase tracking-tight">System Overrides</h3>
                  <p className="text-xs text-muted-foreground text-left font-bold uppercase opacity-60">Emergency manual adjustments.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                {!isCreditUnlocked ? (
                    <form onSubmit={handleCreditPasswordSubmit} className="flex flex-col items-center gap-4 py-16 border-2 border-dashed rounded-3xl bg-red-500/5">
                        <div className="p-5 bg-red-500/10 rounded-full border-2 border-red-500/30"><KeyRoundIcon className="h-12 w-12 text-red-500"/></div>
                        <div className="text-center space-y-1">
                            <h4 className="font-black text-xl uppercase italic">RESTRICTED ZONE</h4>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em]">Credentials Required</p>
                        </div>
                        <Input type="password" value={creditPassword} onChange={e => setCreditPassword(e.target.value)} className="max-w-[240px] h-14 text-center text-2xl font-black rounded-2xl bg-background border-2" placeholder="••••••••" />
                        <Button type="submit" size="lg" className="h-12 px-10 font-black uppercase shadow-lg shadow-primary/20">AUTHORIZE ACCESS</Button>
                    </form>
                ) : (
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                        <Card className="border-red-500/20 bg-red-500/5">
                            <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">Manual Credit Injection</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest">Injection Amount (Global)</Label>
                                    <Input type="number" id="gift-all-credits" defaultValue={100} className="h-12 text-xl font-black" />
                                </div>
                                <Button className="w-full h-12 bg-red-600 hover:bg-red-700 font-black uppercase" onClick={() => {
                                    const amt = Number((document.getElementById('gift-all-credits') as HTMLInputElement).value);
                                    giftCreditsToAllUsers(amt);
                                    toast({ title: "Injected Successfully", description: `Briefed ${amt} credits to the population.` });
                                }}>EXECUTE INJECTION</Button>
                            </CardContent>
                        </Card>
                        <Card className="border-primary/20">
                            <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">System Maintenance</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="text-[10px] font-black uppercase h-12 border-primary/20" onClick={clearGlobalChat}>PURGE WORLD CHAT</Button>
                                <Button variant="outline" className="text-[10px] font-black uppercase h-12 border-primary/20" onClick={clearQuizLeaderboard}>RESET QUIZ DATA</Button>
                                <Button variant="outline" className="text-[10px] font-black uppercase h-12 border-primary/20" onClick={resetWeeklyStudyTime}>RESET TIME LOGS</Button>
                                <Button variant="outline" className="text-[10px] font-black uppercase h-12 border-primary/20" onClick={resetGameZoneLeaderboard}>RESET GAMES</Button>
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
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2"><CreditCard className="text-green-500"/> Grant Master Card</DialogTitle>
                <DialogDescription className="font-medium">Bestow unlimited system bypass upon <b>{masterCardUser?.displayName}</b>.</DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-4 text-left">
                <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Protocol Duration</Label>
                    <Select value={String(masterCardDuration)} onValueChange={v => setMasterCardDuration(Number(v))}>
                        <SelectTrigger className="h-12 font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1" className="font-bold uppercase text-xs">1 Day Trial</SelectItem>
                            <SelectItem value="7" className="font-bold uppercase text-xs">7 Days (Weekly Access)</SelectItem>
                            <SelectItem value="30" className="font-bold uppercase text-xs">30 Days (Monthly Tier)</SelectItem>
                            <SelectItem value="365" className="font-bold uppercase text-xs">365 Days (Eternal Citizen)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-xs font-medium text-green-700 dark:text-green-300 leading-relaxed">
                    💡 Master Cards allow users to bypass all credit costs for focus sessions, quizzes, and theme unlocks. Use only for High Council members or top-tier testers.
                </div>
            </div>
            <DialogFooter>
                <Button className="w-full h-14 text-lg font-black uppercase shadow-xl shadow-green-500/20" onClick={() => { if(masterCardUser) grantMasterCard(masterCardUser.uid, masterCardDuration); setIsMasterCardDialogOpen(false); toast({ title: "Master Protocol Activated", description: `Card granted to ${masterCardUser?.displayName}` }); }}>AUTHORIZE MASTER CARD</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EXECUTIONER BAN DIALOG */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
          <DialogContent className="max-w-md border-red-600">
              <DialogHeader>
                  <div className="flex justify-center mb-4">
                      <div className="p-4 bg-red-600/10 rounded-full border-2 border-red-600">
                          <Gavel className="h-10 w-10 text-red-600" />
                      </div>
                  </div>
                  <DialogTitle className="text-2xl font-black text-center text-red-600 uppercase italic">Execute Ban Protocol</DialogTitle>
                  <DialogDescription className="text-center">
                      Excluding <b>{userToBan?.displayName}</b> from the Sovereign Network.
                  </DialogDescription>
              </DialogHeader>
              
              <div className="py-4 space-y-6">
                  <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest">Temporal Tier</Label>
                      <Select value={banType} onValueChange={(v: any) => setBanType(v)}>
                          <SelectTrigger className="h-12 border-red-600/30 font-bold">
                              <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="temporary" className="font-bold">Temporary Suspension</SelectItem>
                              <SelectItem value="permanent" className="text-red-600 font-bold">PERMANENT TERMINATION</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>

                  {banType === 'temporary' && (
                      <div className="space-y-2">
                          <Label className="text-xs font-black uppercase tracking-widest">Duration (Days)</Label>
                          <div className="grid grid-cols-4 gap-2">
                              {[1, 3, 7, 30].map(d => (
                                  <Button key={d} variant={banDays === d ? "default" : "outline"} onClick={() => setBanDays(d)} className={cn(banDays === d && "bg-red-600")}>
                                      {d}d
                                  </Button>
                              ))}
                          </div>
                      </div>
                  )}

                  <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest">Reason for Exclusion</Label>
                      <Textarea 
                        value={banReason} 
                        onChange={e => setBanReason(e.target.value)} 
                        placeholder="e.g., Harassment in Global Forum, attempted credit exploit..." 
                        className="bg-muted/30"
                      />
                  </div>
              </div>

              <DialogFooter className="flex-col gap-2">
                  <Button variant="destructive" onClick={handleExecuteBan} className="w-full h-14 text-lg font-black uppercase shadow-lg shadow-red-600/20">
                      CONFIRM EXECUTION
                  </Button>
                  <DialogClose asChild>
                      <Button variant="ghost" className="w-full font-bold uppercase text-[10px] tracking-widest text-muted-foreground hover:text-foreground">CANCEL PROTOCOL</Button>
                  </DialogClose>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* Aegis Decision Dialog */}
      <Dialog open={isDecisionDialogOpen} onOpenChange={setIsDecisionDialogOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl font-black uppercase tracking-tight">
                    <BrainCircuit className="text-primary animate-pulse"/> Sentinel Decision Log
                </DialogTitle>
                <DialogDescription className="font-medium uppercase text-[10px] tracking-widest opacity-60">
                    Reviewing autonomous reasoning and actions taken by Aegis.
                </DialogDescription>
            </DialogHeader>
            
            {aegisLastDecision && (
                <div className="py-6 space-y-6">
                    <div className="p-5 rounded-2xl bg-muted/50 border-l-4 border-primary shadow-inner">
                        <div className="flex items-center gap-2 mb-2">
                            <ScrollText className="h-4 w-4 text-primary"/>
                            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-primary">Aegis Intelligence Feed</h4>
                        </div>
                        <p className="text-sm leading-relaxed font-medium text-foreground/90 italic">"{aegisLastDecision.decision}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h5 className="font-black text-[9px] uppercase tracking-widest text-muted-foreground px-1">Actions Dispatched</h5>
                            <div className="space-y-2">
                                {aegisLastDecision.announcement && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                        <Megaphone className="h-4 w-4 text-blue-500"/>
                                        <span className="text-[10px] font-black uppercase tracking-tight">Post Announcement</span>
                                    </div>
                                )}
                                {aegisLastDecision.dailySurprise && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                        <Sparkles className="h-4 w-4 text-purple-500"/>
                                        <span className="text-[10px] font-black uppercase tracking-tight">Sync Daily Surprise</span>
                                    </div>
                                )}
                                {aegisLastDecision.creditRain && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                        <CloudRain className="h-4 w-4 text-cyan-500"/>
                                        <span className="text-[10px] font-black uppercase tracking-tight">Execute Credit Rain</span>
                                    </div>
                                )}
                                {aegisLastDecision.globalGift && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                        <Gift className="h-4 w-4 text-amber-500"/>
                                        <span className="text-[10px] font-black uppercase tracking-tight">Targeted Reward Send</span>
                                    </div>
                                )}
                                {aegisLastDecision.actionTaken === 'idled' && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted border">
                                        <X className="h-4 w-4 text-muted-foreground"/>
                                        <span className="text-[10px] font-black uppercase tracking-tight">Sentinel Idle (Optimal)</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {aegisLastDecision.announcement && (
                            <div className="space-y-3">
                                <h5 className="font-black text-[9px] uppercase tracking-widest text-muted-foreground px-1">Briefing Preview</h5>
                                <div className="p-4 rounded-2xl border bg-background space-y-2 shadow-inner">
                                    <p className="font-black text-xs uppercase text-primary leading-tight">{aegisLastDecision.announcement.title}</p>
                                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed line-clamp-4">{aegisLastDecision.announcement.description}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <DialogFooter>
                <DialogClose asChild>
                    <Button className="w-full h-12 font-black uppercase tracking-widest">Understood, Sentinel</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
