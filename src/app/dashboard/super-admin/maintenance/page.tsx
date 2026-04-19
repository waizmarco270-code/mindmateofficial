'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin, type MaintenanceTheme } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { Terminal, Megaphone, Loader2, Save, Coins } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function MaintenanceControlPage() {
    const { appSettings, updateAppSettings } = useAdmin();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const [isMaintenanceMode, setIsMaintenanceMode] = useState(appSettings?.isMaintenanceMode || false);
    const [maintenanceMessage, setMaintenanceMessage] = useState(appSettings?.maintenanceMessage || '');
    const [maintenanceTheme, setMaintenanceTheme] = useState<MaintenanceTheme>(appSettings?.maintenanceTheme || 'shiny');
    const [whatsNewMessage, setWhatsNewMessage] = useState(appSettings?.whatsNewMessage || '');
    const [startingCredits, setStartingCredits] = useState(appSettings?.startingCredits || 200);

    useEffect(() => {
        if (appSettings) {
            setIsMaintenanceMode(appSettings.isMaintenanceMode || false);
            setMaintenanceMessage(appSettings.maintenanceMessage || '');
            setMaintenanceTheme(appSettings.maintenanceTheme || 'shiny');
            setWhatsNewMessage(appSettings.whatsNewMessage || '');
            setStartingCredits(appSettings.startingCredits || 200);
        }
    }, [appSettings]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateAppSettings({
                isMaintenanceMode,
                maintenanceMessage,
                maintenanceTheme,
                whatsNewMessage,
                startingCredits: Number(startingCredits),
                lastMaintenanceId: isMaintenanceMode ? Date.now().toString() : appSettings?.lastMaintenanceId,
            });
            toast({ title: "Mainframe Configuration Updated" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-20">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <Card className="border-amber-500/20 bg-amber-500/5">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 uppercase italic text-amber-500"><Terminal className="h-4 w-4"/> Protocol: Lockdown</CardTitle>
                        <CardDescription>Manually trigger maintenance mode across the entire network.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-background border">
                            <Label className="font-bold cursor-pointer" htmlFor="main-toggle">Maintenance Active</Label>
                            <Switch id="main-toggle" checked={isMaintenanceMode} onCheckedChange={setIsMaintenanceMode} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Banner Theme</Label>
                            <Select value={maintenanceTheme} onValueChange={(v: any) => setMaintenanceTheme(v)}>
                                <SelectTrigger className="font-bold"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="shiny" className="font-bold">Shiny (Default)</SelectItem>
                                    <SelectItem value="forest" className="font-bold">Forest</SelectItem>
                                    <SelectItem value="sunflower" className="font-bold">Sunflower</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status Message</Label>
                            <Textarea value={maintenanceMessage} onChange={e => setMaintenanceMessage(e.target.value)} placeholder="System upgrades in progress..." />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-emerald-500/20 bg-emerald-500/5">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2 uppercase italic text-emerald-500"><Coins className="h-4 w-4"/> Economy Config</CardTitle>
                            <CardDescription>Manage starting assets for new legends.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Starting Credits</Label>
                                <Input 
                                    type="number" 
                                    value={startingCredits} 
                                    onChange={e => setStartingCredits(Number(e.target.value))} 
                                    className="h-12 text-xl font-black bg-black/20"
                                />
                                <p className="text-[9px] text-muted-foreground italic">Applied automatically during first-time user initialization.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2 uppercase italic text-primary"><Megaphone className="h-4 w-4"/> Pulse: What's New</CardTitle>
                            <CardDescription>The briefing citizens see after maintenance is lifted.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operational Changelog</Label>
                                <Textarea 
                                    value={whatsNewMessage} 
                                    onChange={e => setWhatsNewMessage(e.target.value)} 
                                    placeholder="Brief the citizens on new protocols..." 
                                    className="min-h-[100px]"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full h-16 text-xl font-black uppercase shadow-xl shadow-primary/20 rounded-2xl">
                {isSaving ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2 h-6 w-6"/>}
                COMMIT CONFIGURATION
            </Button>
        </div>
    );
}
