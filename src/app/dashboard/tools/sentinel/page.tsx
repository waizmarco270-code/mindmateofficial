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
    Smartphone, SmartphoneOff
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
  "version": "2.0",
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

const BACKGROUND_JS = `// SOVEREIGN SENTINEL v2.0 - DYNAMIC ENFORCER
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

console.log("Sentinel v2.0 Pulse Active.");`;

const OPTIONS_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>Sentinel Control Matrix</title>
  <style>
    body { 
      width: 400px; padding: 20px; background: #0c0a09; color: #fff; 
      font-family: 'Segoe UI', sans-serif; border: 2px solid #8b5cf6; 
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
  
  <div class="status">● Connection Secure</div>

  <script src="options.js"></script>
</body>
</html>`;

const OPTIONS_JS = `// SENTINEL REGISTRY LOGIC
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
        toast({ title: "Blueprint Secured", description: `${fileName} copied to clipboard.` });
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
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">Sovereign Sentinel v2.0</h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Protocol: Absolute Web Enforcer</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                <div className="lg:col-span-7 space-y-8">
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Terminal className="text-primary h-6 w-6" />
                            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Advanced Deployment</h2>
                        </div>
                        <div className="space-y-4">
                            <StepItem number={1} title="Fabricate Registry" desc="Create a folder on your PC named 'mindmate-sentinel'." />
                            <StepItem number={2} title="Inject Mission Files" desc="Download ALL FOUR files below (Manifest, Background, Options HTML, Options JS) and place them in your folder." />
                            <StepItem number={3} title="Initialize Ingress" desc="Open chrome://extensions. Enable 'Developer Mode' and click 'Load Unpacked'." />
                            <StepItem number={4} title="Manage Control Matrix" desc="Right-click the extension icon > Options to manually add or remove blocked distraction zones." />
                        </div>
                    </section>

                    <Card className="bg-slate-900/60 border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <Tabs defaultValue="manifest" onValueChange={setActiveTab}>
                            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 overflow-x-auto gap-4">
                                <TabsList className="bg-black/40 h-10 flex-shrink-0">
                                    <TabsTrigger value="manifest" className="text-[10px] font-black uppercase">manifest.json</TabsTrigger>
                                    <TabsTrigger value="background" className="text-[10px] font-black uppercase">background.js</TabsTrigger>
                                    <TabsTrigger value="options_html" className="text-[10px] font-black uppercase">options.html</TabsTrigger>
                                    <TabsTrigger value="options_js" className="text-[10px] font-black uppercase">options.js</TabsTrigger>
                                </TabsList>
                                <div className="flex gap-2 flex-shrink-0">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 font-black uppercase text-[10px] tracking-widest text-primary hover:bg-primary/10"
                                        onClick={() => handleCopy(activeTab)}
                                    >
                                        {copiedFile === getFileName(activeTab) ? <Check className="mr-1.5 h-3 w-3"/> : <Copy className="mr-1.5 h-3 w-3"/>}
                                        COPY
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 font-black uppercase text-[10px] tracking-widest border-primary/20 bg-primary/5 hover:bg-primary/20 text-primary"
                                        onClick={() => handleDownload(activeTab)}
                                    >
                                        <Download className="mr-1.5 h-3 w-3"/> DOWNLOAD
                                    </Button>
                                </div>
                            </div>
                            <div className="bg-black/40">
                                <TabsContent value="manifest" className="m-0">
                                    <ScrollArea className="h-80"><pre className="p-8 text-[10px] sm:text-xs font-mono text-slate-300 select-text">{MANIFEST_JSON}</pre></ScrollArea>
                                </TabsContent>
                                <TabsContent value="background" className="m-0">
                                    <ScrollArea className="h-80"><pre className="p-8 text-[10px] sm:text-xs font-mono text-slate-300 select-text">{BACKGROUND_JS}</pre></ScrollArea>
                                </TabsContent>
                                <TabsContent value="options_html" className="m-0">
                                    <ScrollArea className="h-80"><pre className="p-8 text-[10px] sm:text-xs font-mono text-slate-300 select-text">{OPTIONS_HTML}</pre></ScrollArea>
                                </TabsContent>
                                <TabsContent value="options_js" className="m-0">
                                    <ScrollArea className="h-80"><pre className="p-8 text-[10px] sm:text-xs font-mono text-slate-300 select-text">{OPTIONS_JS}</pre></ScrollArea>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </Card>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <Card className="bg-primary/5 border-primary/20 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <h4 className="font-black uppercase text-sm tracking-widest text-white">PC Authorization Required</h4>
                        </div>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed italic">
                            "The Sentinel is a system-level enforcer designed to bridge the gap between web application and hardware discipline."
                        </p>
                        <ul className="space-y-4">
                            <FeaturePill icon={ListPlus} text="Custom Site Injection" />
                            <FeaturePill icon={Shield} text="Dynamic Redirector" />
                            <FeaturePill icon={Settings} text="Extension Options HUD" />
                        </ul>
                    </Card>

                    <Card className="border-amber-500/20 bg-amber-500/5 rounded-[2rem] p-6">
                        <div className="flex items-start gap-4 text-amber-500">
                            <SmartphoneOff className="h-5 w-5 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                    Mobile Compatibility Briefing
                                </p>
                                <p className="text-[10px] text-amber-500/70 font-medium">Extension protocols are restricted to PC environments (Chrome/Edge/Brave). For mobile focus, utilize native iOS/Android "App Limit" settings in conjunction with the MindMate PWA.</p>
                            </div>
                        </div>
                    </Card>

                    <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest border-white/10" onClick={() => window.open('https://developer.chrome.com/docs/extensions/get-started', '_blank')}>
                        DEVELOPER DOCUMENTATION <ExternalLink className="ml-2 h-3.5 w-3.5"/>
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
