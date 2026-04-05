import { useState, useEffect } from 'react';
import { Bell, Plus, Loader2, Info, Search } from 'lucide-react';
import { supabase } from '../supabaseClient';
import NotificationCard from '../components/NotificationCard';
import AddNotificationModal from '../components/AddNotificationModal';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    const fetchNotifications = async () => {
        const { data, error } = await supabase
            .from('notifications')
            .select(`
                id,
                title,
                content,
                attachment_type,
                image_url,
                file_url,
                created_at,
                created_by
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notifications:', error);
        } else {
            setNotifications(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifications();

        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsAdmin(false);
                return;
            }

            const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .maybeSingle();

            if (error) {
                console.error('Role lookup error:', error);
                setIsAdmin(false);
                return;
            }

            setIsAdmin(data?.role === 'admin');
        };

        checkUser();

        const channel = supabase
            .channel('notifications_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
                fetchNotifications();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleDelete = async (id, attachmentUrl) => {
        if (!window.confirm('Are you sure you want to delete this notification?')) return;

        try {
            if (attachmentUrl) {
                const path = attachmentUrl.split('/notifications/')[1];
                if (path) {
                    await supabase.storage.from('notifications').remove([path]);
                }
            }

            const { error } = await supabase.from('notifications').delete().eq('id', id);
            if (error) throw error;
            fetchNotifications();
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete. Please try again.');
        }
    };

    const filtered = notifications.filter((notification) => {
        const matchesFilter = filter === 'All' || notification.attachment_type === filter.toLowerCase();
        const matchesSearch = !searchQuery ||
            notification.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            notification.content?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-white flex items-center gap-3">
                        <Bell className="text-purple-400" size={36} /> Campus Updates
                    </h1>
                    <p className="text-white/60 mt-2 text-lg">Official notices, events, and announcements.</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-2xl transition shadow-lg shadow-purple-600/30 active:scale-95"
                    >
                        <Plus size={22} /> Post Update
                    </button>
                )}
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                    type="text"
                    placeholder="Search updates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-purple-500 transition"
                />
            </div>

            <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                {['All', 'Text', 'Image', 'Pdf'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition border ${
                            filter === tab
                                ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                                : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-purple-400 mb-4" size={40} />
                    <p className="text-white/40 font-medium">Loading updates...</p>
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {filtered.map((notification) => (
                        <NotificationCard
                            key={notification.id}
                            notification={notification}
                            onDelete={handleDelete}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 border-dashed rounded-3xl">
                    <div className="bg-white/5 p-5 rounded-full mb-4">
                        <Info size={40} className="text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No updates found</h3>
                    <p className="text-white/50 text-sm">
                        {searchQuery || filter !== 'All'
                            ? 'Try adjusting your search or filters.'
                            : 'No notifications have been posted yet.'}
                    </p>
                </div>
            )}

            <AddNotificationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUploadSuccess={fetchNotifications}
            />
        </div>
    );
}
