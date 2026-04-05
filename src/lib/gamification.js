import { supabase } from '../supabaseClient';

export const POINT_REWARDS = {
    resourceUpload: 10,
    marketplacePost: 5,
    updatePost: 5,
};

export const LEVEL_STEP = 50;

export function getLevelFromPoints(points = 0) {
    return Math.floor(points / LEVEL_STEP) + 1;
}

export function getBadgeForPoints(points = 0) {
    if (points >= 200) {
        return {
            label: 'Legend',
            emoji: '🥇',
            className: 'border-amber-400/30 bg-amber-500/15 text-amber-200',
        };
    }

    if (points >= 100) {
        return {
            label: 'Pro',
            emoji: '🥈',
            className: 'border-slate-300/30 bg-slate-200/10 text-slate-100',
        };
    }

    if (points >= 50) {
        return {
            label: 'Beginner',
            emoji: '🥉',
            className: 'border-orange-400/30 bg-orange-500/15 text-orange-200',
        };
    }

    return {
        label: 'Newbie',
        emoji: '😄',
        className: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200',
    };
}

export function getProgressToNextLevel(points = 0) {
    const progress = points % LEVEL_STEP;
    const percentage = (progress / LEVEL_STEP) * 100;

    return {
        current: progress,
        target: LEVEL_STEP,
        percentage,
        remaining: LEVEL_STEP - progress,
    };
}

export async function addPoints(userId, pointsToAdd) {
    if (!userId || !pointsToAdd) {
        return { success: false, points: 0, level: 1 };
    }

    const { data, error } = await supabase.rpc('add_points', {
        target_user_id: userId,
        points_to_add: pointsToAdd,
    });

    if (error) {
        throw error;
    }

    const nextPoints = data?.points ?? 0;
    const nextLevel = data?.level ?? getLevelFromPoints(nextPoints);

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('points-earned', {
            detail: {
                amount: pointsToAdd,
                points: nextPoints,
                level: nextLevel,
            },
        }));
    }

    return { success: true, points: nextPoints, level: nextLevel };
}
