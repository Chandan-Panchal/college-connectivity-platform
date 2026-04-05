import { useState } from 'react';
import { X, UploadCloud, Bell, File, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { addPoints, POINT_REWARDS } from '../lib/gamification';

export default function AddNotificationModal({ isOpen, onClose, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        attachmentType: 'text'
    });

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;

        if (selected.type.startsWith('image/')) {
            setFormData((prev) => ({ ...prev, attachmentType: 'image' }));
        } else if (selected.type === 'application/pdf') {
            setFormData((prev) => ({ ...prev, attachmentType: 'pdf' }));
        }
        setFile(selected);
        setError('');
    };

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (e.target.name === 'attachmentType' && e.target.value === 'text') {
            setFile(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.title.trim()) {
            setError('Title is required.');
            return;
        }
        if (formData.attachmentType !== 'text' && !file) {
            setError(`Please attach ${formData.attachmentType === 'image' ? 'an image' : 'a PDF'} file.`);
            return;
        }

        setUploading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Please log in to post updates.');

            let imageUrl = null;
            let fileUrl = null;

            if (file) {
                const fileExt = file.name.split('.').pop();
                const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

                setProgress(30);
                const { error: uploadError } = await supabase.storage
                    .from('notifications')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: file.type
                    });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('notifications')
                    .getPublicUrl(filePath);

                if (formData.attachmentType === 'image') {
                    imageUrl = publicUrl;
                } else if (formData.attachmentType === 'pdf') {
                    fileUrl = publicUrl;
                }
                setProgress(60);
            }

            const { error: dbError } = await supabase
                .from('notifications')
                .insert([{
                    created_by: user.id,
                    title: formData.title.trim(),
                    content: formData.content.trim() || null,
                    attachment_type: formData.attachmentType,
                    image_url: imageUrl,
                    file_url: fileUrl
                }]);

            if (dbError) {
                const attachmentUrl = imageUrl || fileUrl;
                if (attachmentUrl) {
                    const path = attachmentUrl.split('/notifications/')[1];
                    if (path) {
                        await supabase.storage.from('notifications').remove([path]);
                    }
                }

                if (dbError.code === '42501') {
                    throw new Error('Only admin accounts can post updates.');
                }

                throw dbError;
            }

            await addPoints(user.id, POINT_REWARDS.updatePost);

            setProgress(100);
            setTimeout(() => {
                setUploading(false);
                setProgress(0);
                setFile(null);
                setFormData({ title: '', content: '', attachmentType: 'text' });
                onUploadSuccess();
                onClose();
            }, 400);
        } catch (err) {
            console.error('Post Error:', err);
            setError(err.message || 'An error occurred.');
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1a1528] border border-white/10 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative">
                <button onClick={onClose} disabled={uploading} className="absolute top-6 right-6 text-white/50 hover:text-white transition">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Bell className="text-purple-400" /> Post New Update
                </h2>

                {error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/70 text-sm mb-1">Title *</label>
                        <input required name="title" value={formData.title} onChange={handleChange}
                            placeholder="E.g. Final Exam Schedule Released"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 transition" />
                    </div>

                    <div>
                        <label className="block text-white/70 text-sm mb-1">Description</label>
                        <textarea name="content" value={formData.content} onChange={handleChange} rows="3"
                            placeholder="Add details about this update..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 transition resize-none" />
                    </div>

                    <div>
                        <label className="block text-white/70 text-sm mb-1">Type</label>
                        <select name="attachmentType" value={formData.attachmentType} onChange={handleChange}
                            className="w-full bg-[#1a1528] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 transition appearance-none cursor-pointer">
                            <option value="text">Text Only</option>
                            <option value="image">Image</option>
                            <option value="pdf">PDF Document</option>
                        </select>
                    </div>

                    {formData.attachmentType !== 'text' && (
                        <div>
                            <label className="block text-white/70 text-sm mb-1">
                                {formData.attachmentType === 'image' ? 'Upload Image (JPG, PNG)' : 'Upload PDF'}
                            </label>
                            <div className="border border-dashed border-white/20 rounded-xl p-4 flex flex-col items-center justify-center hover:border-purple-500/50 transition cursor-pointer relative bg-white/5">
                                <input
                                    type="file"
                                    accept={formData.attachmentType === 'image' ? 'image/jpeg,image/png,image/gif' : 'application/pdf'}
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {file ? (
                                    <div className="flex items-center gap-3">
                                        <File className="text-purple-400" size={20} />
                                        <div>
                                            <p className="text-white text-sm truncate max-w-[250px]">{file.name}</p>
                                            <p className="text-white/40 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-white/40">
                                        <UploadCloud size={24} className="mb-1" />
                                        <p className="text-sm">Click to attach {formData.attachmentType === 'image' ? 'an image' : 'a PDF'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {uploading && (
                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    )}

                    <button type="submit" disabled={uploading}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition mt-2 flex items-center justify-center gap-2">
                        {uploading ? `Posting... ${progress}%` : 'Post Update'}
                    </button>
                </form>
            </div>
        </div>
    );
}
