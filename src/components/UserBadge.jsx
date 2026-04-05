import { getBadgeForPoints } from '../lib/gamification';

export default function UserBadge({ points = 0, className = '' }) {
    const badge = getBadgeForPoints(points);

    return (
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${badge.className} ${className}`}>
            <span aria-hidden="true">{badge.emoji}</span>
            {badge.label}
        </span>
    );
}
