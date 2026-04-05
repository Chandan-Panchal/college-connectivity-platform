import { useEffect, useState } from 'react';
import { Crown, Medal, Trophy } from 'lucide-react';
import { supabase } from '../supabaseClient';
import LeaderboardCard from '../components/LeaderboardCard';

export default function Leaderboard() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchLeaderboard = async () => {
            const { data, error } = await supabase
                .from('user_points')
                .select(`
                    user_id,
                    points,
                    level,
                    user:users!user_points_user_id_fkey (
                        name
                    )
                `)
                .order('points', { ascending: false })
                .limit(25);

            if (!isMounted) {
                return;
            }

            if (error) {
                console.error('Leaderboard fetch error:', error);
                setEntries([]);
            } else {
                setEntries((data || []).map((entry) => ({
                    userId: entry.user_id,
                    points: entry.points ?? 0,
                    level: entry.level ?? 1,
                    name: entry.user?.name || 'Student',
                })));
            }

            setLoading(false);
        };

        fetchLeaderboard();

        const channel = supabase
            .channel('leaderboard-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'user_points' }, () => {
                fetchLeaderboard();
            })
            .subscribe();

        return () => {
            isMounted = false;
            supabase.removeChannel(channel);
        };
    }, []);

    const topThree = entries.slice(0, 3);

    return (
        <div className="mx-auto min-h-screen max-w-5xl px-6 py-12 text-white">
            <section className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
                    <Trophy size={16} />
                    Campus leaderboard
                </div>
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Top Contributors</h1>
                <p className="mt-3 max-w-2xl text-white/65">
                    Track the most active students across resources, marketplace listings, and campus updates in real time.
                </p>
            </section>

            <section className="mb-8 grid gap-4 md:grid-cols-3">
                {topThree.map((entry, index) => (
                    <div key={entry.userId} className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-2xl">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-black/20 text-amber-200">
                            {index === 0 ? <Crown size={26} /> : <Medal size={24} />}
                        </div>
                        <p className="text-sm uppercase tracking-[0.2em] text-white/40">#{index + 1}</p>
                        <h2 className="mt-2 text-2xl font-semibold">{entry.name}</h2>
                        <p className="mt-2 text-white/60">Level {entry.level}</p>
                        <p className="mt-4 text-3xl font-bold text-white">{entry.points}</p>
                        <p className="text-sm text-white/45">points</p>
                    </div>
                ))}
            </section>

            <section className="space-y-4">
                {loading ? (
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/50 backdrop-blur-2xl">
                        Loading leaderboard...
                    </div>
                ) : entries.length > 0 ? (
                    entries.map((entry, index) => (
                        <LeaderboardCard key={entry.userId} entry={entry} rank={index + 1} />
                    ))
                ) : (
                    <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-white/55 backdrop-blur-2xl">
                        No leaderboard activity yet. Once users start posting, rankings will appear here.
                    </div>
                )}
            </section>
        </div>
    );
}
