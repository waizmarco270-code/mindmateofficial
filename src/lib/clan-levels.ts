

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
    borderColorClass: string;
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
        avatarBorderClass: "border-slate-700",
        borderColorClass: "border-slate-800",
    },
    // Level 2
    {
        level: 2,
        name: "Level 2",
        description: "Hardened by early trials, the clan's resolve strengthens.",
        xpRequired: 2500,
        memberLimit: 15,
        avatarBorderClass: "border-blue-500",
        borderColorClass: "border-blue-500/50",
        badge: { name: "Pro", class: "clan-badge-pro" },
    },
    // Level 3
    {
        level: 3,
        name: "Level 3",
        description: "A growing force, known in the community for its dedication.",
        xpRequired: 5000,
        memberLimit: 20,
        avatarBorderClass: "border-red-500",
        borderColorClass: "border-red-500/50",
        badge: { name: "Alpha", class: "clan-badge-alpha" },
    },
    // Level 4
    {
        level: 4,
        name: "Level 4",
        description: "A respected and coordinated clan, shining with polished skill.",
        xpRequired: 10000,
        memberLimit: 25,
        avatarBorderClass: "border-slate-300",
        borderColorClass: "border-slate-300/50",
        badge: { name: "Warrior", class: "clan-badge-warrior" },
    },
    // Level 5
    {
        level: 5,
        name: "Level 5",
        description: "An elite clan, whose name is synonymous with excellence and achievement.",
        xpRequired: 20000,
        memberLimit: 30,
        avatarBorderClass: "border-yellow-400",
        borderColorClass: "border-yellow-400/50",
        badge: { name: "Legendary", class: "clan-badge-legendary" },
        bannerUnlock: "custom"
    },
];
