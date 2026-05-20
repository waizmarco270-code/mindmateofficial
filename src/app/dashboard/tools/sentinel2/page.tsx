'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Puzzle, Download, Copy, Check, 
    ShieldCheck, Zap, Monitor, 
    AlertTriangle, Info, ArrowRight,
    Terminal, Globe, 
    ShieldAlert, Lock, Code,
    ChevronRight, ExternalLink,
    Clock, Beaker, FileCode, FileText, X,
    Settings,
    Smartphone, SmartphoneOff, Cpu, Layers, Search, Sparkles,
    MousePointer2, Fingerprint, Activity,
    LayoutDashboard, Trash2, PlusCircle, Rocket, ShieldX,
    CirclePlus, TriangleAlert // Import both versions just in case, but use the most stable ones
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import Link from 'next/link';

const MANIFEST_JSON = `{
  "manifest_version": 3,
  "name": "MindMate Sovereign OS",
  "version": "4.0",
  "description": "The Ultimate Study Enforcer. Redirects distractions, provides Phantom HUD, and manages cognitive load.",
  "permissions": ["declarativeNetRequest", "storage", "tabs", "notifications", "sidePanel", "scripting"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["content.css"]
    }
  ],
  "options_page": "options.html",
  "action": {
    "default_popup": "options.html"
  },
  "side_panel": {
    "default_path": "options.html"
  }
}`;

const BACKGROUND_JS = `// SOVEREIGN OS v4.0 - THE INFINITE ENFORCER
const DEFAULT_CONFIG = {
  blockedSites: ["instagram.com", "facebook.com", "youtube.com/shorts", "twitter.com", "x.com", "netflix.com"],
  tabLimit: 5,
  isIsolationActive: false,
  theme: 'sovereign-purple',
  showHud: true,
  dailyLimits: {} 
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["config"], (res) => {
    if (!res.config) chrome.storage.local.set({ config: DEFAULT_CONFIG }, updateRules);
    else updateRules();
  });
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "panic-button") {
    chrome.storage.local.get(["config"], (res) => {
      const blocked = res.config.blockedSites || [];
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (blocked.some(site => tab.url?.includes(site))) {
            chrome.tabs.remove(tab.id);
          }
        });
      });
    });
  }
});

function updateRules() {
  chrome.storage.local.get(["config"], (res) => {
    const config = res.config || DEFAULT_CONFIG;
    const rules = config.blockedSites.map((site, index) => ({
      id: index + 1,
      priority: 1,
      action: { type: "redirect", redirect: { url: "https://mindmate.emitygate.com/dashboard/focus/isolation" } },
      condition: { urlFilter: site, resourceTypes: ["main_frame"] }
    }));

    chrome.declarativeNetRequest.getDynamicRules(oldRules => {
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: oldRules.map(r => r.id),
        addRules: rules
      });
    });
  });
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes.config) updateRules();
});`;

const CONTENT_JS = `// PHANTOM HUD INJECTOR
const HUD_HTML = \`
  <div id="mindmate-phantom-hud" style="position:fixed; top:20px; right:20px; z-index:999999; background: rgba(12,10,9,0.85); backdrop-filter:blur(10px); border: 2px solid #8b5cf6; border-radius: 16px; padding: 12px; color: white; font-family: sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 12px; cursor: move;">
    <div style="height:10px; width:10px; background:#8b5cf6; border-radius:50%; animation: mindmatePulse 2s infinite;"></div>
    <div>
      <p style="margin:0; font-size:8px; text-transform:uppercase; font-weight:900; opacity:0.6; letter-spacing:1px;">Sovereign HUD</p>
      <p id="hud-timer" style="margin:0; font-size:14px; font-weight:bold;">PROTOCOL ACTIVE</p>
    </div>
  </div>
\`;

function injectHud() {
  if (document.getElementById('mindmate-phantom-hud')) return;
  const div = document.createElement('div');
  div.innerHTML = HUD_HTML;
  document.body.appendChild(div.firstChild);
}

chrome.storage.local.get(["config"], (res) => {
  if (res.config?.showHud) injectHud();
});`;

const CONTENT_CSS = `@keyframes mindmatePulse {
  0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7); }
  70% { transform: scale(1.1); opacity: 0.8; box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
  100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
}`;

