import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, ShoppingBag, Bell, Users, Trophy, Zap } from 'lucide-react';
import useUserPoints from '../hooks/useUserPoints';
import UserBadge from '../components/UserBadge';
import { getProgressToNextLevel } from '../lib/gamification';

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState([
        { label: 'Resources Shared', value: '0', icon: BookOpen, color: 'text-blue-400' },
        { label: 'Items Listed', value: '0', icon: ShoppingBag, color: 'text-green-400' },
        { label: 'Campus Updates', value: '0', icon: Bell, color: 'text-purple-400' },
    ]);
    const { pointsData } = useUserPoints(user?.id);
    const progress = getProgressToNextLevel(pointsData.points);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
            } else {
                setUser(user);

                const [resourcesResult, itemsResult, notificationsResult] = await Promise.all([
                    supabase.from('resources').select('*', { count: 'exact', head: true }).eq('uploaded_by', user.id),
                    supabase.from('marketplace_items').select('*', { count: 'exact', head: true }).eq('seller_id', user.id),
                    supabase.from('notifications').select('*', { count: 'exact', head: true }),
                ]);

                setStats([
                    { label: 'Resources Shared', value: String(resourcesResult.count ?? 0), icon: BookOpen, color: 'text-blue-400' },
                    { label: 'Items Listed', value: String(itemsResult.count ?? 0), icon: ShoppingBag, color: 'text-green-400' },
                    { label: 'Campus Updates', value: String(notificationsResult.count ?? 0), icon: Bell, color: 'text-purple-400' },
                ]);
            }
        };
        getUser();
    }, [navigate]);

    if (!user) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 text-white">
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-purple-600/20 p-3 rounded-2xl">
                    <LayoutDashboard size={32} className="text-purple-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Student Dashboard</h1>
                    <p className="text-white/60">Welcome back, {user.user_metadata?.full_name || user.email}</p>
                </div>
            </div>

            <div className="mb-10 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
                <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                        <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/35">Your profile progress</p>
                        <div className="mb-4 flex flex-wrap items-center gap-3">
                            <h2 className="text-3xl font-bold text-white">Level {pointsData.level}</h2>
                            <UserBadge points={pointsData.points} />
                        </div>
                        <div className="mb-3 flex items-center gap-2 text-white/70">
                            <Zap size={16} className="text-amber-300" />
                            <span>{pointsData.points} total points earned</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-white/10">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-purple-500 to-cyan-400 transition-all duration-500"
                                style={{ width: `${progress.percentage}%` }}
                            />
                        </div>
                        <p className="mt-3 text-sm text-white/50">{progress.remaining} XP to reach the next level.</p>
                    </div>

                    <button
                        onClick={() => navigate('/leaderboard')}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white transition hover:border-amber-400/30 hover:bg-white/10"
                    >
                        <Trophy size={18} className="text-amber-300" />
                        View Leaderboard
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-white/40 text-sm">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => navigate('/resources')} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left transition group">
                            <BookOpen size={20} className="text-purple-400 mb-2 group-hover:scale-110 transition" />
                            <p className="font-medium">Browse Resources</p>
                        </button>
                        <button onClick={() => navigate('/buy-sell')} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left transition group">
                            <ShoppingBag size={20} className="text-green-400 mb-2 group-hover:scale-110 transition" />
                            <p className="font-medium">Buy & Sell</p>
                        </button>
                        <button onClick={() => navigate('/notifications')} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left transition group">
                            <Bell size={20} className="text-blue-400 mb-2 group-hover:scale-110 transition" />
                            <p className="font-medium">Campus Updates</p>
                        </button>
                        <button onClick={() => navigate('/clubs')} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left transition group">
                            <Users size={20} className="text-pink-400 mb-2 group-hover:scale-110 transition" />
                            <p className="font-medium">Explore Clubs</p>
                        </button>
                        <button onClick={() => navigate('/leaderboard')} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left transition group">
                            <Trophy size={20} className="text-amber-300 mb-2 group-hover:scale-110 transition" />
                            <p className="font-medium">Leaderboard</p>
                        </button>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                    <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {stats.map((stat) => (
                            <div key={stat.label} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition border border-transparent hover:border-white/10">
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                    <stat.icon size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{stat.label}</p>
                                    <p className="text-xs text-white/40">{stat.value} total</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
