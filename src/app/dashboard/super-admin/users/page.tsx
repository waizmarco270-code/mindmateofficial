
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdmin, SUPER_ADMIN_UID, type User } from '@/hooks/use-admin';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
    Users, UserCog, Ban, CreditCard, 
    ShieldCheck, Crown, Code, Gavel, 
    Loader2, Search, MoreVertical
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogClose, DialogFooter, DialogHeader, DialogTitle, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePresence } from '@/hooks/use-presence';
import { cn } from '@/lib/utils';
import { addDays as dateFnsAddDays } from 'date-fns';

export default function UserAuthorityPage() {
    const { 
        users, toggleUserBlock, makeUserAdmin, removeUserAdmin, 
        makeUserVip, removeUserVip, makeUserGM, removeUserGM,
        makeUserCoDev, removeUserCoDev, grantMasterCard
    } = useAdmin();
    const { onlineUsers } = usePresence();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    // Ban State
    const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
    const [userToBan, setUserToBan] = useState<User | null>(null);
    const [banType, setBanType] = useState<'permanent' | 'temporary'>('temporary');
    const [banDays, setBanDays] = useState(3);
    const [banReason, setBanReason] = useState('');

    // Master Card State
    const [isMasterCardDialogOpen, setIsMasterCardDialogOpen] = useState(false);
    const [masterCardUser, setMasterCardUser] = useState<User | null>(null);
    const [masterCardDuration, setMasterCardDuration] = useState(7);

    const filteredUsers = users.filter(u => 
        u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.uid.includes(searchTerm)
    );

    const handleExecuteBan = async () => {
        if (!userToBan) return;
        await toggleUserBlock(userToBan.uid, true, banType, banDays, banReason);
        toast({ title: "Ban Protocol Executed", description: `${userToBan.displayName} has been excluded.` });
        setIsBanDialogOpen(false);
        setUserToBan(null);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between p-6">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2 uppercase italic"><Users className="text-primary"/> Citizen Registry</CardTitle>
                        <CardDescription>Manage user roles, access levels, and security states.</CardDescription>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search legends..." 
                            className="pl-9 h-10"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">Status</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Badges</TableHead>
                                <TableHead>Credits</TableHead>
                                <TableHead>State</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map(u => {
                                const isOnline = (onlineUsers || []).find(ou => ou.uid === u.uid)?.isOnline;
                                const hasMaster = u.masterCardExpires && new Date(u.masterCardExpires) > new Date();
                                const isDev = u.uid === SUPER_ADMIN_UID;

                                return (
                                    <TableRow key={u.uid} className={cn(u.isBlocked && "opacity-60 bg-red-500/5")}>
                                        <TableCell>
                                            <div className={cn("h-2.5 w-2.5 rounded-full", isOnline ? "bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" : "bg-muted")} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 border shadow-sm">
                                                    <AvatarImage src={u.photoURL}/>
                                                    <AvatarFallback>U</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold truncate max-w-[150px]">{u.displayName}</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">{u.mindMateId || u.uid.slice(-8)}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap space-x-1">
                                            {isDev && <Badge className="bg-red-500 text-[10px] font-black">Dev</Badge>}
                                            {u.isAdmin && <Badge className="text-[10px] font-black">Admin</Badge>}
                                            {u.isVip && <Badge className="bg-amber-500 text-[10px] font-black text-black">Elite</Badge>}
                                            {u.isCoDev && <Badge className="bg-rose-500 text-[10px] font-black">Co-Dev</Badge>}
                                            {hasMaster && <Badge variant="outline" className="text-green-500 border-green-500 text-[10px] font-black">Master</Badge>}
                                        </TableCell>
                                        <TableCell className="font-bold font-mono">{u.credits?.toLocaleString()}</TableCell>
                                        <TableCell>
                                            {u.isBlocked ? (
                                                <Badge variant="destructive" className="animate-pulse font-black uppercase text-[10px]">BANNED</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="font-black uppercase text-[10px]">ACTIVE</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="font-bold">Manage <UserCog className="h-4 w-4 ml-2"/></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56">
                                                    <DropdownMenuItem onClick={() => u.isAdmin ? removeUserAdmin(u.uid) : makeUserAdmin(u.uid)}>{u.isAdmin ? "Remove Admin" : "Make Admin"}</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => u.isVip ? removeUserVip(u.uid) : makeUserVip(u.uid)}>{u.isVip ? "Remove Elite" : "Make Elite"}</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => u.isGM ? removeUserGM(u.uid) : makeUserGM(u.uid)}>{u.isGM ? "Remove GM" : "Make GM"}</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => u.isCoDev ? removeUserCoDev(u.uid) : makeUserCoDev(u.uid)}>{u.isCoDev ? "Remove Co-Dev" : "Make Co-Dev"}</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => { setMasterCardUser(u); setIsMasterCardDialogOpen(true); }}><CreditCard className="mr-2 h-4 w-4"/> Grant Master Card</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {u.isBlocked ? (
                                                        <DropdownMenuItem onClick={() => toggleUserBlock(u.uid, false)} className="text-green-500 font-bold uppercase">Reinstate Legend</DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem className="text-destructive font-bold uppercase" onClick={() => { setUserToBan(u); setIsBanDialogOpen(true); }}><Ban className="mr-2 h-4 w-4"/> Execute Ban</DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* MODALS */}
            <Dialog open={isMasterCardDialogOpen} onOpenChange={setIsMasterCardDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2"><CreditCard className="text-green-500"/> Grant Master Card</DialogTitle>
                        <DialogDescription>Bestow unlimited system bypass upon <b>{masterCardUser?.displayName}</b>.</DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Protocol Duration</Label>
                        <Select value={String(masterCardDuration)} onValueChange={v => setMasterCardDuration(Number(v))}>
                            <SelectTrigger className="h-12 font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 Day Trial</SelectItem>
                                <SelectItem value="7">7 Days (Weekly)</SelectItem>
                                <SelectItem value="30">30 Days (Monthly)</SelectItem>
                                <SelectItem value="365">365 Days (Eternal)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button className="w-full h-14 text-lg font-black uppercase" onClick={() => { if(masterCardUser) grantMasterCard(masterCardUser.uid, masterCardDuration); setIsMasterCardDialogOpen(false); }}>AUTHORIZE MASTER CARD</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-red-600/10 rounded-full border-2 border-red-600"><Gavel className="h-10 w-10 text-red-600" /></div>
                        </div>
                        <DialogTitle className="text-2xl font-black text-center text-red-600 uppercase italic">Execute Ban Protocol</DialogTitle>
                        <DialogDescription className="text-center">Excluding <b>{userToBan?.displayName}</b> from the network.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest">Temporal Tier</Label>
                            <Select value={banType} onValueChange={(v: any) => setBanType(v)}>
                                <SelectTrigger className="h-12 border-red-600/30 font-bold"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="temporary" className="font-bold">Suspension</SelectItem>
                                    <SelectItem value="permanent" className="text-red-600 font-bold">TERMINATION</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {banType === 'temporary' && (
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest">Duration (Days)</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 3, 7, 30].map(d => (
                                        <Button key={d} variant={banDays === d ? "default" : "outline"} onClick={() => setBanDays(d)} className={cn(banDays === d && "bg-red-600")}>{d}d</Button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest">Reason</Label>
                            <Textarea value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="e.g., Harassment..." className="bg-muted/30" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="destructive" onClick={handleExecuteBan} className="w-full h-14 text-lg font-black uppercase shadow-lg shadow-red-600/20">CONFIRM EXECUTION</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
