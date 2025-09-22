
export interface LockableFeature {
    id: 'ai-assistant' | 'reward-zone' | 'quiz-zone' | 'social-hub' | 'game-zone' | 'resources' | 'leaderboard' | 'percentage-calculator' | 'timetable-generator' | 'quick-notepad' | 'flashcard-maker';
    name: string;
    description: string;
    defaultCost: number;
}

export const lockableFeatures: LockableFeature[] = [
    {
        id: 'ai-assistant',
        name: 'Marco AI',
        description: 'Your personal AI tutor for instant help.',
        defaultCost: 100,
    },
    {
        id: 'reward-zone',
        name: 'Reward Zone',
        description: 'Claim daily rewards, play games to win credits.',
        defaultCost: 0,
    },
    {
        id: 'quiz-zone',
        name: 'Quiz Zone',
        description: 'Test your knowledge and compete for rewards.',
        defaultCost: 50,
    },
    {
        id: 'social-hub',
        name: 'Social Hub',
        description: 'Connect with friends and the community.',
        defaultCost: 20,
    },
    {
        id: 'game-zone',
        name: 'Game Zone',
        description: 'Relax and earn credits by playing fun games.',
        defaultCost: 0,
    },
    {
        id: 'resources',
        name: 'Resource Library',
        description: 'Access to the main resource library page.',
        defaultCost: 0,
    },
    {
        id: 'leaderboard',
        name: 'Leaderboard',
        description: 'See who is at the top of the rankings.',
        defaultCost: 0,
    },
    {
        id: 'percentage-calculator',
        name: 'Percentage Calculator',
        description: 'A tool to calculate exam percentages.',
        defaultCost: 10,
    },
    {
        id: 'timetable-generator',
        name: 'Timetable Generator',
        description: 'A tool to create personalized study schedules.',
        defaultCost: 25,
    },
    {
        id: 'quick-notepad',
        name: 'Quick Notepad',
        description: 'A simple notepad for quick thoughts and ideas.',
        defaultCost: 0,
    },
    {
        id: 'flashcard-maker',
        name: 'Flashcard Maker',
        description: 'Create and study with digital flashcards.',
        defaultCost: 15,
    }
];