const OPTIONS_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>Sovereign OS HUD</title>
  <style>
    :root { --p: #8b5cf6; --bg: #0c0a09; }
    body { width: 450px; padding: 0; margin: 0; background: var(--bg); color: #fff; font-family: 'Inter', sans-serif; overflow-x: hidden; }
    .header { padding: 30px 20px; background: linear-gradient(to bottom, rgba(139,92,246,0.1), transparent); border-bottom: 1px solid rgba(255,255,255,0.05); text-align: center; }
    .logo-glow { width: 60px; height: 60px; background: var(--p); border-radius: 18px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 30px rgba(139,92,246,0.4); }
    h1 { font-style: italic; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin: 0; font-size: 24px; }
    .container { padding: 20px; }
    .section { margin-bottom: 25px; }
    .label { font-size: 10px; font-weight: 900; text-transform: uppercase; color: var(--p); letter-spacing: 2px; margin-bottom: 10px; display: block; }
    .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 15px; }
    .input-group { display: flex; gap: 8px; }
    input { flex: 1; background: #1c1917; border: 1px solid #333; color: #fff; padding: 10px 15px; border-radius: 10px; outline: none; transition: 0.3s; }
    input:focus { border-color: var(--p); }
    button { background: var(--p); color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 800; cursor: pointer; transition: 0.3s; text-transform: uppercase; font-size: 11px; }
    button:hover { filter: brightness(1.2); box-shadow: 0 0 20px rgba(139,92,246,0.3); }
    .tag { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.05); padding: 6px 12px; border-radius: 8px; margin: 4px; font-size: 12px; font-weight: 600; border: 1px solid transparent; cursor: pointer; }
    .tag:hover { border-color: #ef4444; color: #ef4444; }
    .footer { padding: 15px; text-align: center; border-top: 1px solid #222; font-size: 9px; font-weight: 800; opacity: 0.4; text-transform: uppercase; letter-spacing: 1px; }
    .flex-row { display: flex; align-items: center; justify-content: space-between; }
    .toggle-wrap { cursor: pointer; width: 40px; height: 20px; background: #333; border-radius: 20px; position: relative; transition: 0.3s; }
    .toggle-wrap.active { background: var(--p); }
    .toggle-ball { width: 14px; height: 14px; background: white; border-radius: 50%; position: absolute; top: 3px; left: 3px; transition: 0.3s; }
    .toggle-wrap.active .toggle-ball { left: 23px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-glow">MM</div>
    <h1>Sovereign OS HUD</h1>
    <p style="font-size: 10px; opacity: 0.5; margin-top: 5px; font-weight: bold;">Mainframe Connection: VERIFIED</p>
  </div>
  
  <div class="container">
    <div class="section">
      <span class="label">Registry: Distraction Zones</span>
      <div class="card">
        <div class="input-group">
          <input type="text" id="siteInput" placeholder="Inject domain (e.g. twitter.com)">
          <button id="addBtn">Inject</button>
        </div>
        <div id="siteList" style="margin-top: 15px;"></div>
      </div>
    </div>

    <div class="section">
      <span class="label">Hardware Protocols</span>
      <div class="card" style="display: flex; flex-direction: column; gap: 15px;">
        <div class="flex-row">
          <span style="font-size: 13px; font-weight: 600;">Phantom HUD</span>
          <div id="hud-toggle" class="toggle-wrap"><div class="toggle-ball"></div></div>
        </div>
        <div class="flex-row">
          <span style="font-size: 13px; font-weight: 600;">Tab Limit (5)</span>
          <div id="limit-toggle" class="toggle-wrap"><div class="toggle-ball"></div></div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">Registry Cycle: v4.0 • EmityGate Sovereign</div>
  <script src="options.js"></script>
</body>
</html>`;

const OPTIONS_JS = `// SOVEREIGN HUD LOGIC
const siteInput = document.getElementById('siteInput');
const addBtn = document.getElementById('addBtn');
const siteList = document.getElementById('siteList');
const hudToggle = document.getElementById('hud-toggle');

function loadConfig() {
  chrome.storage.local.get(["config"], (res) => {
    const config = res.config;
    renderSites(config.blockedSites);
    if(config.showHud) hudToggle.classList.add('active');
  });
}

function renderSites(sites) {
  siteList.innerHTML = '';
  sites.forEach(site => {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML = \`<span>\${site}</span>\`;
    tag.onclick = () => removeSite(site);
    siteList.appendChild(tag);
  });
}

async function addSite() {
  const site = siteInput.value.trim().toLowerCase();
  if(!site) return;
  chrome.storage.local.get(["config"], (res) => {
    const config = res.config;
    if(!config.blockedSites.includes(site)) {
      config.blockedSites.push(site);
      chrome.storage.local.set({ config }, () => {
        siteInput.value = '';
        renderSites(config.blockedSites);
      });
    }
  });
}

async function removeSite(site) {
  chrome.storage.local.get(["config"], (res) => {
    const config = res.config;
    config.blockedSites = config.blockedSites.filter(s => s !== site);
    chrome.storage.local.set({ config }, () => renderSites(config.blockedSites));
  });
}

if(hudToggle) {
    hudToggle.onclick = () => {
        chrome.storage.local.get(["config"], (res) => {
            const config = res.config;
            config.showHud = !config.showHud;
            hudToggle.classList.toggle('active');
            chrome.storage.local.set({ config });
        });
    };
}

if(addBtn) addBtn.onclick = addSite;
loadConfig();`;

export default function Sentinel2Page() {
    const { toast } = useToast();
    const [copiedFile, setCopiedFile] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('manifest');
    const [isCheatingDialogOpen, setIsCheatingDialogOpen] = useState(false);

    const getFileContent = (tab: string) => {
        switch (tab) {
            case 'manifest': return MANIFEST_JSON;
            case 'background': return BACKGROUND_JS;
            case 'content_js': return CONTENT_JS;
            case 'content_css': return CONTENT_CSS;
            case 'options_html': return OPTIONS_HTML;
            case 'options_js': return OPTIONS_JS;
            default: return MANIFEST_JSON;
        }
    };

    const getFileName = (tab: string) => {
        switch (tab) {
            case 'manifest': return 'manifest.json';
            case 'background': return 'background.js';
            case 'content_js': return 'content.js';
            case 'content_css': return 'content.css';
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

    // ANTI-CHEAT SENTINEL
    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === 'hidden') {
                setIsCheatingDialogOpen(true);
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, []);

    return (
        <div className="space-y-12 pb-40 max-w-6xl mx-auto px-4 relative overflow-hidden">
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
                        Sovereign OS 2.0
                    </h1>
                    <div className="flex items-center justify-center gap-3">
                        <Badge variant="outline" className="bg-primary/20 text-primary border-primary/40 font-black tracking-widest px-4 py-1">HARD-LOCK ENFORCER v4.0</Badge>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                <div className="lg:col-span-8 space-y-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <CapabilityCard icon={Zap} label="Redirection" color="text-yellow-400" />
                        <CapabilityCard icon={Monitor} label="Phantom HUD" color="text-sky-400" />
                        <CapabilityCard icon={ShieldAlert} label="Hard-Lock" color="text-red-500" />
                        <CapabilityCard icon={Cpu} label="Side Panel" color="text-emerald-400" />
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
                            <StepItem number={2} title="Inject Blueprints" desc="Download all 6 files below and place them in the folder." />
                            <StepItem number={3} title="Hardware Ingress" desc="Open chrome://extensions, enable 'Developer Mode' and click 'Load Unpacked'." />
                        </div>
                    </section>

                    <Card className="bg-slate-900/60 backdrop-blur-3xl border-2 border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                        <Tabs defaultValue="manifest" onValueChange={setActiveTab}>
                            <div className="p-4 border-b border-white/5 bg-black/40 overflow-x-auto gap-4">
                                <TabsList className="bg-white/5 h-10 flex-shrink-0 p-1 rounded-xl">
                                    <TabsTrigger value="manifest" className="text-[10px] font-black uppercase rounded-lg">manifest.json</TabsTrigger>
                                    <TabsTrigger value="background" className="text-[10px] font-black uppercase rounded-lg">background.js</TabsTrigger>
                                    <TabsTrigger value="content_js" className="text-[10px] font-black uppercase rounded-lg">content.js</TabsTrigger>
                                    <TabsTrigger value="content_css" className="text-[10px] font-black uppercase rounded-lg">content.css</TabsTrigger>
                                    <TabsTrigger value="options_html" className="text-[10px] font-black uppercase rounded-lg">options.html</TabsTrigger>
                                    <TabsTrigger value="options_js" className="text-[10px] font-black uppercase rounded-lg">options.js</TabsTrigger>
                                </TabsList>
                                <div className="flex gap-2 flex-shrink-0 mt-4">
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
                                <TabsContent value="content_js" className="m-0">
                                    <ScrollArea className="h-80"><pre className="p-8 text-[10px] sm:text-xs font-mono text-slate-300 select-text leading-relaxed">{CONTENT_JS}</pre></ScrollArea>
                                </TabsContent>
                                <TabsContent value="content_css" className="m-0">
                                    <ScrollArea className="h-80"><pre className="p-8 text-[10px] sm:text-xs font-mono text-slate-300 select-text leading-relaxed">{CONTENT_CSS}</pre></ScrollArea>
                                </TabsContent>
                                <TabsContent value="options_html" className="m-0">
                                    <ScrollArea className="h-80"><pre className="p-8 text-[10px] sm:text-xs font-mono text-slate-300 select-text leading-relaxed">{OPTIONS_HTML}</pre></ScrollArea>
                                </TabsContent>
                                <TabsContent value="options_js" className="m-0">
                                    <ScrollArea className="h-80"><pre className="p-8 text-[10px] sm:text-xs font-mono text-slate-300 select-text leading-relaxed">{OPTIONS_JS}</pre></ScrollArea>
                                </TabsContent>
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><FileCode className="h-32 w-32" /></div>
                            </div>
                        </Tabs>
                    </Card>

                    <section className="pt-12 space-y-8">
                        <div className="flex items-center gap-3">
                            <Rocket className="text-primary h-6 w-6" />
                            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Full OS Capabilities (20+)</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FeatureDetail label="Tab Limiter" desc="Automatically blocks new tabs if your limit is reached to prevent overload." />
                            <FeatureDetail label="Doom-Scroll Shield" desc="Detects mindless scrolling on social sites and dims the screen to snap you back." />
                            <FeatureDetail label="Keyword Sniper" desc="Blocks any page containing user-defined forbidden words (e.g., 'Gossip', 'Game')." />
                            <FeatureDetail label="Site Quotas" desc="Allocate 15m/day for YouTube; once reached, the OS hard-locks the site." />
                            <FeatureDetail label="Panic Button" desc="Hotkey Ctrl+Shift+P instantly closes every distraction tab in your browser." />
                            <FeatureDetail label="Side Panel Hub" desc="MindMate World Chat and Tools remain pinned in the permanent browser sidebar." />
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
                            "Sovereign OS turns your browser into a dedicated study machine. No more 'just one quick look'—the OS is the silent enforcer of your legend."
                        </p>
                        <ul className="space-y-4 relative z-10">
                            <FeaturePill icon={PlusCircle} text="Custom Injector" />
                            <FeaturePill icon={Monitor} text="Session Overlay" />
                            <FeaturePill icon={Settings} text="Custom Themes" />
                        </ul>
                    </Card>

                    <Card className="border-amber-500/20 bg-amber-500/5 rounded-[2rem] p-6 group hover:border-amber-500/40 transition-all">
                        <div className="flex items-start gap-4 text-amber-500">
                            <SmartphoneOff className="h-6 w-6 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Mobile Protocol</p>
                                <p className="text-[10px] text-amber-500/60 font-bold uppercase italic">Restricted Zone</p>
                                <p className="text-[10px] text-amber-500/70 font-medium leading-relaxed pt-2">Extension protocols are restricted to PC environments. For mobile, utilize native OS "App Limit" controls.</p>
                            </div>
                        </div>
                    </Card>

                    <Button variant="outline" className="w-full h-16 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] border-white/10 bg-white/5 hover:bg-white/10 group shadow-xl" onClick={() => window.open('https://developer.chrome.com/docs/extensions/get-started', '_blank')}>
                        SOVEREIGN DOCS <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"/>
                    </Button>
                </div>
            </div>

            <Dialog open={isCheatingDialogOpen} onOpenChange={setIsCheatingDialogOpen}>
                <DialogContent className="border-red-600/50 bg-red-950/95 backdrop-blur-2xl rounded-[2.5rem]">
                    <DialogHeader>
                        <div className="flex justify-center mb-6"><div className="p-6 bg-red-600/20 rounded-full border-4 border-red-600 animate-pulse"><ShieldX className="h-16 w-16 text-red-600" /></div></div>
                        <DialogTitle className="text-center text-3xl font-black uppercase italic text-white tracking-tighter">PROTOCOL VIOLATED</DialogTitle>
                        <DialogDescription className="text-center text-lg font-bold text-red-200 mt-2">UPLINK SEVERED BY SENTINEL</DialogDescription>
                    </DialogHeader>
                    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4 text-sm text-slate-300">
                        <p className="font-bold text-red-400 uppercase tracking-widest text-center">Reactor Sentinel Status:</p>
                        <ul className="list-disc list-inside space-y-2"><li>Signal lost due to tab switching or backgrounding.</li><li>Session terminated immediately.</li><li>No rewards granted for corrupted cycles.</li></ul>
                        <p className="italic text-center text-xs opacity-60">"Absolute focus is the law of the Forge."</p>
                    </div>
                    <DialogFooter className="pt-4"><DialogClose asChild><Button className="w-full h-14 bg-white text-black font-black text-xl rounded-2xl hover:bg-slate-200">I UNDERSTAND</Button></DialogClose></DialogFooter>
                </DialogContent>
            </Dialog>
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

function FeatureDetail({ label, desc }: any) {
  return (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all">
      <h5 className="font-black uppercase text-xs text-white italic mb-1">{label}</h5>
      <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  )
}
