import { Binary, BrushCleaning, Code2, Shield, Trophy } from 'lucide-react';

export const clubs = [
    {
        id: 'ncc',
        name: 'NCC',
        description: 'Discipline, leadership, and service to the nation.',
        icon: Shield,
        emoji: '🛡️',
        accent: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    },
    {
        id: 'chess',
        name: 'Chess Club',
        description: 'Strategy, tournaments, and mind games.',
        icon: Binary,
        emoji: '♟️',
        accent: 'from-slate-200/20 via-white/10 to-transparent',
    },
    {
        id: 'cas',
        name: 'Creative Art Society',
        description: 'Art, design, creativity, and expression.',
        icon: BrushCleaning,
        emoji: '🎨',
        accent: 'from-pink-500/20 via-rose-500/10 to-transparent',
    },
    {
        id: 'sports',
        name: 'Sports Club',
        description: 'Physical fitness, tournaments, and team spirit.',
        icon: Trophy,
        emoji: '🏆',
        accent: 'from-amber-500/20 via-orange-500/10 to-transparent',
    },
    {
        id: 'coding',
        name: 'Coding Club',
        description: 'Programming, hackathons, and tech innovation.',
        icon: Code2,
        emoji: '💻',
        accent: 'from-violet-500/20 via-purple-500/10 to-transparent',
    },
];

export const clubsById = Object.fromEntries(clubs.map((club) => [club.id, club]));
