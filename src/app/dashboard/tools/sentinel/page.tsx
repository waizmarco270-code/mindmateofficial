'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Puzzle, Download, Copy, Check, 
    ShieldCheck, Zap, Monitor, 
    AlertTriangle, Info, ArrowRight,
    FileCode, Terminal, Globe, 
    ShieldAlert, Lock, Code,
    ChevronRight, ExternalLink,
    Clock, Beaker, FileJson, FileText, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const MANIFEST_JSON = `{
  "manifest_version": 3,
  "name": "MindMate Sovereign Sentinel",
  "version": "1.0",
  "description": "Official Enforcer of the MindMate Empire. Redirects distractions during Isolation.",
  "permissions": ["declarativeNetRequest", "storage"],
  "host_permissions": ["*://*.instagram.com/*", "*://*.youtube.com/*"],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html"
  }
}`;

const BACKGROUND_JS = `// SOVEREIGN SENTINEL - BACKGROUND PULSE
const HAZARD_ZONES = [
  "*://*.instagram.com/*",
  "*://*.facebook.com/*",
  "*://*.youtube.com/shorts/*"
];

chrome.declarativeNetRequest.updateDynamicRules({
  addRules: [{
    "id": 1,
    "priority": 1,
    "action": { "type": "redirect", "redirect": { "url": "https://mindmate.emitygate.com/dashboard/focus/isolation" } },
    "condition": { "urlFilter": "instagram.com", "resourceTypes": ["main_frame"] }
  }],
  removeRuleIds: [1]
});

console.log("Sentinel Pulse Active.");`;

export default function SentinelExtensionPage() {
    const { toast } = useToast();
    const [copiedFile, setCopiedFile] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('manifest');

    const handleCopy = (content: string, fileName: string) => {
        navigator.clipboard.writeText(content);
        setCopiedFile(fileName);
        toast({ title: "Blueprint Secured", description: `${fileName} copied to clipboard.` });
        setTimeout(() => setCopiedFile(null), 2000);
    };

    const handleDownload = (content: string, fileName: string) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        toast({ title: "Blueprint Manifested", description: `${fileName} has been downloaded.` });
    };

    return (
        <div className="space-y-12 pb-40 max-w-5xl mx-auto px-4 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 blue-nebula-bg opacity-30" />
                <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
            </div>

            <header className="text-center space-y-4 relative z-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto w-24 h-24 rounded-[2.5rem] bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-2xl backdrop-blur-md">
                    <Puzzle className="h-12 w-12 text-primary animate-pulse" />
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">Sovereign Sentinel</h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Protocol: Browser Hardware Integration</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                <div className="lg:col-span-7 space-y-8">
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Terminal className="text-primary h-6 w-6" />
                            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Deployment Protocol</h2>
                        </div>
                        <div className="space-y-4">
                            <StepItem number={1} title="Fabricate Registry" desc="Create a folder on your PC named 'mindmate-sentinel'." />
                            <StepItem number={2} title="Inject Blueprints" desc="Download the 'manifest.json' and 'background.js' files below and move them into your folder." />
                            <StepItem number={3} title="Initialize Ingress" desc="Open chrome://extensions in your browser. Toggle 'Developer Mode' (Top Right)." />
                            <StepItem number={4} title="Deploy Sentinel" desc="Click 'Load Unpacked' and select your 'mindmate-sentinel' folder. The Sentinel is now online." />
                        </div>
                    </section>

                    <Card className="bg-slate-900/60 border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <Tabs defaultValue="manifest" onValueChange={setActiveTab}>
                            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                                <TabsList className="bg-black/40 h-10">
                                    <TabsTrigger value="manifest" className="text-[10px] font-black uppercase">manifest.json</TabsTrigger>
                                    <TabsTrigger value="background" className="text-[10px] font-black uppercase">background.js</TabsTrigger>
                                </TabsList>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 font-black uppercase text-[10px] tracking-widest text-primary hover:bg-primary/10"
                                        onClick={() => handleCopy(activeTab === 'manifest' ? MANIFEST_JSON : BACKGROUND_JS, activeTab === 'manifest' ? 'manifest.json' : 'background.js')}
                                    >
                                        {copiedFile === (activeTab === 'manifest' ? 'manifest.json' : 'background.js') ? <Check className="mr-1.5 h-3 w-3"/> : <Copy className="mr-1.5 h-3 w-3"/>}
                                        COPY
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 font-black uppercase text-[10px] tracking-widest border-primary/20 bg-primary/5 hover:bg-primary/20 text-primary"
                                        onClick={() => handleDownload(activeTab === 'manifest' ? MANIFEST_JSON : BACKGROUND_JS, activeTab === 'manifest' ? 'manifest.json' : 'background.js')}
                                    >
                                        <Download className="mr-1.5 h-3 w-3"/> DOWNLOAD
                                    </Button>
                                </div>
                            </div>
                            <TabsContent value="manifest" className="m-0">
                                <ScrollArea className="h-80">
                                    <pre className="p-8 text-[10px] sm:text-xs font-mono text-slate-300 leading-relaxed bg-black/40 select-text">
                                        {MANIFEST_JSON}
                                    </pre>
                                </ScrollArea>
                            </TabsContent>
                            <TabsContent value="background" className="m-0">
                                <ScrollArea className="h-80">
                                    <pre className="p-8 text-[10px] sm:text-xs font-mono text-slate-300 leading-relaxed bg-black/40 select-text">
                                        {BACKGROUND_JS}
                                    </pre>
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    </Card>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <Card className="bg-primary/5 border-primary/20 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <h4 className="font-black uppercase text-sm tracking-widest text-white">Sovereign Authority</h4>
                        </div>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed italic">
                            "The Sentinel Extension bypasses standard web limitations. It enforces the redirection of Distraction Signal back to the Isolation Hub, ensuring your academic exile is absolute."
                        </p>
                        <ul className="space-y-4">
                            <FeaturePill icon={Zap} text="Force Redirection" />
                            <FeaturePill icon={Clock} text="Global Timer HUD" />
                            <FeaturePill icon={ShieldAlert} text="Breach Logging" />
                        </ul>
                    </Card>

                    <Card className="border-amber-500/20 bg-amber-500/5 rounded-[2rem] p-6">
                        <div className="flex items-start gap-4 text-amber-500">
                            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                    Protocol Notice
                                </p>
                                <p className="text-[10px] text-amber-500/70 font-medium">The Sentinel requires manual installation on PC. Mobile users are enforced through in-app hard-locks.</p>
                            </div>
                        </div>
                    </Card>

                    <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest border-white/10" onClick={() => window.open('https://developer.chrome.com/docs/extensions/get-started', '_blank')}>
                        LEARN MORE ABOUT EXTENSIONS <ExternalLink className="ml-2 h-3.5 w-3.5"/>
                    </Button>
                </div>
            </div>
        </div>
    );
}

function StepItem({ number, title, desc }: { number: number, title: string, desc: string }) {
    return (
        <div className="flex gap-6 group">
            <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center font-black text-primary transition-all group-hover:bg-primary group-hover:text-white group-hover:scale-110 shadow-lg">
                    {number}
                </div>
                <div className="w-px flex-1 bg-white/5 my-2" />
            </div>
            <div className="pb-8">
                <h4 className="text-lg font-black uppercase italic tracking-tight text-white">{title}</h4>
                <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function FeaturePill({ icon: Icon, text }: { icon: any, text: string }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/40 border border-white/5 transition-all hover:border-primary/20 group">
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 text-primary transition-all">
                <Icon className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{text}</span>
        </div>
    );
}
