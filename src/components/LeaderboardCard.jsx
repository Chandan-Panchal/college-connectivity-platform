import UserBadge from './UserBadge';

export default function LeaderboardCard({ entry, rank }) {
    return (
        <article className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl transition hover:border-white/20 hover:bg-white/10">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-lg font-bold ${
                rank === 1
                    ? 'border-amber-400/30 bg-amber-500/15 text-amber-200'
                    : rank === 2
                        ? 'border-slate-300/30 bg-slate-200/10 text-slate-100'
                        : rank === 3
                            ? 'border-orange-400/30 bg-orange-500/15 text-orange-200'
                            : 'border-white/10 bg-black/20 text-white'
            }`}>
                #{rank}
            </div>

            <div>
                <p className="text-lg font-semibold text-white">{entry.name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <UserBadge points={entry.points} />
                    <span className="text-sm text-white/50">Level {entry.level}</span>
                </div>
            </div>

            <div className="text-right">
                <p className="text-2xl font-bold text-white">{entry.points}</p>
                <p className="text-sm text-white/45">points</p>
            </div>
        </article>
    );
}
