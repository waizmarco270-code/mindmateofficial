
/**
 * @fileOverview Sovereign OS Fabrication Logic
 * Generates the Chrome Extension ZIP archive for direct client download.
 */

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
  showHud: true
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["config"], (res) => {
    if (!res.config) chrome.storage.local.set({ config: DEFAULT_CONFIG }, updateRules);
    else updateRules();
  });
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
  <div id="mindmate-phantom-hud" style="position:fixed; top:20px; right:20px; z-index:999999; background: rgba(12,10,9,0.85); backdrop-filter:blur(10px); border: 2px solid #8b5cf6; border-radius: 16px; padding: 12px; color: white; font-family: sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 12px;">
    <div style="height:10px; width:10px; background:#8b5cf6; border-radius:50%; animation: mmPulse 2s infinite;"></div>
    <div>
      <p style="margin:0; font-size:8px; text-transform:uppercase; font-weight:900; opacity:0.6; letter-spacing:1px;">Sovereign HUD</p>
      <p style="margin:0; font-size:14px; font-weight:bold;">PROTOCOL ACTIVE</p>
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

const CONTENT_CSS = `@keyframes mmPulse {
  0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7); }
  70% { transform: scale(1.1); opacity: 0.8; box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
  100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
}`;

const OPTIONS_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>Sovereign OS HUD</title>
  <style>
    body { width: 400px; background: #0c0a09; color: #fff; font-family: system-ui; padding: 20px; }
    .card { background: #1c1917; border-radius: 12px; padding: 15px; margin-top: 10px; }
    h1 { font-style: italic; color: #8b5cf6; text-transform: uppercase; font-size: 20px; }
    button { background: #8b5cf6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Sovereign OS</h1>
  <div class="card">
    <p>Distraction Control Matrix: ACTIVE</p>
    <button id="saveBtn">SYNC CONFIG</button>
  </div>
  <script src="options.js"></script>
</body>
</html>`;

const OPTIONS_JS = `console.log("Sovereign Options Loaded");`;

const README_TXT = `MINDMATE SOVEREIGN OS v4.0 - INSTALLATION PROTOCOL

1. Extract this ZIP file into a folder on your computer (e.g., C:\\SovereignOS).
2. Open Google Chrome (or any Chromium browser like Brave/Edge).
3. Navigate to chrome://extensions
4. Enable "Developer mode" in the top right corner.
5. Click the "Load unpacked" button.
6. Select the folder where you extracted the files.
7. Pin the extension to your toolbar.
8. Stay focused. Claim your legend.

FORGE COMPLETE.`;

export async function downloadSovereignOS() {
    const JSZip = (await import('jszip')).default;
    const { saveAs } = (await import('file-saver'));
    
    const zip = new JSZip();
    
    zip.file("manifest.json", MANIFEST_JSON);
    zip.file("background.js", BACKGROUND_JS);
    zip.file("content.js", CONTENT_JS);
    zip.file("content.css", CONTENT_CSS);
    zip.file("options.html", OPTIONS_HTML);
    zip.file("options.js", OPTIONS_JS);
    zip.file("README.txt", README_TXT);
    
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "MindMate-Sovereign-OS.zip");
}
