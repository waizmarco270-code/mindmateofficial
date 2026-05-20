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
    Clock, Beaker, FileJson, FileText, X,
    Settings, ListPlus, Shield,
    Smartphone, Cpu, Layers, Search, Sparkles,
    MousePointer2, Fingerprint, Activity,
    LayoutDashboard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const MANIFEST_JSON = `{
  "manifest_version": 3,
  "name": "MindMate Sovereign Sentinel",
  "version": "2.5",
  "description": "Official Enforcer of the MindMate Empire. Redirects distractions during Isolation.",
  "permissions": ["declarativeNetRequest", "storage"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "background.js"
  },
  "options_page": "options.html",
  "action": {
    "default_popup": "options.html"
  }
}`;

const BACKGROUND_JS = `// SOVEREIGN SENTINEL v2.5 - HARD-LOCK ENFORCER
const DEFAULT_BLOCKLIST = ["instagram.com", "facebook.com", "youtube.com/shorts", "twitter.com", "x.com", "netflix.com"];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["blockedSites"], (result) => {
    if (!result.blockedSites) {
      chrome.storage.local.set({ blockedSites: DEFAULT_BLOCKLIST }, updateRules);
    } else {
      updateRules();
    }
  });
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedSites) updateRules();
});

function updateRules() {
  chrome.storage.local.get(["blockedSites"], (result) => {
    const sites = result.blockedSites || [];
    const rules = sites.map((site, index) => ({
      id: index + 1,
      priority: 1,
      action: { type: "redirect", redirect: { url: "https://mindmate.emitygate.com/dashboard/focus/isolation" } },
      condition: { urlFilter: site, resourceTypes: ["main_frame"] }
    }));

    chrome.declarativeNetRequest.getDynamicRules(oldRules => {
      const oldRuleIds = oldRules.map(r => r.id);
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: oldRuleIds,
        addRules: rules
      });
    });
  });
}

console.log("Sentinel Pulse: OPERATIONAL.");`;

