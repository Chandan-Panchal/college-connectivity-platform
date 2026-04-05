import { useState, useEffect } from 'react';
import { Search, Plus, Filter, BookOpen } from 'lucide-react';
import { supabase } from '../supabaseClient';
import ResourceCard from '../components/ResourceCard';
import UploadModal from '../components/UploadModal';

const SUBJECTS = ['DSA', 'DBMS', 'OS', 'Computer Networks', 'Mathematics', 'Physics', 'Chemistry', 'AI/ML', 'Web Dev', 'Other'];
const TYPES = [
    { value: 'notes', label: 'Notes' },
    { value: 'pyq', label: 'PYQ' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'book', label: 'Book' },
    { value: 'other', label: 'Other' }
];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Resources() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [filterSemester, setFilterSemester] = useState('');
    const [filterType, setFilterType] = useState('');

    const fetchResources = async () => {
        const { data, error } = await supabase
            .from('resources')
            .select(`
                id,
                title,
                description,
                subject,
                semester,
                resource_type,
                file_url,
                created_at,
                uploaded_by,
                uploader:users (id, name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching resources:', error);
        } else {
            setResources(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchResources();

        const channel = supabase
            .channel('resources_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, () => {
                fetchResources();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filteredResources = resources.filter((resource) => {
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (resource.subject || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject = filterSubject ? resource.subject === filterSubject : true;
        const matchesSemester = filterSemester ? String(resource.semester) === String(filterSemester) : true;
        const matchesType = filterType ? resource.resource_type === filterType : true;

        return matchesSearch && matchesSubject && matchesSemester && matchesType;
    });

    const handleUploadClick = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Please log in to upload resources.');
            return;
        }
        setIsUploadOpen(true);
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 min-h-screen flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <BookOpen className="text-purple-400" size={36} /> Academic Resources
                    </h1>
                    <p className="text-white/60 text-lg">Browse, search, and share study materials seamlessly.</p>
                </div>

                <button
                    onClick={handleUploadClick}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-6 py-3 rounded-xl flex items-center gap-2 transition shadow-lg shadow-purple-600/20 active:scale-95"
                >
                    <Plus size={20} /> Share Resource
                </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 shadow-xl backdrop-blur-md flex flex-col md:flex-row gap-4 relative z-10">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                    <input
                        type="text"
                        placeholder="Search by title, subject..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1a1528]/80 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-purple-500 transition"
                    />
                </div>

                <div className="flex flex-wrap md:flex-nowrap gap-4">
                    <select
                        value={filterSubject}
                        onChange={(e) => setFilterSubject(e.target.value)}
                        className="flex-1 md:w-36 bg-[#1a1528]/80 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition appearance-none cursor-pointer"
                    >
                        <option value="">All Subjects</option>
                        {SUBJECTS.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                    </select>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="flex-1 md:w-36 bg-[#1a1528]/80 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition appearance-none cursor-pointer"
                    >
                        <option value="">All Types</option>
                        {TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </select>

                    <select
                        value={filterSemester}
                        onChange={(e) => setFilterSemester(e.target.value)}
                        className="flex-1 md:w-36 bg-[#1a1528]/80 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition appearance-none cursor-pointer"
                    >
                        <option value="">All Semesters</option>
                        {SEMESTERS.map((semester) => <option key={semester} value={semester}>Sem {semester}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <div key={n} className="bg-white/5 border border-white/10 rounded-2xl h-56"></div>
                    ))}
                </div>
            ) : filteredResources.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredResources.map((resource) => (
                        <ResourceCard key={resource.id} resource={resource} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="bg-white/5 p-6 rounded-full mb-6 border border-white/10">
                        <Filter size={48} className="text-white/20" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No resources found</h3>
                    <p className="text-white/50 max-w-sm mb-6">
                        We couldn&apos;t find anything matching your current filters. Try adjusting them or clear your search.
                    </p>
                    <button
                        onClick={() => { setSearchQuery(''); setFilterSubject(''); setFilterSemester(''); setFilterType(''); }}
                        className="text-purple-400 hover:text-purple-300 transition font-medium underline-offset-4 hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            )}

            <UploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUploadSuccess={fetchResources}
            />
        </div>
    );
}
