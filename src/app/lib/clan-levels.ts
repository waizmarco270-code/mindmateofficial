
export interface ClanLevel {
    level: number;
    name: string;
    xpRequired: number;
    memberLimit: number;
    avatarBorderClass: string;
    bannerUnlock?: string; // ID of the banner from group-assets
}

export const clanLevelConfig: ClanLevel[] = [
    // Level 1 (Starting Level)
    {
        level: 1,
        name: "Fledgling Guild",
        xpRequired: 1000,
        memberLimit: 10,
        avatarBorderClass: "border-slate-400",
    },
    // Level 2
    {
        level: 2,
        name: "Iron Battalion",
        xpRequired: 2500,
        memberLimit: 15,
        avatarBorderClass: "border-slate-300 shadow-lg shadow-slate-500/20",
        bannerUnlock: "nebula"
    },
    // Level 3
    {
        level: 3,
        name: "Bronze Legion",
        xpRequired: 5000,
        memberLimit: 20,
        avatarBorderClass: "border-amber-600 shadow-lg shadow-amber-600/30",
        bannerUnlock: "synthwave"
    },
    // Level 4
    {
        level: 4,
        name: "Silver Covenant",
        xpRequired: 10000,
        memberLimit: 25,
        avatarBorderClass: "border-slate-300/80 shadow-xl shadow-slate-300/40 animate-[pulse_3s_ease-in-out_infinite]",
        bannerUnlock: "grid"
    },
    // Level 5
    {
        level: 5,
        name: "Golden Order",
        xpRequired: 20000,
        memberLimit: 30,
        avatarBorderClass: "border-yellow-400/80 shadow-2xl shadow-yellow-400/50 animate-[pulse_2s_ease-in-out_infinite]",
        bannerUnlock: "golden"
    },
    // Level 6
    {
        level: 6,
        name: "Platinum Elite",
        xpRequired: 35000,
        memberLimit: 35,
        avatarBorderClass: "border-sky-300/80 shadow-2xl shadow-sky-300/50 animate-[pulse_1.8s_ease-in-out_infinite]",
        bannerUnlock: "oceanic"
    },
    // Level 7
    {
        level: 7,
        name: "Emerald Vanguard",
        xpRequired: 55000,
        memberLimit: 40,
        avatarBorderClass: "border-emerald-400/80 shadow-2xl shadow-emerald-400/50 animate-[pulse_1.6s_ease-in-out_infinite]",
        bannerUnlock: "jungle"
    },
    // Level 8
    {
        level: 8,
        name: "Ruby Sentinels",
        xpRequired: 80000,
        memberLimit: 45,
        avatarBorderClass: "border-red-500/80 shadow-2xl shadow-red-500/50 animate-[pulse_1.4s_ease-in-out_infinite]",
        bannerUnlock: "fiery"
    },
    // Level 9
    {
        level: 9,
        name: "Amethyst Immortals",
        xpRequired: 120000,
        memberLimit: 50,
        avatarBorderClass: "border-purple-500/80 shadow-2xl shadow-purple-500/50 animate-[pulse_1.2s_ease-in-out_infinite]",
        bannerUnlock: "amethyst-haze" // Assuming you add this banner
    },
    // Level 10 (Max Level)
    {
        level: 10,
        name: "Legendary Celestials",
        xpRequired: Infinity, // Max level
        memberLimit: 60,
        avatarBorderClass: "rainbow-border-card", // Special animated border
        bannerUnlock: "rainbow-aurora" // Assuming you add this
    },
];