const OPTIONS_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>Sentinel Control HUD</title>
  <style>
    body { 
      width: 400px; padding: 20px; background: #0c0a09; color: #fff; 
      font-family: 'Inter', sans-serif; border: 2px solid #8b5cf6; 
    }
    .header { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 15px; }
    h2 { color: #8b5cf6; text-transform: uppercase; font-style: italic; font-weight: 900; margin: 0; }
    .input-group { display: flex; gap: 10px; margin-bottom: 20px; }
    input { 
      flex: 1; background: #1c1917; border: 1px solid #444; color: #fff; 
      padding: 10px; border-radius: 8px; outline: none; 
    }
    input:focus { border-color: #8b5cf6; }
    button { 
      background: #8b5cf6; color: #fff; border: none; padding: 10px 15px; 
      border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.3s;
    }
    button:hover { background: #7c3aed; box-shadow: 0 0 15px rgba(139, 92, 246, 0.4); }
    .site-list { list-style: none; padding: 0; margin: 0; }
    .site-item { 
      display: flex; justify-content: space-between; align-items: center; 
      padding: 10px; background: rgba(255,255,255,0.05); margin-bottom: 5px; 
      border-radius: 8px; font-size: 13px; font-weight: 600;
    }
    .remove-btn { background: #ef4444; padding: 5px 10px; font-size: 10px; }
    .status { font-size: 10px; color: #10b981; text-align: center; margin-top: 15px; text-transform: uppercase; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="header">
    <h2>Sentinel Control</h2>
    <p style="font-size: 10px; opacity: 0.6; margin-top: 5px;">MINDMATE HARD-LOCK PROTOCOL</p>
  </div>
  
  <div class="input-group">
    <input type="text" id="siteInput" placeholder="e.g. facebook.com">
    <button id="addBtn">INJECT</button>
  </div>

  <ul id="siteList" class="site-list"></ul>
  
  <div class="status">● Pulse Verified</div>

  <script src="options.js"></script>
</body>
</html>`;

const OPTIONS_JS = `// SENTINEL HUB REGISTRY
const siteInput = document.getElementById('siteInput');
const addBtn = document.getElementById('addBtn');
const siteList = document.getElementById('siteList');

function renderList() {
  chrome.storage.local.get(['blockedSites'], (result) => {
    const sites = result.blockedSites || [];
    siteList.innerHTML = '';
    sites.forEach((site) => {
      const li = document.createElement('li');
      li.className = 'site-item';
      li.innerHTML = \`
        <span>\${site}</span>
        <button class="remove-btn" data-site="\${site}">PURGE</button>
      \`;
      siteList.appendChild(li);
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.onclick = (e) => removeSite(e.target.dataset.site);
    });
  });
}

function addSite() {
  const site = siteInput.value.trim().toLowerCase();
  if (site) {
    chrome.storage.local.get(['blockedSites'], (result) => {
      const sites = result.blockedSites || [];
      if (!sites.includes(site)) {
        const newSites = [...sites, site];
        chrome.storage.local.set({ blockedSites: newSites }, () => {
          siteInput.value = '';
          renderList();
        });
      }
    });
  }
}

function removeSite(site) {
  chrome.storage.local.get(['blockedSites'], (result) => {
    const sites = result.blockedSites || [];
    const newSites = sites.filter(s => s !== site);
    chrome.storage.local.set({ blockedSites: newSites }, renderList);
  });
}

addBtn.onclick = addSite;
siteInput.onkeypress = (e) => { if(e.key === 'Enter') addSite(); };
renderList();`;

const SmartphoneOff = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2M19 13V5a2 2 0 0 0-2-2H9"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

export default function SentinelExtensionPage() {
    const { toast } = useToast();
    const [copiedFile, setCopiedFile] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('manifest');

    const getFileContent = (tab: string) => {
        switch (tab) {
            case 'manifest': return MANIFEST_JSON;
            case 'background': return BACKGROUND_JS;
            case 'options_html': return OPTIONS_HTML;
            case 'options_js': return OPTIONS_JS;
            default: return MANIFEST_JSON;
        }
    };

    const getFileName = (tab: string) => {
        switch (tab) {
            case 'manifest': return 'manifest.json';
            case 'background': return 'background.js';
            case 'options_html': return 'options.html';
            case 'options_js': return 'options.js';
            default: return 'manifest.json';
        }
    };

    const handleCopy = (tab: string) => {
        const content = getFileContent(tab);
        const fileName = getFileName(tab);
        navigator.clipboard.writeText(content);
        setCopiedFile(fileName);
        toast({ title: "BLUEPRINT SECURED", description: `${fileName} copied to clipboard.` });
        setTimeout(() => setCopiedFile(null), 2000);
    };

    const handleDownload = (tab: string) => {
        const content = getFileContent(tab);
        const fileName = getFileName(tab);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        toast({ title: "SIGNAL MANIFESTED", description: `${fileName} downloaded.` });
    };

    return (
        <div className="space-y-12 pb-40 max-w-6xl mx-auto px-4 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 blue-nebula-bg opacity-30" />
                <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
            </div>

            <header className="text-center space-y-6 relative z-10 pt-8">
                <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="mx-auto w-24 h-24 rounded-[2.5rem] bg-primary/10 border-2 border-primary/20 shadow-[0_0_50px_rgba(139,92,246,0.3)] backdrop-blur-md flex items-center justify-center relative"
                >
                    <Puzzle className="h-12 w-12 text-primary animate-pulse" />
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                        className="absolute -inset-4 border border-dashed border-primary/30 rounded-full"
                    />
                </motion.div>
                <div className="space-y-2">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-white via-white to-slate-500 bg-clip-text text-transparent">
                        Sovereign Sentinel
                    </h1>
                    <div className="flex items-center justify-center gap-3">
                        <Badge variant="outline" className="bg-primary/20 text-primary border-primary/40 font-black tracking-widest px-4 py-1">HARD-LOCK PROTOCOL v2.5</Badge>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                <div className="lg:col-span-8 space-y-8">
                    {/* Capability HUD */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <CapabilityCard icon={Zap} label="Redirection" color="text-yellow-400" />
                        <CapabilityCard icon={Clock} label="Focus Sync" color="text-sky-400" />
                        <CapabilityCard icon={ShieldAlert} label="Hard-Lock" color="text-red-500" />
                    </div>

                    <section className="space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4 px-2">
                            <div className="flex items-center gap-3">
                                <Terminal className="text-primary h-6 w-6" />
                                <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Fabrication Lab</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">Uplink Ready</span>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <StepItem number={1} title="Local Workspace" desc="Create a directory named 'mindmate-sentinel' on your PC." />
                            <StepItem number={2} title="Inject Blueprints" desc="Download all 4 files below and place them in the folder." />
                            <StepItem number={3} title="Hardware Ingress" desc="Open chrome://extensions, enable 'Developer Mode' and click 'Load Unpacked'." />
                        </div>
                    </section>

                    <Card className="bg-slate-900/60 backdrop-blur-3xl border-2 border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                        <Tabs defaultValue="manifest" onValueChange={setActiveTab}>
                            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40 overflow-x-auto gap-4">
                                <TabsList className="bg-white/5 h-10 flex-shrink-0 p-1 rounded-xl">
                                    <TabsTrigger value="manifest" className="text-[10px] font-black uppercase rounded-lg">manifest.json</TabsTrigger>
                                    <TabsTrigger value="background" className="text-[10px] font-black uppercase rounded-lg">background.js</TabsTrigger>
                                    <TabsTrigger value="options_html" className="text-[10px] font-black uppercase rounded-lg">options.html</TabsTrigger>
                                    <TabsTrigger value="options_js" className="text-[10px] font-black uppercase rounded-lg">options.js</TabsTrigger>
                                </TabsList>
                                <div className="flex gap-2 flex-shrink-0">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-9 rounded-xl font-black uppercase text-[10px] tracking-widest text-primary hover:bg-primary/10"
                                        onClick={() => handleCopy(activeTab)}
                                    >
                                        {copiedFile === getFileName(activeTab) ? <Check className="mr-2 h-3.5 w-3.5"/> : <Copy className="mr-2 h-3.5 w-3.5"/>}
                                        COPY
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-9 rounded-xl font-black uppercase text-[10px] tracking-widest border-primary/20 bg-primary/5 hover:bg-primary/20 text-primary shadow-lg shadow-primary/5"
                                        onClick={() => handleDownload(activeTab)}
                                    >
                                        <Download className="mr-2 h-3.5 w-3.5"/> DOWNLOAD
                                    </Button>
                                </div>
                            </div>
                            <div className="bg-black/60 relative">
                                <TabsContent value="manifest" className="m-0">
                                    <ScrollArea className="h-80"><pre className="p-8 text-[10px] sm:text-xs font-mono text-slate-300 select-text leading-relaxed">{MANIFEST_JSON}</pre></ScrollArea>
                                </TabsContent>
                                <TabsContent value="background" className="m-0">
                                    <ScrollArea className="h-80"><pre className="p-8 text-[10px] sm:text-xs font-mono text-slate-300 select-text leading-relaxed">{BACKGROUND_JS}</pre></ScrollArea>
                                </TabsContent>
                                <TabsContent value="options_html" className="m-0">
                                    <ScrollArea className="h-80"><pre className="p-8 text-[10px] sm:text-xs font-mono text-slate-300 select-text leading-relaxed">{OPTIONS_HTML}</pre></ScrollArea>
                                </TabsContent>
                                <TabsContent value="options_js" className="m-0">
                                    <ScrollArea className="h-80"><pre className="p-8 text-[10px] sm:text-xs font-mono text-slate-300 select-text leading-relaxed">{OPTIONS_JS}</pre></ScrollArea>
                                </TabsContent>
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><FileJson className="h-32 w-32" /></div>
                            </div>
                        </Tabs>
                    </Card>

                    {/* FUTURE OS ROADMAP SECTION */}
                    <section className="pt-12 space-y-8">
                        <div className="flex items-center gap-3">
                            <Rocket className="text-primary h-6 w-6" />
                            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Project: Sovereign OS</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FutureModule 
                                icon={Monitor} 
                                label="Phantom HUD" 
                                desc="Floating overlay showing your timer and tasks over ANY website." 
                                status="CONCEPT"
                            />
                            <FutureModule 
                                icon={MousePointer2} 
                                label="Contextual Ingress" 
                                desc="Right-click any web content to instantly save to your Vault." 
                                status="CONCEPT"
                            />
                            <FutureModule 
                                icon={Shield} 
                                label="Tab Isolation" 
                                desc="Forcefully close non-work tabs the moment Isolation starts." 
                                status="PLANNED"
                            />
                            <FutureModule 
                                icon={LayoutDashboard} 
                                label="Sidebar Terminal" 
                                desc="MindMate Forum and Tools available in the permanent Side Panel." 
                                status="RESEARCH"
                            />
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-primary/5 border-primary/20 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xl">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <h4 className="font-black uppercase text-sm tracking-widest text-white leading-tight">Hardware Control Matrix</h4>
                        </div>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed italic relative z-10">
                            "The Sentinel is the bridge between the digital vault and your local machine. It ensures that when you choose Isolation, the browser complies."
                        </p>
                        <ul className="space-y-4 relative z-10">
                            <FeaturePill icon={ListPlus} text="Custom Injector" />
                            <FeaturePill icon={Monitor} text="Session Overlay" />
                            <FeaturePill icon={Settings} text="HUD Control" />
                        </ul>
                    </Card>

                    <Card className="border-amber-500/20 bg-amber-500/5 rounded-[2rem] p-6 group hover:border-amber-500/40 transition-all">
                        <div className="flex items-start gap-4 text-amber-500">
                            <SmartphoneOff className="h-6 w-6 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                    Mobile Compliance Status
                                </p>
                                <p className="text-[10px] text-amber-500/60 font-bold uppercase italic">PC Only • Restricted Environment</p>
                                <p className="text-[10px] text-amber-500/70 font-medium leading-relaxed pt-2">Extension APIs are restricted to PC environments. For mobile, utilize native OS "App Limit" protocols linked to the MindMate PWA.</p>
                            </div>
                        </div>
                    </Card>

                    <Button variant="outline" className="w-full h-16 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] border-white/10 bg-white/5 hover:bg-white/10 group shadow-xl" onClick={() => window.open('https://developer.chrome.com/docs/extensions/get-started', '_blank')}>
                        SOVEREIGN DOCS <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"/>
                    </Button>
                </div>
            </div>
        </div>
    );
}

function CapabilityCard({ icon: Icon, label, color }: { icon: any, label: string, color: string }) {
    return (
        <Card className="bg-black/20 border-white/5 rounded-3xl p-6 flex flex-col items-center gap-3 transition-all hover:border-primary/20 hover:scale-105 group">
            <div className={cn("p-4 rounded-2xl bg-white/5 border border-white/10 transition-all group-hover:scale-110", color)}>
                <Icon className="h-6 w-6" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
        </Card>
    );
}

function StepItem({ number, title, desc }: { number: number, title: string, desc: string }) {
    return (
        <div className="flex gap-6 group">
            <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center font-black text-primary transition-all group-hover:bg-primary group-hover:text-white group-hover:scale-110 shadow-lg relative">
                    <span className="relative z-10">{number}</span>
                    <div className="absolute inset-0 bg-primary opacity-0 blur-xl group-hover:opacity-20 transition-opacity" />
                </div>
                <div className="w-px flex-1 bg-white/5 my-2" />
            </div>
            <div className="pb-8 pt-1">
                <h4 className="text-xl font-black uppercase italic tracking-tight text-white">{title}</h4>
                <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function FeaturePill({ icon: Icon, text }: { icon: any, text: string }) {
    return (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/40 border border-white/5 transition-all hover:border-primary/40 group hover:shadow-lg hover:shadow-primary/5">
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 text-primary transition-all">
                <Icon className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{text}</span>
        </div>
    );
}

function FutureModule({ icon: Icon, label, desc, status }: any) {
    return (
        <Card className="bg-white/5 border-white/5 rounded-[2rem] p-6 hover:border-primary/20 transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <Icon className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="text-[8px] font-black tracking-widest">{status}</Badge>
            </div>
            <h4 className="font-black uppercase italic text-white text-lg">{label}</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">{desc}</p>
        </Card>
    );
}
