

export interface ClanLevelBadge {
    name: string;
    class: string;
}

export interface ClanLevel {
    level: number;
    name: string;
    description: string;
    xpRequired: number;
    memberLimit: number;
    avatarBorderClass: string;
    badge?: ClanLevelBadge;
    bannerUnlock?: string; // ID of the banner from group-assets
}

export const clanLevelConfig: ClanLevel[] = [
    // Level 1 (Starting Level)
    {
        level: 1,
        name: "Level 1",
        description: "The beginning of a new journey. A small group with great potential.",
        xpRequired: 1000,
        memberLimit: 10,
        avatarBorderClass: "border-slate-400",
    },
    // Level 2
    {
        level: 2,
        name: "Level 2",
        description: "Hardened by early trials, the clan's resolve strengthens.",
        xpRequired: 2500,
        memberLimit: 15,
        avatarBorderClass: "border-blue-400 shadow-lg shadow-blue-500/20",
        badge: { name: "Pro", class: "clan-badge-pro" },
        bannerUnlock: "banner-sunflower"
    },
    // Level 3
    {
        level: 3,
        name: "Level 3",
        description: "A growing force, known in the community for its dedication.",
        xpRequired: 5000,
        memberLimit: 20,
        avatarBorderClass: "border-red-400 shadow-lg shadow-red-500/30",
        badge: { name: "Alpha", class: "clan-badge-alpha" },
        bannerUnlock: "banner-forest"
    },
    // Level 4
    {
        level: 4,
        name: "Level 4",
        description: "A respected and coordinated clan, shining with polished skill.",
        xpRequired: 10000,
        memberLimit: 25,
        avatarBorderClass: "border-slate-300/80 shadow-xl shadow-slate-300/40 animate-[pulse_3s_ease-in-out_infinite]",
        badge: { name: "Warrior", class: "clan-badge-warrior" },
        bannerUnlock: "banner-shiny"
    },
    // Level 5
    {
        level: 5,
        name: "Level 5",
        description: "An elite clan, whose name is synonymous with excellence and achievement.",
        xpRequired: 20000,
        memberLimit: 30,
        avatarBorderClass: "border-yellow-400/80 shadow-2xl shadow-yellow-400/50 animate-[pulse_2s_ease-in-out_infinite]",
        badge: { name: "Legendary", class: "clan-badge-legendary" },
        bannerUnlock: "custom"
    },
];
