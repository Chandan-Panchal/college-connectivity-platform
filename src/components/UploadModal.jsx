import { useState } from 'react';
import { X, UploadCloud, File, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { addPoints, POINT_REWARDS } from '../lib/gamification';

const SUBJECTS = ['DSA', 'DBMS', 'OS', 'Computer Networks', 'Mathematics', 'Physics', 'Chemistry', 'AI/ML', 'Web Dev', 'Other'];
const RESOURCE_TYPES = [
    { value: 'notes', label: 'Notes' },
    { value: 'pyq', label: 'PYQ' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'book', label: 'Book' },
    { value: 'other', label: 'Other' }
];

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        semester: '1',
        resourceType: 'notes',
        description: ''
    });

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type === 'application/pdf') {
            setFile(selected);
            setError('');
        } else {
            setFile(null);
            setError('Please select a valid PDF file.');
        }
    };

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!file) {
            setError('Please attach a PDF file.');
            return;
        }

        setUploading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

            setProgress(30);

            const { error: uploadError } = await supabase.storage
                .from('resources')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: file.type
                });

            if (uploadError) throw uploadError;
            setProgress(60);

            const { data: { publicUrl } } = supabase.storage
                .from('resources')
                .getPublicUrl(filePath);

            setProgress(80);

            const { error: dbError } = await supabase
                .from('resources')
                .insert([{
                    title: formData.title.trim(),
                    subject: formData.subject,
                    semester: Number(formData.semester),
                    resource_type: formData.resourceType,
                    description: formData.description.trim() || null,
                    file_url: publicUrl,
                    uploaded_by: user.id
                }]);

            if (dbError) {
                await supabase.storage.from('resources').remove([filePath]);

                if (dbError.code === '42501') {
                    throw new Error('Your account is not allowed to upload resources yet. The policy should allow inserts where uploaded_by = auth.uid().');
                }

                throw dbError;
            }

            await addPoints(user.id, POINT_REWARDS.resourceUpload);

            setUploading(false);
            setProgress(0);
            setFile(null);
            setFormData({ title: '', subject: '', semester: '1', resourceType: 'notes', description: '' });
            onUploadSuccess();
            onClose();
        } catch (err) {
            console.error('Upload Error:', err);
            setError(err.message || 'An error occurred during upload.');
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1a1528] border border-white/10 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                <button onClick={onClose} disabled={uploading} className="absolute top-6 right-6 text-white/50 hover:text-white transition">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <UploadCloud className="text-purple-400" /> Share Resource
                </h2>

                {error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/70 text-sm mb-1">Title</label>
                        <input required name="title" value={formData.title} onChange={handleChange} placeholder="E.g. Full DB Architecture Notes"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 transition" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/70 text-sm mb-1">Subject</label>
                            <select required name="subject" value={formData.subject} onChange={handleChange}
                                className="w-full bg-[#1a1528] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 transition appearance-none">
                                <option value="" disabled>Select Subject</option>
                                {SUBJECTS.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm mb-1">Type</label>
                            <select name="resourceType" value={formData.resourceType} onChange={handleChange}
                                className="w-full bg-[#1a1528] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 transition appearance-none">
                                {RESOURCE_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-white/70 text-sm mb-1">Semester</label>
                        <select name="semester" value={formData.semester} onChange={handleChange}
                            className="w-full bg-[#1a1528] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 transition appearance-none">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => <option key={sem} value={sem}>Semester {sem}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-white/70 text-sm mb-1">Description (Optional)</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="2" placeholder="Brief context about the material..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 transition resize-none" />
                    </div>

                    <div className="mt-2">
                        <label className="block text-white/70 text-sm mb-1">PDF Document</label>
                        <div className="border-2 border-dashed border-white/20 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-purple-500/50 transition cursor-pointer relative bg-white/5">
                            <input type="file" accept="application/pdf" onChange={handleFileChange} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            {file ? (
                                <div className="flex flex-col items-center">
                                    <File className="text-purple-400 mb-2" size={32} />
                                    <p className="text-white text-sm font-medium">{file.name}</p>
                                    <p className="text-white/40 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-white/50">
                                    <UploadCloud className="mb-2" size={32} />
                                    <p className="text-sm">Click or drag PDF to upload</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {uploading && (
                        <div className="w-full bg-white/10 rounded-full h-2.5 mt-4 overflow-hidden">
                            <div className="bg-purple-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                    )}

                    <button type="submit" disabled={uploading || !file}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition mt-4 flex items-center justify-center gap-2">
                        {uploading ? `Uploading... ${progress}%` : 'Upload Resource'}
                    </button>
                </form>
            </div>
        </div>
    );
}
