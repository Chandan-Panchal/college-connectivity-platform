import { useEffect, useState } from 'react';
import { PlusCircle, ShoppingBag, X, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { addPoints, POINT_REWARDS } from '../lib/gamification';

export default function BuySell() {
    const [items, setItems] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [newItem, setNewItem] = useState({
        title: '', price: '', imageFile: null, description: '', contactPhone: ''
    });

    const fetchItems = async () => {
        const { data, error: fetchError } = await supabase
            .from('marketplace_items')
            .select(`
                id,
                title,
                description,
                price,
                image_url,
                contact_phone,
                status,
                created_at,
                seller:users!marketplace_items_seller_id_fkey (
                    id,
                    name
                )
            `)
            .order('created_at', { ascending: false });

        if (fetchError) {
            console.error('Marketplace fetch error:', fetchError);
            setError(fetchError.message);
        } else {
            setItems(data || []);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleAddItem = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Please log in to create a listing.');

            let imageUrl = null;

            if (newItem.imageFile) {
                const fileExt = newItem.imageFile.name.split('.').pop();
                const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('marketplace')
                    .upload(filePath, newItem.imageFile, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: newItem.imageFile.type
                    });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('marketplace')
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            }

            const { error: insertError } = await supabase
                .from('marketplace_items')
                .insert({
                    title: newItem.title.trim(),
                    description: newItem.description.trim() || null,
                    price: Number(newItem.price),
                    image_url: imageUrl,
                    seller_id: user.id,
                    contact_phone: newItem.contactPhone.trim() || null,
                });

            if (insertError) throw insertError;

            await addPoints(user.id, POINT_REWARDS.marketplacePost);

            setIsFormOpen(false);
            setNewItem({ title: '', price: '', imageFile: null, description: '', contactPhone: '' });
            fetchItems();
        } catch (err) {
            console.error('Marketplace create error:', err);
            setError(err.message || 'Failed to post item.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <ShoppingBag className="text-purple-400" size={32} />
                        Campus Marketplace
                    </h2>
                    <p className="text-white/60 mt-2">Buy and sell college essentials safely.</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl transition"
                >
                    <PlusCircle size={20} />
                    List an Item
                </button>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1a1528] border border-white/10 rounded-3xl p-6 w-full max-w-lg relative shadow-2xl">
                        <button
                            onClick={() => setIsFormOpen(false)}
                            className="absolute top-4 right-4 text-white/50 hover:text-white transition"
                        >
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-semibold text-white mb-6">List a New Item</h3>

                        <form onSubmit={handleAddItem} className="space-y-4">
                            {error && (
                                <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                                    <AlertCircle size={16} className="mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}
                            <div>
                                <label className="block text-white/70 text-sm mb-1">Item Name</label>
                                <input required type="text" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-purple-500 transition" placeholder="e.g., Engineering Drawing Kit" />
                            </div>
                            <div>
                                <label className="block text-white/70 text-sm mb-1">Price</label>
                                <input required type="number" min="0" step="0.01" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-purple-500 transition" placeholder="e.g., 500" />
                            </div>
                            <div>
                                <label className="block text-white/70 text-sm mb-1">Upload Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setNewItem({ ...newItem, imageFile: file });
                                        }
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white/70 outline-none focus:border-purple-500 transition file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer file:transition"
                                />
                            </div>
                            <div>
                                <label className="block text-white/70 text-sm mb-1">Contact No.</label>
                                <input required type="text" value={newItem.contactPhone} onChange={(e) => setNewItem({ ...newItem, contactPhone: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-purple-500 transition" placeholder="+91 XXXXXXXXXX" />
                            </div>
                            <div>
                                <label className="block text-white/70 text-sm mb-1">Description</label>
                                <textarea required value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-purple-500 transition h-24 resize-none" placeholder="Condition, usage, etc."></textarea>
                            </div>
                            <button type="submit" disabled={submitting} className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition mt-4">
                                {submitting ? 'Posting Item...' : 'Post Item'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20 text-white/60">
                    <Loader2 className="animate-spin mr-3" size={20} />
                    Loading marketplace...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition group">
                            <div className="h-48 overflow-hidden relative bg-white/5">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/30">No image</div>
                                )}
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white font-semibold border border-white/10">
                                    INR {Number(item.price).toLocaleString('en-IN')}
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                                <p className="text-white/60 text-sm mb-4 line-clamp-2">{item.description}</p>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                                    <div className="text-sm">
                                        <p className="text-white/50">Seller</p>
                                        <p className="text-white font-medium">{item.seller?.name || 'Student'}</p>
                                    </div>
                                    <div className="text-sm text-right">
                                        <p className="text-white/50">Contact</p>
                                        <p className="text-purple-400 font-medium">{item.contact_phone || 'Not shared'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
